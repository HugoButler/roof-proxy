// api/roof.js
const { Router } = require("itty-router");
const fetch = require("node-fetch");
const router = Router();

// CORS preflight
router.options("/*", () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
});

// Reject any GET (or other) method immediately so the function doesn’t hang
router.get("/*", () => {
  return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
    status: 405,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
});

// Handle the actual POST
router.post("/*", async (req) => {
  let { file } = await req.json().catch(() => ({}));
  if (!file) {
    return new Response(JSON.stringify({ error: "No file provided" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // Proxy to Roboflow
  const form = new URLSearchParams();
  form.append("api_key", "pRL438ACs41EvkUgU6zf");
  form.append("file", file);

  const rfRes = await fetch(
    "https://outline.roboflow.com/roof-detection-vector-view/2",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    }
  );

  const txt = await rfRes.text();
  return new Response(txt, {
    status: rfRes.status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
});

module.exports = (req, res) => router.handle(req, res);
