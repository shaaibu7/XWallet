# 💼 XWallet — Shared Wallets for Families and Organizations (Built on Stablecoins)

XWallet is a decentralized shared wallet platform designed for **families** and **organizations** to manage finances collaboratively using **stablecoins**. It enables features like spend limits, reimbursements, role-based access, and controlled spending—all while leveraging the stability and transparency of blockchain.

---

## 🚀 Features

- 👨‍👩‍👧‍👦 **Shared Wallets for Families**
  - Parents can register wallets for children
  - Set spend limits and review activity
  - Reimburse wallet members instantly

- 🏢 **Organization Wallets**
  - Teams and DAOs can fund wallets for contributors
  - Reimburse individuals or groups
  - Track spend behavior with dashboards

- 💰 **Stablecoin Integration**
  - All transactions use stablecoins (e.g., USDC)
  - No volatility; just stable value transfer

- 🧾 **Reimbursement System**
  - Reimburse members or the whole organization wallet
  - Track who got reimbursed and how much

- 📊 **Spending Dashboard**
  - Visual analytics on wallet balance, spend patterns
  - Set daily/weekly/monthly limits

---

## 📱 Pages Overview

| Page | Description |
|------|-------------|
| **Home** | Project landing page and overview |
| **Wallet/Dashboard** | User dashboard with wallet balance, spend limits, and activity |
| **Register Wallet** | Admin page to register new family or org wallets |
| **Reimburse Member** | Reimburse individual wallet holders |
| **Reimburse Organization** | Bulk or org-level reimbursements |
| **Spend Page** | For registered users to spend within their allowed limits |

---

## 🧩 Built With

- **Frontend:** React.js, Tailwind CSS, Mantine UI
- **Backend:** Solidity (Smart Contracts), Node.js
- **Blockchain:** Ethereum or compatible EVM chain
- **Wallet:** MetaMask / WalletConnect Integration
- **Stablecoin:** USDC (or configurable)

---

## 📌 Why XWallet?

Traditional wallets lack shared access and oversight. XWallet bridges that gap by enabling **transparent**, **limit-based**, and **collaborative** wallets. Perfect for:

- Families giving kids safe spending access
- Organizations reimbursing employees or contributors
- Clubs, DAOs, and remote teams

All powered by **stablecoins**, ensuring predictability and usability.

---

## 🧱 Architecture

[Frontend (React)] ---> [Smart Contracts (Solidity)] ---> [Stablecoin (USDC)]
| | |
User Interaction Access Control Stable Transactions
| ↓ ↓
MetaMask / WalletConnect --- Blockchain Network (EVM)


---

## 🧪 Running the Project Locally

1. **Clone the Repo**
   ```bash
   git clone https://github.com/yourusername/xwallet.git
   cd xwallet
   cd frontend
   npm install
   npm run dev

2. **Configure Wallet**

   Connect MetaMask to your local network or testnet

   Deploy smart contracts using Hardhat or Remix