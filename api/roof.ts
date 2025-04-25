// File: api/roof.ts
// Tell Vercel to run this as an Edge Function
export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  // 1) Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // 2) Only POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // 3) Parse JSON
  let image: string;
  try {
    const data = await req.json();
    image = data.image;
    if (!image) throw new Error("No image field");
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Invalid JSON; expected { image }" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // 4) Build form body
  const form = new URLSearchParams();
  form.append("api_key", "pRL438ACs41EvkUgU6zf");  // <- your private key
  form.append("image", image);

  // 5) Proxy to Roboflow
  const rf = await fetch(
    "https://serverless.roboflow.com/roof-detection-vector-view/2",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    }
  );

  const text = await rf.text();

  // 6) Return Roboflow’s response
  return new Response(text, {
    status: rf.status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
