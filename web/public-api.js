import { createHmac } from "crypto";
import cors from "cors";

export function configurePublicApi(app) {
  const corsOptions = {
    origin: "*",
  };

  app.options("/public/*", cors(corsOptions));

  app.post("/public/gateEvaluation", cors(corsOptions), async (req, res) => {
    const { gateConfigurationGid } = req.body;

    const payload = {
      id: gateConfigurationGid
    };

    const response = {gateContext: [getHmac(payload)]};
    res.status(200).send(response);
  });
}

// change secret key to another one in env
function getHmac(payload) {
  const hmacMessage = payload.id;
  const hmac = createHmac("sha256", process.env.SHOPIFY_CLIENT_ID);
  hmac.update(hmacMessage);
  const hmacDigest = hmac.digest("hex");
  return {
    id: payload.id,
    hmac: hmacDigest,
  };
}