// File: /api/roof.ts
export const config = { runtime: "edge" };

// your Vercel domain:
const ALLOWED_ORIGIN = "https://roof-proxy-hw3z.vercel.app";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin" : ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async (req: Request): Promise<Response> => {
  // 1) CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: CORS_HEADERS,
    });
  }

  // 2) parse JSON body
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON; expected { image }" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  const { image } = payload;
  if (!image) {
    return new Response(
      JSON.stringify({ error: "Missing `image` field" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  // 3) build form for Roboflow
  const form = new URLSearchParams();
  form.append("api_key", Deno.env.get("ROBOFLOW_API_KEY")!);
  if (/^https?:\/\//i.test(image)) {
    form.append("image_url", image);
  } else {
    form.append("image", image);
  }

  // 4) proxy the request
  let upstream: Response;
  try {
    upstream = await fetch(
      `https://serverless.roboflow.com/roof-detection-vector-view/2`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Upstream fetch failed", detail: err.message }),
      { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
};
