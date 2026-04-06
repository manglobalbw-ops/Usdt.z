import { readFileSync } from 'fs';
import { Keypair } from '@solana/web3.js';
const loadKeypair = (path) => {
    const secretKey = JSON.parse(readFileSync(path, 'utf8'));
    return Keypair.fromSecretKey(new Uint8Array(secretKey));
};
export { loadKeypair };
