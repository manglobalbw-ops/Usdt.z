{
  "name": "usdtz-solana-bot",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "create-wallet": "tsx scripts/create-wallet.ts",
    "build": "tsc -p tsconfig.json",
    "test": "vitest run",
    "lint": "node -e \"console.log('lint: (placeholder)')\""
  },# Usdt.z

## Bot wallet setup (Phantom funding workflow)

This bot does **not** connect to Phantom directly. Instead:
1) You generate a **separate local bot wallet keypair** (JSON file).
2) You **fund the bot wallet** from Phantom with a small amount.
3) The bot signs transactions locally using the keypair file.

### Security warnings
- Do **not** use your main Phantom wallet for automation.
- Only fund the bot wallet with what you can afford to lose.
- Never commit your keypair JSON to GitHub.

---

## Windows + WSL2 (Ubuntu) setup

### 1) Install WSL2 + Ubuntu
Open **PowerShell (Admin)**:
```powershell
wsl --install
  "dependencies": {
    "@solana/web3.js": "^1.98.0"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.5.0",
    "vitest": "^1.6.0"
  }
}
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["scripts/**/*.ts", "src/**/*.ts"]
}import { Keypair } from "@solana/web3.js";
import fs from "node:fs";
import path from "node:path";

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag
