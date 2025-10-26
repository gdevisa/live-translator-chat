// api/mic-stop.mjs (Agents SDK version)
import { Agent, run } from "@openai/agents";

const chatAgent = new Agent({
  name: "ChatAgent",
  model: process.env.LLM_MODEL || "gpt-4o",
  instructions: [
    "You are a helpful assistant.",
    "Use prior conversation context.",
    "When asked for suggestions after a mic turn, output EXACTLY the two sections below.",
    "Do not add extra prose."
  ].join("\n")
});

function historyToPrompt(messages = []) {
  return messages
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");
}

export default async function handler(req, res) {
  try {
    let body = "";
    for await (const c of req) body += c;
    const { transcript, history, source_lang, target_lang, model } = JSON.parse(body || "{}");

    if (!transcript || typeof transcript !== "string") {
      return res.status(400).json({ error: "missing transcript" });
    }
    if (model) chatAgent.model = model;

    const context = Array.isArray(history) ? historyToPrompt(history) : "";
    const prompt = [
      context && `CONTEXT\n${context}\n---`,
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

    const result = await run(chatAgent, prompt);
    res.status(200).json({ suggestions: result.finalOutput || "" });
  } catch (e) {
    console.error("mic-stop error:", e);
    res.status(500).json({ error: "handoff_failed", details: String(e) });
  }
}
