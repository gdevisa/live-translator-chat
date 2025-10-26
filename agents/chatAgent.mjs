// agents/chatAgent.mjs
import { Agent } from "@openai/agents";

export function createChatAgent() {
  return new Agent({
    name: "ChatAgent",
    model: process.env.LLM_MODEL || "gpt-4o",
    instructions: [
      "You are a helpful assistant.",
      "Use prior conversation context.",
      "For normal typed chat, DO NOT include 'Transcript:' or 'Translation:'.",
      "Be concise and polite."
    ].join("\n")
  });
}
