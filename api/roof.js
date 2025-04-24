// api/roof.js
const fetch = require("node-fetch");
const { Router } = require("itty-router");
const router = Router();

// CORS preflight
router.options("/*", () =>
  new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
);

// Handle POST /api/roof
router.post("/*", async (req, res) => {
  const { file } = await req.json();
  const form = new URLSearchParams();
  form.append("api_key", "pRL438ACs41EvkUgU6zf");
  form.append("file", file);

  const rfRes = await fetch(
    "https://outline.roboflow.com/roof-detection-vector-view/2",
    {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    form.toString(),
    }
  );

  const text = await rfRes.text();
  res
    .status(rfRes.status)
    .setHeader("Content-Type", "application/json")
    .setHeader("Access-Control-Allow-Origin", "*")
    .send(text);
});

module.exports = (req, res) => router.handle(req, res);
