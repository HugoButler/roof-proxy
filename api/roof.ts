// File: /api/roof.ts
export const config = { runtime: "edge" };

const API_KEY = "pRL438ACs41EvkUgU6zf";
const ROBOFLOW_URL =
  "https://serverless.roboflow.com/roof-detection-vector-view/2";

// universal CORS header set
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Edge function entrypoint
export default async function handler(req: Request): Promise<Response> {
  // 1) Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  // 2) Only POST allowed
  if (req.method !== "POST") {
    return new Response("Not found", { status: 404 });
  }

  // 3) Parse incoming image (JSON or form-urlencoded)
  let imageUrl: string | null = null;
  const ct = req.headers.get("content-type") || "";

  if (ct.includes("application/json")) {
    const body = await req.json().catch(() => null);
    imageUrl = body?.image ?? null;
  } else if (ct.includes("application/x-www-form-urlencoded")) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    imageUrl = params.get("image");
  }

  if (!imageUrl) {
    return new Response(
      JSON.stringify({ error: "Invalid payload; expected { image }" }),
      {
        status: 400,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      }
    );
  }

  // 4) Forward to Roboflow
  const form = new URLSearchParams();
  form.append("api_key", API_KEY);
  form.append("image", imageUrl);

  const rfRes = await fetch(ROBOFLOW_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  // 5) Proxy the response back
  const payload = await rfRes.text(); // text because Roboflow sometimes returns HTML on error
  return new Response(payload, {
    status: rfRes.status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });
}
