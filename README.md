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
  },
  "dependencies": {
    "@solana/web3.js": "^1.98.0"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.5.0",
    "vitest": "^1.6.0"
  }
}
