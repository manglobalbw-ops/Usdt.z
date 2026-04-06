// src/jupiter.ts
// Jupiter V6 REST API helpers
const JUPITER_QUOTE_API = 'https://quote-api.jup.ag/v6';
/**
 * Fetch a swap quote from Jupiter.
 * @param inputMint  - mint address of the token being sold
 * @param outputMint - mint address of the token being bought
 * @param amountLamports - integer amount in the input token's smallest unit
 * @param slippageBps    - slippage tolerance in basis points
 */
export async function getQuote(inputMint, outputMint, amountLamports, slippageBps) {
    const url = new URL(`${JUPITER_QUOTE_API}/quote`);
    url.searchParams.set('inputMint', inputMint);
    url.searchParams.set('outputMint', outputMint);
    url.searchParams.set('amount', amountLamports.toString());
    url.searchParams.set('slippageBps', slippageBps.toString());
    const res = await fetch(url.toString());
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Jupiter quote failed (${res.status}): ${body}`);
    }
    return res.json();
}
/**
 * Build a swap transaction via Jupiter.
 * Returns a base64-encoded versioned transaction ready to sign.
 */
export async function buildSwapTransaction(quoteResponse, userPublicKey) {
    const res = await fetch(`${JUPITER_QUOTE_API}/swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            quoteResponse,
            userPublicKey,
            wrapAndUnwrapSol: true,
            dynamicComputeUnitLimit: true,
            prioritizationFeeLamports: 'auto',
        }),
    });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Jupiter swap build failed (${res.status}): ${body}`);
    }
    return res.json();
}
