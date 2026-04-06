// src/index.ts
// Main trading bot entry point: polls Jupiter, buys USDT.z with SOL,
// then monitors the position and exits at take-profit or stop-loss.
import { Connection, VersionedTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { config } from './config.js';
import { loadKeypair } from './wallet.js';
import { getQuote, buildSwapTransaction } from './jupiter.js';
// ── validation ────────────────────────────────────────────────────────────────
function requireEnv(name, value) {
    if (!value)
        throw new Error(`Missing required env var: ${name}`);
    return value;
}
const RPC_URL = requireEnv('RPC_URL', config.RPC_URL);
const WALLET_PATH = requireEnv('WALLET_PATH', config.WALLET_PATH);
const SOL_MINT = requireEnv('SOL_MINT', config.SOL_MINT);
const USDTZ_MINT = requireEnv('USDTZ_MINT', config.USDTZ_MINT);
// ── helpers ───────────────────────────────────────────────────────────────────
/** Sleep for `ms` milliseconds. */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** Compute price = outAmount / inAmount (both as floats). */
function quotePrice(quote) {
    return Number(quote.outAmount) / Number(quote.inAmount);
}
/** Execute a Jupiter swap; in dry-run mode logs the quote and returns undefined. */
async function executeSwap(quote, walletPubkey, connection, keypair, dryRun) {
    if (dryRun) {
        const price = quotePrice(quote);
        console.log(`[DRY-RUN] Would swap ${quote.inAmount} ${quote.inputMint} → ${quote.outAmount} ${quote.outputMint} (price ${price.toFixed(6)})`);
        return undefined;
    }
    const { swapTransaction, lastValidBlockHeight } = await buildSwapTransaction(quote, walletPubkey);
    const txBytes = Buffer.from(swapTransaction, 'base64');
    const tx = VersionedTransaction.deserialize(txBytes);
    tx.sign([keypair]);
    const sig = await connection.sendRawTransaction(tx.serialize(), {
        skipPreflight: false,
        maxRetries: 3,
    });
    const { blockhash } = await connection.getLatestBlockhash();
    await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed');
    return sig;
}
// ── main loop ─────────────────────────────────────────────────────────────────
async function main() {
    const connection = new Connection(RPC_URL, 'confirmed');
    const keypair = loadKeypair(WALLET_PATH);
    const walletPubkey = keypair.publicKey.toBase58();
    const entrySolLamports = BigInt(Math.round(config.ENTRY_SOL * LAMPORTS_PER_SOL));
    const takeProfitMul = 1 + config.TAKE_PROFIT_PCT / 100;
    const stopLossMul = 1 + config.STOP_LOSS_PCT / 100; // STOP_LOSS_PCT is negative
    console.log('=== Usdt.z Trading Bot ===');
    console.log(`Wallet  : ${walletPubkey}`);
    console.log(`Entry   : ${config.ENTRY_SOL} SOL`);
    console.log(`TP / SL : +${config.TAKE_PROFIT_PCT}% / ${config.STOP_LOSS_PCT}%`);
    console.log(`Dry run : ${config.DRY_RUN}`);
    console.log(`Poll    : ${config.POLL_MS} ms`);
    console.log('─────────────────────────────────────────');
    let position = null;
    while (true) {
        try {
            if (position === null) {
                // ── No open position: look to buy ─────────────────────────────
                console.log('[IDLE] Fetching buy quote (SOL → USDTZ)…');
                const buyQuote = await getQuote(SOL_MINT, USDTZ_MINT, entrySolLamports, config.SLIPPAGE_BPS);
                const entryPrice = quotePrice(buyQuote);
                console.log(`[IDLE] Quote: ${config.ENTRY_SOL} SOL → ${buyQuote.outAmount} USDTZ units ` +
                    `(price ${entryPrice.toFixed(6)} USDTZ/lamport, impact ${buyQuote.priceImpactPct}%)`);
                const sig = await executeSwap(buyQuote, walletPubkey, connection, keypair, config.DRY_RUN);
                if (!config.DRY_RUN && sig) {
                    console.log(`[BUY] Confirmed: ${sig}`);
                }
                position = {
                    entrySolLamports,
                    entryUsdtzUnits: BigInt(buyQuote.outAmount),
                    entryPrice,
                };
                console.log(`[POSITION OPEN] Entry price ${entryPrice.toFixed(6)} | TP @ ${(entryPrice * takeProfitMul).toFixed(6)} | SL @ ${(entryPrice * stopLossMul).toFixed(6)}`);
            }
            else {
                // ── In a position: monitor price ──────────────────────────────
                const { entrySolLamports: entSol, entryUsdtzUnits, entryPrice } = position;
                // Quote USDTZ → SOL to measure current SOL value
                const sellQuote = await getQuote(USDTZ_MINT, SOL_MINT, entryUsdtzUnits, config.SLIPPAGE_BPS);
                const currentReturnSol = Number(sellQuote.outAmount); // lamports
                const pnlPct = ((currentReturnSol - Number(entSol)) / Number(entSol)) * 100;
                console.log(`[MONITOR] PnL ${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}% | ` +
                    `Return ${(currentReturnSol / LAMPORTS_PER_SOL).toFixed(6)} SOL`);
                const shouldTakeProfit = currentReturnSol >= Number(entSol) * takeProfitMul;
                const shouldStopLoss = currentReturnSol <= Number(entSol) * stopLossMul;
                if (shouldTakeProfit || shouldStopLoss) {
                    const reason = shouldTakeProfit ? 'TAKE-PROFIT' : 'STOP-LOSS';
                    console.log(`[${reason}] Executing sell…`);
                    const sig = await executeSwap(sellQuote, walletPubkey, connection, keypair, config.DRY_RUN);
                    if (!config.DRY_RUN && sig) {
                        console.log(`[SELL] Confirmed: ${sig}`);
                    }
                    console.log(`[POSITION CLOSED] Reason: ${reason} | Final PnL: ${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%`);
                    position = null;
                }
            }
        }
        catch (err) {
            console.error('[ERROR]', err instanceof Error ? err.message : err);
        }
        await sleep(config.POLL_MS);
    }
}
main().catch((err) => {
    console.error('[FATAL]', err);
    process.exit(1);
});
