# Usdt.z – Solana Trading Bot

Automated SOL ↔ USDT.z trading bot using the [Jupiter V6 aggregator](https://station.jup.ag/docs/apis/swap-api).
It buys USDT.z with a fixed SOL amount, monitors the position, and exits at a configurable take-profit or stop-loss threshold.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Create the bot wallet keypair
npm run create-wallet

# 3. Copy and fill in the config
cp .env.example .env
# edit .env – set RPC_URL, USDTZ_MINT, fund the bot wallet from Phantom

# 4. Run in dry-run mode first (no real transactions)
DRY_RUN=1 npm start

# 5. Go live
DRY_RUN=0 npm start
```

## Configuration (`.env`)

| Variable         | Default  | Description |
|-----------------|----------|-------------|
| `RPC_URL`        | —        | Solana RPC endpoint |
| `WALLET_PATH`    | `keys/bot-wallet.json` | Path to bot keypair JSON |
| `SOL_MINT`       | `So111…` | Wrapped SOL mint (fixed) |
| `USDTZ_MINT`     | —        | USDT.z mint address on mainnet |
| `ENTRY_SOL`      | `0.01`   | SOL to spend per trade |
| `TAKE_PROFIT_PCT`| `1.5`    | Exit when position gains this % |
| `STOP_LOSS_PCT`  | `-0.5`   | Exit when position loses this % (negative) |
| `SLIPPAGE_BPS`   | `100`    | Slippage tolerance (1 bps = 0.01%) |
| `DRY_RUN`        | `1`      | `1` = simulate only, `0` = live trading |
| `POLL_MS`        | `5000`   | Price-check interval in milliseconds |

## How it works

1. **IDLE** – fetches a Jupiter quote for SOL → USDT.z and executes the buy.
2. **IN POSITION** – every `POLL_MS` ms it fetches a quote for USDT.z → SOL to measure the current value of the position.
3. If the return exceeds `ENTRY_SOL × (1 + TAKE_PROFIT_PCT/100)` → **take-profit sell**.
4. If the return falls below `ENTRY_SOL × (1 + STOP_LOSS_PCT/100)` → **stop-loss sell**.
5. After closing, returns to IDLE and opens a new position.

---

## Bot wallet setup (Phantom funding workflow)

This bot does **not** connect to Phantom directly. Instead:
1) Generate a **separate local bot wallet keypair** (JSON file).
2) **Fund the bot wallet** from Phantom with a small amount.
3) The bot signs transactions locally using the keypair file.

### Security warnings
- Do **not** use your main Phantom wallet for automation.
- Only fund the bot wallet with what you can afford to lose.
- Never commit your keypair JSON to GitHub.

---

## Windows + WSL2 (Ubuntu) setup

### 1) Install WSL2 + Ubuntu
PowerShell (Admin):
```powershell
wsl --install
