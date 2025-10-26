
// agents/transcribeAgent.mjs
import { Agent } from "@openai/agents";

// Optional: not invoked server-side in WebRTC flow, but kept for parity & future server-orch.
export function createTranscribeAgent() {
  return new Agent({
    name: "TranscribeAgent",
    model: process.env.REALTIME_MODEL || "gpt-4o-realtime-preview",
    instructions: [
      "MIC TURN BEHAVIOR:",
      "• Output NOTHING until speech is detected.",
      "• While speech is detected, stream ONLY:",
      "  Transcript: <partial transcript>",
      "  Translation: <partial translation>",
      "• NEVER output generic chat during mic turns.",
      "• Suggestions are produced only after mic stops."
    ].join("\n")
  });
}
