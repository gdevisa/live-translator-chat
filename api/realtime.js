// api/realtime.js
// Proxy the WebRTC SDP offer to OpenAI Realtime and return the SDP answer.
// Reads the raw body to avoid 400 "Bad Request" issues.

module.exports = async function (req, res) {
  console.log("=== /api/realtime called ===");
  try {
    const model = (req.query && req.query.model) || "gpt-4o-realtime-preview";
    let sdpOffer = "";
    for await (const chunk of req) sdpOffer += chunk;

    if (!sdpOffer) {
      console.error("Empty SDP offer body");
      res.status(400).json({ error: "Empty SDP offer body" });
      return;
    }

    const r = await fetch(`https://api.openai.com/v1/realtime?model=${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/sdp",
      },
      body: sdpOffer,
    });

    const text = await r.text();
    console.log("OpenAI status:", r.status, "answer length:", text.length);

    res.setHeader("Content-Type", "application/sdp");
    res.status(r.status).send(text);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy error", details: String(err) });
  }
};
