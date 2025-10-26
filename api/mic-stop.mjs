// api/mic-stop.mjs
import { createChatAgent } from "../agents/chatAgent.mjs";
const chatAgent = createChatAgent();

export default async function handler(req, res) {
  try {
    let body = "";
    for await (const c of req) body += c;
    const { transcript, history, source_lang, target_lang, model } = JSON.parse(body || "{}");

    if (!transcript || typeof transcript !== "string") {
      return res.status(400).json({ error: "missing transcript" });
    }
    if (model) chatAgent.model = model;

    const prompt = [
      "Mic turn ended. Based on prior context and the transcript below, output EXACTLY:",
      "",
      "Suggestions (target):",
      "• <short reply 1>",
      "• <short reply 2>",
      "",
      "Suggestions (source):",
      "• <short reply 1>",
      "• <short reply 2>",
      "",
      source_lang && target_lang ? `Source: ${source_lang}   Target: ${target_lang}` : "",
      `Transcript:\n${transcript}`
    ].filter(Boolean).join("\n");

    const messages = Array.isArray(history) ? [...history, { role: "user", content: prompt }] : [{ role: "user", content: prompt }];

    const result = await chatAgent.run(messages);
    res.status(200).json({ suggestions: result.outputText() });
  } catch (e) {
    console.error("mic-stop error:", e);
    res.status(500).json({ error: "handoff_failed", details: String(e) });
  }
}
