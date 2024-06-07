import fetch from "node-fetch";

export async function registerComplianceWebhook(shop, accessToken) {
  const response = await fetch(`https://${shop}/admin/api/2024-04/webhooks.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({
      webhook: {
        topic: "customers/data_request",
        address: `${process.env.APP_URL}/api/compliance-webhook`,
        format: "json",
      },
    }),
  });

  if (!response.ok) {
    console.error("Failed to register webhook:", await response.json());
  } else {
    console.log("Webhook registered successfully");
  }
}
