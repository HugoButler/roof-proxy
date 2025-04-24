// api/roof.ts
export const config = { runtime: "edge" }

export default async function handler(req: Request) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin":  "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 })
  }

  // Parse incoming JSON body { image: URL_or_base64 }
  let image: string
  try {
    const { image: img } = await req.json()
    image = img
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body; expected { image }" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }
  if (!image) {
    return new Response(
      JSON.stringify({ error: "Missing `image` field" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }

  // Build form for Roboflow
  const form = new URLSearchParams()
  form.append("api_key", "pRL438ACs41EvkUgU6zf")
  form.append("image",   image)

  // Call Roboflow’s serverless endpoint
  const rf = await fetch(
    "https://serverless.roboflow.com/roof-detection-vector-view/2",
    {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    form.toString(),
    }
  )

  const payload = await rf.text()
  const ct      = rf.headers.get("content-type") || "application/json"

  // Return their response, passing CORS
  return new Response(payload, {
    status: rf.status,
    headers: {
      "Content-Type":                ct,
      "Access-Control-Allow-Origin": "*",
    },
  })
}
