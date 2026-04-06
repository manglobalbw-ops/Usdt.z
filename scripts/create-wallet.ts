import { Keypair } from "@solana/web3.js";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

function main() {
  const kp = Keypair.generate();

  const outDir = join(process.cwd(), "keys");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const outPath = join(outDir, "bot-wallet.json");
  writeFileSync(outPath, JSON.stringify(Array.from(kp.secretKey)));

  console.log("Saved keypair to:", outPath);
  console.log("Public address:", kp.publicKey.toBase58());
  console.log("WARNING: keep this file secret. Do not commit it.");
}

main();