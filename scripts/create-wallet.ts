import { Keypair } from "@solana/web3.js";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function hasFlag(flag: string) {
  return process.argv.slice(2).includes(flag);
}

function main() {
  const outDir = join(process.cwd(), "keys");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const outPath = join(outDir, "bot-wallet.json");

  const force = hasFlag("--force") || process.env.WALLET_FORCE === "1";

  if (existsSync(outPath) && !force) {
    const raw = readFileSync(outPath, "utf8");
    const secretKeyArray = JSON.parse(raw) as number[];
    const kp = Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));

    console.log("Wallet already exists (reusing):", outPath);
    console.log("Public address:", kp.publicKey.toBase58());
    console.log("To rotate/overwrite, run: npm run create-wallet -- --force");
    console.log("Or set WALLET_FORCE=1");
    console.log("WARNING: keep this file secret. Do not commit it.");
    return;
  }

  const kp = Keypair.generate();
  writeFileSync(outPath, JSON.stringify(Array.from(kp.secretKey)));

  console.log("Saved keypair to:", outPath);
  console.log("Public address:", kp.publicKey.toBase58());
  console.log("WARNING: keep this file secret. Do not commit it.");
}

main();