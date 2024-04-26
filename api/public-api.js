import { createHmac } from "crypto";
import cors from "cors";

export function configurePublicApi(app) {
  const corsOptions = {
    origin: "*",
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
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

function getHmac(payload) {
  const hmacMessage = payload.id;
  const hmac = createHmac("sha256", "secret-key");
  hmac.update(hmacMessage);
  const hmacDigest = hmac.digest("hex");
  return {
    id: payload.id,
    hmac: hmacDigest,
  };
}