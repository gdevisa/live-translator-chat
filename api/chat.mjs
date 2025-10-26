// api/chat.mjs
import { createChatAgent } from "../agents/chatAgent.mjs";
const chatAgent = createChatAgent();

export default async function handler(req, res) {
  try {
    let body = "";
    for await (const c of req) body += c;
    const { messages, model } = JSON.parse(body || "{}");
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages must be an array" });
    }
    if (model) chatAgent.model = model;

    const result = await chatAgent.run(messages);
    res.status(200).json({ text: result.outputText() });
  } catch (e) {
    console.error("chat error:", e);
    res.status(500).json({ error: "chat_failed", details: String(e) });
  }
}
