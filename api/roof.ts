// File: /api/roof.ts
export const config = { runtime: "edge" };

export default async function handler(req: Request) {
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

  if (req.method === "POST") {
    const { image } = await req.json();
    const form = new URLSearchParams();
    form.append("api_key", "pRL438ACs41EvkUgU6zf");
    form.append("image", image);
    const rf = await fetch(
      "https://outline.roboflow.com/roof-detection-vector-view/2",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      }
    );
    const body = await rf.text();
    return new Response(body, {
      status: rf.status,
      headers: {
        "Content-Type":       "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  return new Response("Not found", { status: 404 });
}
