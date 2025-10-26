// api/realtime.ts
import type { VercelRequest, VercelResponse } from "vercel";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const model = (req.query.model as string) || "gpt-4o-realtime-preview";

  const r = await fetch(`https://api.openai.com/v1/realtime?model=${model}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY!}`,
      "Content-Type": req.headers["content-type"] || "application/sdp",
    },
    body: req.body, // raw SDP from browser
  });

  const sdp = await r.text();
  res.setHeader("Content-Type", "application/sdp");
  res.status(r.status).send(sdp);
}
