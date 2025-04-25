// File: /api/roof.ts

// 1) Tell Vercel to run this as an Edge function
export const config = { runtime: "edge" };

const RF_KEY = "pRL438ACs41EvkUgU6zf";  // ← move this into an ENV var in production!
const RF_MODEL = "roof-detection-vector-view";
const RF_VERSION = "2";

// Shared CORS headers
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Our entrypoint
export default async (req: Request): Promise<Response> => {
  // 2) Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // 3) Only POST accepted
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: CORS_HEADERS,
    });
  }

  // 4) Parse JSON
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON; expected { image }" }),
      {
        status: 400,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      }
    );
  }

  const image = payload.image;
  if (!image) {
    return new Response(
      JSON.stringify({ error: "Missing `image` field in body" }),
      {
        status: 400,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      }
    );
  }

  // 5) Build a form‐encoded body
  const form = new URLSearchParams();
  form.append("image", image);

  // 6) Call Roboflow serverless with api_key in URL
  const roboflowURL = `https://serverless.roboflow.com/${RF_MODEL}/${RF_VERSION}?api_key=${RF_KEY}`;
  let rfRes: Response;
  try {
    rfRes = await fetch(roboflowURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Upstream request failed", detail: err.message }),
      {
        status: 502,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      }
    );
  }

  // 7) Return whatever Roboflow returned (masks, etc.)
  const text = await rfRes.text();
  return new Response(text, {
    status: rfRes.status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });
};
