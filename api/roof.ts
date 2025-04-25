// File: /api/roof.ts
export const config = { runtime: "edge" };

const API_KEY = "pRL438ACs41EvkUgU6zf";
const ROBOFLOW_URL =
  "https://serverless.roboflow.com/roof-detection-vector-view/2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (req.method !== "POST") {
    return new Response("Not found", { status: 404 });
  }

  // parse JSON or form body
  let image: string | null = null;
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const j = await req.json().catch(() => null);
    image = j?.image || null;
  } else {
    const t = await req.text();
    const params = new URLSearchParams(t);
    image = params.get("image");
  }
  if (!image) {
    return new Response(
      JSON.stringify({ error: "Invalid payload; expected { image }" }),
      { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }

  // forward to Roboflow
  const form = new URLSearchParams();
  form.set("api_key", API_KEY);
  form.set("image", image);
  const rf = await fetch(ROBOFLOW_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  const text = await rf.text();
  return new Response(text, {
    status: rf.status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
