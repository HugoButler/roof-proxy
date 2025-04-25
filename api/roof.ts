// File: /api/roof.ts
export const config = { runtime: "edge" };

const RF_MODEL   = "roof-detection-vector-view";
const RF_VERSION = "2";

const CORS = {
  "Access-Control-Allow-Origin" : "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async (req: Request): Promise<Response> => {
  // handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: CORS });
  }

  // parse JSON body
  let json: any;
  try {
    json = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON; expected { image }" }),
      { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }

  const image: string = json.image;
  if (!image) {
    return new Response(
      JSON.stringify({ error: "Missing `image` field in body" }),
      { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }

  // build form for Roboflow
  const form = new URLSearchParams();
  form.append("api_key", Deno.env.get("ROBOFLOW_API_KEY")!); // set RF key in Vercel ENV
  if (/^https?:\/\//i.test(image)) {
    form.append("image_url", image);
  } else {
    form.append("image", image);
  }

  // POST to Roboflow
  const url = `https://serverless.roboflow.com/${RF_MODEL}/${RF_VERSION}`;
  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Upstream request failed", detail: err.message }),
      { status: 502, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
};
