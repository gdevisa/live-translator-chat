// api/realtime-sdp.mjs
export default async function handler(req, res) {
  try {
    const model = (req.query && req.query.model) || process.env.REALTIME_MODEL || "gpt-4o-realtime-preview";
    let sdpOffer = "";
    for await (const chunk of req) sdpOffer += chunk;
    if (!sdpOffer) return res.status(400).json({ error: "Empty SDP offer" });

    const r = await fetch(`https://api.openai.com/v1/realtime?model=${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/sdp"
      },
      body: sdpOffer
    });

    const answer = await r.text();
    res.setHeader("Content-Type", "application/sdp");
    res.status(r.status).send(answer);
  } catch (e) {
    console.error("realtime-sdp error:", e);
    res.status(500).json({ error: "proxy_error", details: String(e) });
  }
}
