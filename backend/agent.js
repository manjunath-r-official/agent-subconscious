import { ethers } from "ethers";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import SarvamAI from "sarvamai";
import { SarvamAIClient } from "sarvamai";
import { config } from "dotenv";
import readline from "readline";

config();

// --- SETUP ---
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });
const client = new SarvamAIClient({ apiSubscriptionKey: process.env.SARVAM_API_KEY });
const model = process.env.SARVAM_MODEL;

const provider = new ethers.JsonRpcProvider(process.env.MONAD_RPC_URL);

const ABI = [
  "function getRecentThoughts(uint256 _count) public view returns (tuple(string content, uint256 timestamp, string dataSource)[])",
  "function getTotalThoughts() public view returns (uint256)"
];

const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, provider);

// --- LOAD SUBCONSCIOUS FROM CHAIN ---
async function loadSubconsciousMemory() {
  try {
    const total = await contract.getTotalThoughts();
    console.log(`\n🧠 Loading ${total} thoughts from Monad...`);

    if (total === 0n) {
      console.log("No thoughts yet — subconscious is still warming up.");
      return [];
    }

    const thoughts = await contract.getRecentThoughts(12n);
    return thoughts.map(t => ({
      content: t.content,
      timestamp: new Date(Number(t.timestamp) * 1000).toLocaleTimeString(),
      dataSource: t.dataSource
    }));
  } catch (err) {
    console.error("Failed to load memory:", err.message);
    return [];
  }
}

// --- ANSWER WITH SUBCONSCIOUS CONTEXT ---
// async function answerWithSubconscious(userQuestion, memories) {
//   const memoryContext = memories.length > 0
//     ? memories.map((m, i) => `[${m.timestamp}] ${m.content}`).join("\n")
//     : "No background observations yet.";

//   const prompt = `You are an AI agent with a subconscious mind. You have been passively observing ETH market data in the background and storing your thoughts on the Monad blockchain.

// Here are your recent subconscious observations (from most recent):
// ${memoryContext}

// Now answer this question using your background knowledge. Reference specific observations where relevant. Be direct and confident — like a trader who has been watching the market all day.

// User question: ${userQuestion}`;

//   const result = await model.generateContent(prompt);
//   return result.response.text().trim();
// }
async function answerWithSubconscious(userQuestion, memories) {
  const memoryContext = memories.length > 0
    ? memories.map(m => `[${m.timestamp}] ${m.content}`).join("\n")
    : "No background observations yet.";

  const response = await client.chat.completions({
    model: model,
    messages: [
      {
        role: "user",
        content: `You are an AI agent with subconscious memory stored on Monad blockchain. You've been watching ETH all day.

Your background observations:
${memoryContext}

Answer this using your memory. Be specific and direct like a trader who never looked away.
Question: ${userQuestion}`
      }
    ],
    temperature: 0.7,
    max_tokens: 800,
    reasoning_effort: null
  });
  return response.choices[0].message.content.trim();
}

// --- COLD START ANSWER (no memory) ---
// async function answerColdStart(userQuestion) {
//   const prompt = `You are a standard AI assistant with no prior context. Answer this question about ETH markets:

// ${userQuestion}

// Be helpful but generic — you have no background observations.`;

//   const result = await model.generateContent(prompt);
//   return result.response.text().trim();
// }
async function answerColdStart(userQuestion) {
  const response = await client.chat.completions({
    model: model,
    messages: [
      {
        role: "user",
        content: `You are a standard AI with no prior context. Answer this question about ETH markets generically:\n${userQuestion}`
      }
    ],
    temperature: 0.7,
    max_tokens: 800,
    reasoning_effort: null
  });
  return response.choices[0].message.content.trim();
}

// --- DEMO MODE: show contrast ---
async function runDemo(question) {
  console.log("\n" + "=".repeat(60));
  console.log("QUESTION:", question);
  console.log("=".repeat(60));

  // Cold agent first
  console.log("\n❄️  COLD AGENT (no memory):");
  console.log("-".repeat(40));
  const coldAnswer = await answerColdStart(question);
  console.log(coldAnswer);

  // Load subconscious memory
  const memories = await loadSubconsciousMemory();

  // Subconscious agent
  console.log("\n🧠 SUBCONSCIOUS AGENT (loaded from Monad):");
  console.log("-".repeat(40));
  if (memories.length > 0) {
    console.log(`✓ Loaded ${memories.length} background thoughts from chain\n`);
  }
  const smartAnswer = await answerWithSubconscious(question, memories);
  console.log(smartAnswer);
  console.log("\n" + "=".repeat(60));
}

// --- INTERACTIVE CLI ---
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion() {
  rl.question('\n💬 Ask the agent (or type "demo" for contrast mode, "quit" to exit): ', async (input) => {
    const trimmed = input.trim();

    if (trimmed === "quit") {
      console.log("Goodbye!");
      rl.close();
      return;
    }

    if (trimmed === "demo") {
      await runDemo("What's your take on ETH right now, respond me in 5 lines?");
    } else if (trimmed) {
      const memories = await loadSubconsciousMemory();
      console.log("\n🧠 SUBCONSCIOUS AGENT:");
      console.log("-".repeat(40));
      if (memories.length > 0) {
        console.log(`✓ Loaded ${memories.length} thoughts from Monad\n`);
      }
      const answer = await answerWithSubconscious(trimmed, memories);
      console.log(answer);
    }

    askQuestion();
  });
}

// --- START ---
console.log("🤖 Agent is online!");
console.log("📄 Contract:", process.env.CONTRACT_ADDRESS);
console.log("💡 Type 'demo' to see cold vs subconscious agent comparison");

askQuestion();