// api/chat.mjs (Agents SDK version)
import { Agent, run } from "@openai/agents";

const chatAgent = new Agent({
  name: "ChatAgent",
  model: process.env.LLM_MODEL || "gpt-4o",
  instructions: [
    "You are a helpful assistant.",
    "Use prior conversation context.",
    "For normal typed chat, NEVER include 'Transcript:' or 'Translation:'.",
    "Be concise and polite."
  ].join("\n")
});

// Simple converter: ChatML-style history -> one prompt string
function historyToPrompt(messages = []) {
  return messages
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");
}

export default async function handler(req, res) {
  try {
    let body = "";
    for await (const c of req) body += c;
    const { messages, model } = JSON.parse(body || "{}");
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages must be an array" });
    }
    if (model) chatAgent.model = model;

    const prompt = historyToPrompt(messages);
    const result = await run(chatAgent, prompt);

    res.status(200).json({ text: result.finalOutput || "" });
  } catch (e) {
    console.error("chat error:", e);
    res.status(500).json({ error: "chat_failed", details: String(e) });
  }
}
