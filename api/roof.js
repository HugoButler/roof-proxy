// api/roof.js
const { Router } = require("itty-router");
const fetch = require("node-fetch");

// Your Roboflow PRIVATE key
const ROBOFLOW_KEY = "pRL438ACs41EvkUgU6zf";

const router = Router();

// 1) CORS preflight
router.options("/*", (req, res) => {
  res.writeHead(204, {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end();
});

// 2) inference endpoint
router.post("/*", async (req, res) => {
  let body;
  try {
    body = JSON.parse(req.body);
  } catch (e) {
    return res
      .writeHead(400, { "Content-Type": "application/json" })
      .end(JSON.stringify({ error: "Invalid JSON" }));
  }

  const image = body.image;
  if (!image) {
    return res
      .writeHead(400, { "Content-Type": "application/json" })
      .end(JSON.stringify({ error: "Missing `image`" }));
  }

  // build form data
  const params = new URLSearchParams();
  params.append("api_key", ROBOFLOW_KEY);
  params.append("image", image);

  // call Roboflow
  let rfRes;
  try {
    rfRes = await fetch(
      "https://serverless.roboflow.com/roof-detection-vector-view/2",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      }
    );
  } catch (err) {
    return res
      .writeHead(502, { "Content-Type": "application/json" })
      .end(JSON.stringify({ error: "Upstream fetch failed", details: err.message }));
  }

  const json = await rfRes.text();
  res.writeHead(rfRes.status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  return res.end(json);
});

// 404 fallback
router.all("*", (req, res) => {
  res.writeHead(404).end("Not found");
});

module.exports = (req, res) => router.handle(req, res);
