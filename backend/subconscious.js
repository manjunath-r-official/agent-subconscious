import cron from "node-cron";
import { ethers } from "ethers";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import SarvamAI from "sarvamai";
import { SarvamAIClient } from "sarvamai";
import { config } from "dotenv";
import axios from "axios";

config();

// --- SETUP ---
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });

const client = new SarvamAIClient({ apiSubscriptionKey: process.env.SARVAM_API_KEY });
const model = process.env.SARVAM_MODEL;

const provider = new ethers.JsonRpcProvider(process.env.MONAD_RPC_URL);
const wallet = new ethers.Wallet(`0x${process.env.PRIVATE_KEY}`, provider);

// Contract ABI — only the functions we need
const ABI = [
  "function recordThought(string memory _content, string memory _dataSource) public",
  "function getRecentThoughts(uint256 _count) public view returns (tuple(string content, uint256 timestamp, string dataSource)[])",
  "function getTotalThoughts() public view returns (uint256)"
];

const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, wallet);

// --- FETCH ETH MARKET DATA ---
async function fetchMarketData() {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true",
      {
        headers: process.env.COINGECKO_API_KEY
          ? { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY }
          : {},
      }
    );
    const eth = response.data.ethereum;
    return {
      price: eth.usd,
      change24h: eth.usd_24h_change?.toFixed(2),
      volume24h: eth.usd_24h_vol?.toFixed(0),
    };
  } catch (err) {
    console.error("Failed to fetch market data:", err.message);
    return null;
  }
}

// --- GENERATE A SUBCONSCIOUS THOUGHT ---
// async function generateThought(marketData) {
//   const prompt = `You are an AI agent's subconscious mind. You have been passively watching ETH market data.

// Current ETH data:
// - Price: $${marketData.price}
// - 24h Change: ${marketData.change24h}%
// - 24h Volume: $${marketData.volume24h}

// Write ONE concise observation (max 2 sentences). Focus on patterns, anomalies, or signals worth remembering. 
// Be specific with numbers. No fluff. Write like a trader's internal monologue.`;

//   const result = await model.generateContent(prompt);
//   return result.response.text().trim();
// }

async function generateThought(marketData) {
  const response = await client.chat.completions({
    model: model,
    messages: [
      {
        role: "user",
        content: `You are an AI agent's subconscious mind watching ETH market data.

Current ETH data:
- Price: $${marketData.price}
- 24h Change: ${marketData.change24h}%
- 24h Volume: $${marketData.volume24h}

Write ONE concise observation (max 2 sentences). Focus on patterns, anomalies, or signals worth remembering. Be specific with numbers. Write like a trader's internal monologue.`
      }
    ],
    temperature: 0.7,
    max_tokens: 200,
    reasoning_effort: null
  });
  return response.choices[0].message.content.trim();
}


// --- WRITE THOUGHT TO MONAD ---
async function recordThoughtOnChain(thought, dataSource) {
  try {
    console.log("\n🧠 New thought:", thought);
    console.log("📝 Writing to Monad...");

    const tx = await contract.recordThought(thought, dataSource);
    await tx.wait();

    console.log("✓ Recorded on Monad! TX:", tx.hash);
    console.log("🔗 Explorer:", `https://testnet.monadexplorer.com/tx/${tx.hash}`);
  } catch (err) {
    console.error("Failed to record on chain:", err.message);
  }
}

// --- MAIN SUBCONSCIOUS LOOP ---
async function runSubconsciousLoop() {
  console.log("\n⏰ Subconscious loop running at", new Date().toLocaleTimeString());

  const marketData = await fetchMarketData();
  if (!marketData) {
    console.log("Skipping — no market data");
    return;
  }

  console.log(`📊 ETH: $${marketData.price} | ${marketData.change24h}% | Vol: $${marketData.volume24h}`);

  const thought = await generateThought(marketData);
  await recordThoughtOnChain(thought, "CoinGecko/ETH");
}

// --- START ---
console.log("🧠 Agent Subconscious started!");
console.log("📡 Connected to Monad:", process.env.MONAD_RPC_URL);
console.log("📄 Contract:", process.env.CONTRACT_ADDRESS);
console.log("⏱  Thinking every 5 minutes...\n");

// Run immediately on start
runSubconsciousLoop();

// Then run every 5 minutes
cron.schedule("*/5 * * * *", runSubconsciousLoop);