import { json } from "@remix-run/node";
import crypto from "crypto";

export async function action({ request }) {
  const hmac = request.headers.get("x-shopify-hmac-sha256");
  const body = await request.text();
  const generatedHmac = crypto
    .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
    .update(body, "utf8")
    .digest("base64");

  if (generatedHmac !== hmac) {
    return new Response("Unauthorized", { status: 401 });
  }

  const data = JSON.parse(body);

  switch (data.topic) {
    case "customers/data_request":
      console.log("Received GDPR data request:", data);
      break;
    case "customers/redact":
      console.log("Received GDPR data redaction request:", data);
      break;
    case "shop/redact":
      console.log("Received shop redaction request:", data);
      break;
  }

  return json({ success: true });
}