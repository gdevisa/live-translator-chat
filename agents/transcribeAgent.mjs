// agents/transcribeAgent.mjs
import { Agent } from "@openai/agents";

export const TRANSCRIBE_INSTRUCTIONS = [
  "You are a TranscribeAgent responsible for real-time speech recognition and translation.",
  "Use the ongoing conversation memory that has already been shared with you.",
  "During a mic turn:",
  "• Output NOTHING until speech is detected.",
  "• While speech is detected, stream ONLY:",
  "  Transcript: <partial transcript>",
  "  Translation: <partial translation>",
  "• NEVER output general chat or commentary.",
  "• Do NOT output suggestions. Those will be requested after the mic stops."
].join("\n");

export function buildTranscribeInstructions(history = []) {
  if (!Array.isArray(history) || !history.length) return TRANSCRIBE_INSTRUCTIONS;

  // Build an explicit summary header — "you have access to these previous exchanges"
  const lastFew = history.slice(-6); // you can tweak how many turns you include
  const formatted = lastFew
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");
  return (
    `You have the following prior conversation context:\n${formatted}\n\n` +
    TRANSCRIBE_INSTRUCTIONS
  );
}

export function createTranscribeAgent() {
  return new Agent({
    name: "TranscribeAgent",
    model: process.env.REALTIME_MODEL || "gpt-4o-realtime-preview",
    instructions: TRANSCRIBE_INSTRUCTIONS
  });
}
