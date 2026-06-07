import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const MONAD_RPC = import.meta.env.VITE_MONAD_RPC_URL;
const SARVAM_API_KEY = import.meta.env.VITE_SARVAM_API_KEY;
const SARVAM_MODEL = import.meta.env.VITE_SARVAM_MODEL;

const ABI = [
  "function getRecentThoughts(uint256 _count) public view returns (tuple(string content, uint256 timestamp, string dataSource)[])",
  "function getTotalThoughts() public view returns (uint256)"
];

async function callSarvam(systemPrompt, userPrompt) {
  const res = await fetch("https://api.sarvam.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": SARVAM_API_KEY
    },
    body: JSON.stringify({
      model: SARVAM_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 800,
      temperature: 0.7,
      reasoning_effort: null
    })
  });
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

export default function App() {
  const [thoughts, setThoughts] = useState([]);
  const [totalThoughts, setTotalThoughts] = useState(0);
  const [messages, setMessages] = useState([
    { role: "agent", text: "Hey! I've been watching ETH all day using my subconscious memory on Monad. Ask me anything — toggle 'Compare Mode' to see me vs a cold agent side by side." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showCold, setShowCold] = useState(false);
  const chatEndRef = useRef(null);

  async function loadThoughts() {
    try {
      const provider = new ethers.JsonRpcProvider(MONAD_RPC);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const total = await contract.getTotalThoughts();
      setTotalThoughts(Number(total));
      if (total === 0n) return;
      const raw = await contract.getRecentThoughts(12n);
      const parsed = [...raw].reverse().map(t => ({
        content: t.content,
        time: new Date(Number(t.timestamp) * 1000).toLocaleTimeString(),
        source: t.dataSource
      }));
      setThoughts(parsed);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      console.error("Chain read error:", e.message);
    }
  }

  async function handleSend() {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", text: question }]);
    setLoading(true);

    const memContext = thoughts.length > 0
      ? thoughts.map(t => `[${t.time}] ${t.content}`).join("\n")
      : "No observations yet.";

    try {
      if (showCold) {
        // Compare mode — show both agents
        setMessages(m => [...m, { role: "system", text: "⚡ Compare mode ON — cold agent vs subconscious agent..." }]);

        const coldAnswer = await callSarvam(
          "You are a standard AI assistant with no prior context. Answer concisely in 3-4 lines. No reasoning steps.",
          `Answer this question about ETH with no background context:\n${question}`
        );
        setMessages(m => [...m, { role: "cold", text: coldAnswer }]);

        const smartAnswer = await callSarvam(
          "You are a direct, confident AI trading agent. Answer concisely using your memory. No reasoning steps.",
          `You are an AI agent with subconscious memory stored on Monad blockchain. You've been watching ETH all day.

Your background observations:
${memContext}

Answer this question using your memory. Be specific, reference observations.
Question: ${question}`
        );
        setMessages(m => [...m, { role: "agent", text: smartAnswer }]);

      } else {
        // Normal mode — subconscious agent only
        const answer = await callSarvam(
          "You are a direct, confident AI trading agent. Answer concisely using your memory. No reasoning steps.",
          `You are an AI agent with subconscious memory stored on Monad blockchain.

Your background observations:
${memContext}

Answer this question using your memory. Be specific and direct.
Question: ${question}`
        );
        setMessages(m => [...m, { role: "agent", text: answer }]);
      }
    } catch (e) {
      setMessages(m => [...m, { role: "error", text: "Error: " + e.message }]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadThoughts();
    const interval = setInterval(loadThoughts, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', sans-serif", background: "#0a0a14", color: "#e0e0ff", overflow: "hidden" }}>

      {/* LEFT — Subconscious Feed */}
      <div style={{ width: "38%", borderRight: "1px solid #1e1e3a", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #1e1e3a", background: "#0d0d1f" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ff88", boxShadow: "0 0 6px #00ff88", animation: "pulse 1.5s infinite" }} />
            <span style={{ fontWeight: 600, fontSize: 13, letterSpacing: "0.03em" }}>SUBCONSCIOUS FEED</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "#4a4a7a", fontFamily: "monospace" }}>
              {CONTRACT_ADDRESS.slice(0, 8)}...{CONTRACT_ADDRESS.slice(-6)}
            </span>
            <span style={{ fontSize: 10, background: "#1a1a3a", color: "#6060aa", padding: "2px 8px", borderRadius: 12 }}>
              {totalThoughts} thoughts on Monad
            </span>
          </div>
        </div>

        {/* Thoughts */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
          {thoughts.length === 0 ? (
            <div style={{ color: "#2a2a5a", fontSize: 12, textAlign: "center", marginTop: 60, lineHeight: 2 }}>
              🧠 Subconscious warming up...<br />
              <span style={{ fontSize: 10 }}>thoughts appear here every 5 mins</span>
            </div>
          ) : (
            thoughts.map((t, i) => (
              <div key={i} style={{
                background: i === 0 ? "#0a1f14" : "#0d0d1f",
                border: `1px solid ${i === 0 ? "#00ff4422" : "#1e1e3a"}`,
                borderRadius: 10,
                padding: "10px 12px",
                transition: "all 0.3s"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 10, color: "#3a3a6a" }}>🕐 {t.time}</span>
                  <span style={{ fontSize: 10, color: "#2a5a3a", background: "#0a1f14", padding: "1px 6px", borderRadius: 8 }}>
                    on-chain ✓
                  </span>
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.65, color: i === 0 ? "#88ffcc" : "#9090c0" }}>
                  {t.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "8px 14px", borderTop: "1px solid #1e1e3a", fontSize: 10, color: "#2a2a4a", display: "flex", justifyContent: "space-between" }}>
          <span>🔗 testnet.monadexplorer.com</span>
          {lastUpdated && <span>updated {lastUpdated}</span>}
        </div>
      </div>

      {/* RIGHT — Chat */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #1e1e3a", background: "#0d0d1f", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>🤖 Agent Subconscious</div>
            <div style={{ fontSize: 10, color: "#4a4a7a" }}>
              Powered by Sarvam AI + Monad blockchain • {thoughts.length} memories loaded
            </div>
          </div>
          <div style={{ fontSize: 10, background: "#1a1a3a", color: "#6060aa", padding: "4px 10px", borderRadius: 12, textAlign: "right" }}>
            <div>ETH Watcher</div>
            <div style={{ color: "#00ff88" }}>● Active</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "100%" }}>

              {m.role === "system" && (
                <div style={{ alignSelf: "center", fontSize: 11, color: "#4a4a7a", background: "#0d0d1f", padding: "4px 14px", borderRadius: 20, border: "1px solid #1e1e3a" }}>
                  {m.text}
                </div>
              )}

              {m.role === "cold" && (
                <div style={{ maxWidth: "85%", background: "#1a0a0a", border: "1px solid #ff333322", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 10, color: "#ff5555", marginBottom: 6, fontWeight: 600, letterSpacing: "0.05em" }}>
                    ❄️ COLD AGENT — no memory
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.7, color: "#cc8888" }}>{m.text}</div>
                </div>
              )}

              {m.role === "agent" && (
                <div style={{ maxWidth: "85%", background: "#0a1a0f", border: "1px solid #00ff4422", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 10, color: "#00ff88", marginBottom: 6, fontWeight: 600, letterSpacing: "0.05em" }}>
                    🧠 SUBCONSCIOUS AGENT — {thoughts.length} memories from Monad
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.7, color: "#aaffcc" }}>{m.text}</div>
                </div>
              )}

              {m.role === "user" && (
                <div style={{ maxWidth: "75%", background: "#12123a", border: "1px solid #3333aa", borderRadius: 12, padding: "10px 14px" }}>
                  <div style={{ fontSize: 13, color: "#c0c0ff" }}>{m.text}</div>
                </div>
              )}

              {m.role === "error" && (
                <div style={{ maxWidth: "85%", background: "#1a0a0a", border: "1px solid #ff0000", borderRadius: 12, padding: "10px 14px" }}>
                  <div style={{ fontSize: 12, color: "#ff6666" }}>{m.text}</div>
                </div>
              )}

            </div>
          ))}

          {loading && (
            <div style={{ alignSelf: "flex-start", background: "#0d0d1f", border: "1px solid #1e1e3a", borderRadius: 12, padding: "10px 16px", fontSize: 13, color: "#4a4a7a" }}>
              {showCold ? "⚡ asking both agents..." : "🧠 thinking with memory..."}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Toggle + Input */}
        <div style={{ padding: "12px 20px 14px", borderTop: "1px solid #1e1e3a" }}>

          {/* Compare Mode Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div
              onClick={() => setShowCold(s => !s)}
              style={{
                width: 38, height: 22, borderRadius: 11,
                background: showCold ? "#534AB7" : "#1e1e3a",
                border: `1px solid ${showCold ? "#7a70dd" : "#2e2e5a"}`,
                position: "relative", cursor: "pointer",
                transition: "background 0.2s, border 0.2s", flexShrink: 0
              }}
            >
              <div style={{
                width: 16, height: 16, borderRadius: "50%",
                background: showCold ? "white" : "#4a4a7a",
                position: "absolute", top: 2,
                left: showCold ? 18 : 2,
                transition: "left 0.2s, background 0.2s"
              }} />
            </div>
            <span style={{ fontSize: 12, color: showCold ? "#aaaaff" : "#4a4a7a", cursor: "pointer" }}
              onClick={() => setShowCold(s => !s)}>
              Compare mode
            </span>
            {showCold
              ? <span style={{ fontSize: 10, color: "#7a70dd", background: "#1a1a3a", padding: "2px 8px", borderRadius: 10 }}>❄️ cold + 🧠 subconscious — both respond</span>
              : <span style={{ fontSize: 10, color: "#3a3a6a", background: "#0d0d1f", padding: "2px 8px", borderRadius: 10 }}>🧠 subconscious only</span>
            }
          </div>

          {/* Input Row */}
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder={showCold ? "Ask anything — both agents will respond..." : "Ask about ETH..."}
              style={{
                flex: 1,
                background: "#0d0d1f",
                border: `1px solid ${showCold ? "#3a3a7a" : "#1e1e3a"}`,
                borderRadius: 10,
                padding: "11px 16px",
                color: "#e0e0ff",
                fontSize: 13,
                outline: "none",
                transition: "border 0.2s"
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              style={{
                background: loading ? "#1e1e3a" : "#534AB7",
                color: loading ? "#4a4a7a" : "white",
                border: "none",
                borderRadius: 10,
                padding: "11px 22px",
                fontSize: 13,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s"
              }}
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e1e3a; border-radius: 3px; }
        input::placeholder { color: #2a2a5a; }
      `}</style>
    </div>
  );
}