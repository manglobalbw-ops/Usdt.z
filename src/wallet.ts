import { readFileSync } from 'fs';
import { Keypair } from '@solana/web3.js';

const loadKeypair = (path) => {
    const secretKeyData = readFileSync(path);
    const secretKey = JSON.parse(secretKeyData);
    return Keypair.fromSecretKey(new Uint8Array(secretKey));
};

export { loadKeypair };