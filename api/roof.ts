// File: api/roof.ts
export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  // 1) CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin":  "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // 2) Only POST allowed
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // 3) Parse JSON body { image: "<URL or base64>" }
  let image: string;
  try {
    const payload = await req.json();
    image = payload.image;
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON; expected { image }" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  if (!image) {
    return new Response(
      JSON.stringify({ error: "Missing `image` field" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // 4) Proxy to Roboflow
  const form = new URLSearchParams();
  form.append("api_key", "pRL438ACs41EvkUgU6zf");
  form.append("image",   image);

  const rf = await fetch(
    "https://serverless.roboflow.com/roof-detection-vector-view/2",
    {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    form.toString(),
    }
  );

  const body = await rf.text();
  const ct   = rf.headers.get("content-type") || "application/json";

  // 5) Return Roboflow’s response with CORS
  return new Response(body, {
    status: rf.status,
    headers: {
      "Content-Type":                ct,
      "Access-Control-Allow-Origin": "*",
    },
  });
}
