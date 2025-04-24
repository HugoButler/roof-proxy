// api/roof.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  // 1) CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 2) Preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // 3) Only POST allowed
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST,OPTIONS");
    return res.status(405).send("Method Not Allowed");
  }

  try {
    // 4) Read the raw urlencoded body
    let body = "";
    await new Promise((resolve, reject) => {
      req.on("data", (chunk) => (body += chunk));
      req.on("end", resolve);
      req.on("error", reject);
    });

    // 5) Forward to Roboflow
    const rfRes = await fetch(
      "https://serverless.roboflow.com/roof-detection-vector-view/2",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      }
    );

    // 6) Relay status and body back verbatim
    const text = await rfRes.text();
    res.status(rfRes.status).send(text);
  } catch (err) {
    console.error("❌ proxy error:", err);
    res.status(500).json({ error: err.message });
  }
}
