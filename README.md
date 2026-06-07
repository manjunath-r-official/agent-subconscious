# 🧠 Agent Subconscious

> *"Every AI agent today wakes up with amnesia. We gave agents the ability to think while they sleep — and remember it on-chain."*

![Monad](https://img.shields.io/badge/Monad-Testnet-7C3AED?style=for-the-badge)
![Sarvam AI](https://img.shields.io/badge/Sarvam_AI-sarvam--105b-00A86B?style=for-the-badge)
![Solidity](https://img.shields.io/badge/Solidity-0.8.19-363636?style=for-the-badge)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-v22-339933?style=for-the-badge)

---

## 🧩 The Problem

Every AI agent starts cold. No memory. No background reasoning. No context from previous observations. Every single invocation begins from absolute zero — like waking up with amnesia every time.

The organizers of Monad Blitz V4 said it best:

> *"Execution is autonomous. Identity, ownership, **memory**, trust, and coordination still aren't."*

We picked **memory**. And we solved it.

---

## 💡 The Solution

**Agent Subconscious** is the first persistent on-chain memory layer for AI agents.

A background subconscious loop runs every 5 minutes — powered by **Sarvam AI (sarvam-105b)** — observing live ETH market data, forming compressed reasoning snapshots, and writing them **immutably to a Monad smart contract**.

When a user invokes the main agent, it loads the last 12 on-chain thoughts and responds like a trader who never looked away — not a cold-start assistant answering from zero.

---

## 🎯 Why Monad?

Writing hundreds of reasoning snapshots per hour costs **fractions of a cent on Monad**.

On Ethereum it would cost **$50+/hour** — making this architecturally impossible anywhere else.

**This project exists because Monad exists.**

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│          SUBCONSCIOUS LOOP (runs every 5 min)         │
│                                                        │
│   CoinGecko API → Sarvam AI → Monad Smart Contract    │
│   (live ETH data)  (reasoning)   (permanent memory)   │
└──────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────┐
│             MAIN AGENT (invoked on demand)            │
│                                                        │
│   User Query → Load 12 thoughts from chain            │
│             → Sarvam AI + memory context              │
│             → Rich, specific, contextual response     │
└──────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────┐
│           REACT DEMO UI (Vite + ethers.js)            │
│                                                        │
│   Left panel  → Live subconscious feed from Monad     │
│   Right panel → Chat with compare mode toggle         │
└──────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| AI Model | Sarvam AI — sarvam-105b (India's sovereign LLM) |
| Blockchain | Monad Testnet (10,000 TPS) |
| Smart Contract | Solidity 0.8.19 + Hardhat 2.22.0 |
| Backend | Node.js + node-cron + ethers.js |
| Frontend | React + Vite |
| Data Feed | CoinGecko live ETH API |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v20+
- MetaMask with Monad testnet configured
- Sarvam AI API key → [dashboard.sarvam.ai](https://dashboard.sarvam.ai)
- CoinGecko API key → free tier at [coingecko.com](https://coingecko.com)
- MON test tokens → [testnet.monad.xyz/faucet](https://testnet.monad.xyz/faucet)

### Monad Testnet Config
```
Network Name : Monad Testnet
RPC URL      : https://testnet-rpc.monad.xyz
Chain ID     : 10143
Currency     : MON
Explorer     : https://testnet.monadexplorer.com
```

---

### 1. Clone the repo
```bash
git clone https://github.com/manjunath-r-official/agent-subconscious.git
cd agent-subconscious
```

### 2. Setup backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
SARVAM_API_KEY=your-sarvam-api-key
PRIVATE_KEY=your-metamask-wallet-private-key
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
COINGECKO_API_KEY=your-coingecko-api-key
CONTRACT_ADDRESS=0x26Da9A271F1eaEe6c9eeEdCd2eC1Bc0decab0994
GEMINI_MODEL=sarvam-105b
```

Start the subconscious loop (runs in background every 5 min):
```bash
node subconscious.js
```

Start the main agent CLI:
```bash
node agent.js
```

### 3. Setup frontend
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_SARVAM_API_KEY=your-sarvam-api-key
VITE_SARVAM_MODEL=sarvam-105b
VITE_CONTRACT_ADDRESS=0x26Da9A271F1eaEe6c9eeEdCd2eC1Bc0decab0994
VITE_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
```

Run the dev server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Deploy contract (already deployed — skip if using existing)
```bash
cd contract
npm install
npx hardhat run scripts/deploy.js --network monad
```

---

## 📄 Smart Contract

| | |
|---|---|
| **Network** | Monad Testnet |
| **Address** | `0x26Da9A271F1eaEe6c9eeEdCd2eC1Bc0decab0994` |
| **Explorer** | [View on Monad Explorer](https://testnet.monadexplorer.com/address/0x26Da9A271F1eaEe6c9eeEdCd2eC1Bc0decab0994) |

### Contract Functions
```solidity
// Write a new thought on-chain (called by subconscious loop)
function recordThought(string memory _content, string memory _dataSource) public onlyOwner

// Read last N thoughts (called by main agent before answering)
function getRecentThoughts(uint256 _count) public view returns (Thought[] memory)

// Get total thought count
function getTotalThoughts() public view returns (uint256)
```

---

## 🎬 Demo UI

The frontend has two modes toggled by a switch in the bottom left:

**Normal mode** (toggle OFF)
The subconscious agent responds alone — loaded with on-chain memory, specific and contextual.

**Compare mode** (toggle ON)
Every question gets two responses side by side:
- ❄️ **Cold agent** — no memory, generic, starts from zero
- 🧠 **Subconscious agent** — 12 on-chain thoughts loaded, specific and pattern-aware

The contrast is immediate and visceral. No explanation needed.

---

## 📁 Project Structure

```
agent-subconscious/
├── backend/
│   ├── subconscious.js     # Background thinking loop (cron every 5 min)
│   ├── agent.js            # Main agent CLI with compare mode
│   └── package.json
├── contract/
│   ├── contracts/
│   │   └── AgentMemory.sol # On-chain memory smart contract
│   ├── scripts/
│   │   └── deploy.js       # Deployment script
│   └── hardhat.config.js
├── frontend/
│   ├── src/
│   │   └── App.jsx         # Split-screen demo UI
│   └── package.json
└── README.md
```

---

## 🏆 Built At

**Monad Blitz Bangalore V4 — The Agent Economy**
June 2026 · Bangalore, India

---

## 👨‍💻 Builder

**Manjunath R** — Pet Resort Entrepreneur · Java Backend Engineer · AI Builder 🇮🇳

> Powered by **Sarvam AI** — India's sovereign LLM 🇮🇳 + **Monad** — the fastest EVM chain ⚡
