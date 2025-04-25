// File: /api/roof.ts
export const config = { runtime: "edge" };

import { Router } from "itty-router";
const router = Router();

// Preflight
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

// Inference endpoint
router.post("/*", async (req) => {
  let image: string;

  const ct = req.headers.get("Content-Type") || "";
  if (ct.includes("application/json")) {
    // JSON body: { image: "…" }
    const { image: img } = await req.json();
    image = img;
  } else if (ct.includes("application/x-www-form-urlencoded")) {
    // form body: api_key=…&image=…
    const formText = await req.text();
    const params = new URLSearchParams(formText);
    image = params.get("image") || "";
  } else {
    return new Response(
      JSON.stringify({ error: "Unsupported Content-Type" }),
      { status: 415, headers: { "Content-Type": "application/json" } }
    );
  }

  // build form for Roboflow
  const form = new URLSearchParams();
  form.append("api_key", "pRL438ACs41EvkUgU6zf");
  form.append("image", image);

  const rfRes = await fetch(
    "https://outline.roboflow.com/roof-detection-vector-view/2",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    }
  );

  const text = await rfRes.text();
  return new Response(text, {
    status: rfRes.status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
});

export default (req: Request) => router.handle(req);
