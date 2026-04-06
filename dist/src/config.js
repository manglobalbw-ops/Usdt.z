// src/config.ts
export const config = {
    RPC_URL: process.env.RPC_URL,
    WALLET_PATH: process.env.WALLET_PATH,
    SOL_MINT: process.env.SOL_MINT,
    USDTZ_MINT: process.env.USDTZ_MINT,
    ENTRY_SOL: parseFloat(process.env.ENTRY_SOL ?? '') || 0.01,
    TAKE_PROFIT_PCT: parseFloat(process.env.TAKE_PROFIT_PCT ?? '') || 1.5,
    STOP_LOSS_PCT: parseFloat(process.env.STOP_LOSS_PCT ?? '') || -0.5,
    SLIPPAGE_BPS: parseInt(process.env.SLIPPAGE_BPS ?? '') || 100,
    DRY_RUN: process.env.DRY_RUN === '1',
    POLL_MS: parseInt(process.env.POLL_MS ?? '') || 5000,
};
