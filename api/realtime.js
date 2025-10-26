// api/realtime.js
export default async function handler(req, res) {
  try {
    const model =
      (req.query && req.query.model) || "gpt-4o-realtime-preview";

    // Forward the SDP offer to OpenAI with your secret
    const r = await fetch(`https://api.openai.com/v1/realtime?model=${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": req.headers["content-type"] || "application/sdp",
      },
      body: req.body, // raw SDP from browser
    });

    const sdp = await r.text();
    res.setHeader("Content-Type", "application/sdp");
    res.status(r.status).send(sdp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Proxy error", details: String(err) });
  }
}
