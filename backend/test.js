import { SarvamAIClient } from "sarvamai";
import { config } from "dotenv";

config();

const client = new SarvamAIClient({ apiSubscriptionKey: process.env.SARVAM_API_KEY });

const response = await client.chat.completions({
  model: "sarvam-105b",
  messages: [
    {
      role: "system",
      content: "You are a concise assistant. Give direct, short answers only."
    },
    {
      role: "user",
      content: "Say hello in 5 words"
    }
  ],
  max_tokens: 500,
  temperature: 0.7,
  reasoning_effort: null
});

const msg = response.choices[0].message;
const answer = msg.content || msg.reasoning_content;
console.log("✓ Sarvam working:", answer);