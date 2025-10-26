// api/realtime.js (with debug logging)
module.exports = async function (req, res) {
  console.log("=== /api/realtime called ===");
  console.log("Method:", req.method);
  console.log("Headers:", req.headers);

  try {
    const model =
      (req.query && req.query.model) || "gpt-4o-realtime-preview";
    console.log("Model:", model);

    // Read raw SDP offer
    let sdpOffer = "";
    for await (const chunk of req) {
      sdpOffer += chunk;
    }
    console.log("SDP offer length:", sdpOffer.length);
    if (!sdpOffer) {
      console.error("Empty SDP offer body!");
      res.status(400).json({ error: "Empty SDP offer body" });
      return;
    }

    // Forward to OpenAI
    const r = await fetch(`https://api.openai.com/v1/realtime?model=${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/sdp",
      },
      body: sdpOffer,
    });

    console.log("OpenAI status:", r.status);
    const text = await r.text();
    if (!r.ok) {
      console.error("OpenAI error response:", text);
    } else {
      console.log("Received SDP answer length:", text.length);
    }

    res.setHeader("Content-Type", "application/sdp");
    res.status(r.status).send(text);
  } catch (err) {
    console.error("Proxy error:", err);
    res
      .status(500)
      .json({ error: "Proxy error", details: String(err) });
  }
};
