# Usdt.z

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