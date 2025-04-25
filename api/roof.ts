// Tell Vercel to run this on the Edge runtime
export const config = { runtime: "edge" };

import { Router } from "itty-router";

// Roboflow private key (keep secret, never expose client‐side)
const ROBOFLOW_KEY = "pRL438ACs41EvkUgU6zf";

// Create our router
const router = Router();

// 1️⃣ Preflight for CORS
router.options("/*", () =>
  new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
);

// 2️⃣ POST inference
router.post("/*", async (req) => {
  // expect JSON body: { image: "<url-or-base64>" }
  let json: { image?: string };
  try {
    json = await req.json();
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Invalid JSON; expected { image }" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const image = json.image;
  if (!image) {
    return new Response(
      JSON.stringify({ error: "Missing `image` in request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // build form body
  const form = new URLSearchParams();
  form.append("api_key", ROBOFLOW_KEY);
  form.append("image", image);

  // call Roboflow
  let rfRes: Response;
  try {
    rfRes = await fetch(
      "https://serverless.roboflow.com/roof-detection-vector-view/2",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to reach Roboflow", details: err }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  const text = await rfRes.text();
  // proxy back status + body
  return new Response(text, {
    status: rfRes.status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
});

// 404 for everything else
router.all("*", () => new Response("Not found", { status: 404 }));

export default router;
