// File: /api/roof.ts

// Tell Vercel to run this file on the Edge (so we can just return a Response)
export const config = { runtime: "edge" };

import { Router } from "itty-router";

// Create a router
const router = Router();

// 1) Preflight handler
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

// 2) Actual inference endpoint
router.post("/*", async (req) => {
  // Expect JSON body with { image: "<URL or base64>" }
  const { image } = await req.json();

  // Build a form-encoded body for Roboflow
  const form = new URLSearchParams();
  form.append("api_key", "pRL438ACs41EvkUgU6zf");
  form.append("image", image);

  // Call the hosted Roboflow inference endpoint
  const rf = await fetch(
    "https://serverless.roboflow.com/roof-detection-vector-view/2",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    }
  );

  // Pass along their JSON with your CORS headers
  const payload = await rf.json();
  return new Response(JSON.stringify(payload), {
    status: rf.status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
});

// 3) Fallback 404
router.all("/*", () => new Response("Not found", { status: 404 }));

// Tell Vercel to use our router
export default router.handle;
