// api/roof.js
const fetch = require("node-fetch");
const { Router } = require("itty-router");

// 1) Create a router
const router = Router();

// 2) CORS preflight
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

// 3) Handle POST inference
router.post("/*", async (req, res) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON; expected { image }" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!body.image) {
    return new Response(
      JSON.stringify({ error: "Missing `image` field" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // 4) Build form for Roboflow
  const form = new URLSearchParams();
  form.append("api_key", "pRL438ACs41EvkUgU6zf");
  form.append("image", body.image);

  // 5) Call Roboflow
  const rfRes = await fetch(
    "https://serverless.roboflow.com/roof-detection-vector-view/2",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    }
  );

  const data = await rfRes.json();

  // 6) Return the response back to the browser
  return new Response(JSON.stringify(data), {
    status: rfRes.status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
});

// 7) Export the Vercel handler
module.exports = (req, res) => router.handle(req, res);
