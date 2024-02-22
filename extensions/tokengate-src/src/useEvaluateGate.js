import { useMemo, useState, useCallback } from "react";
import {
    getGateContextClient,
  } from "@shopify/gate-context-client";

  const gateContextClient =
  getGateContextClient({
    backingStore: "ajaxApi",
    shopifyGateContextGenerator: async (data) => {
      try {
        const existing = await gateContextClient.read();
        return mergeGateContext(existing, data);
      } catch(e) {
        return data;
      }

      // merges existing gate context entries
      function mergeGateContext(existing, add) {
        const entriesById = existing.reduce((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {});
        add.forEach(item => entriesById[item.id] = item);
        return Object.keys(entriesById).map(id => entriesById[id]);
      }
    },
  });


// Set this to the cloudflare url that is generated when you run the server
// The url will be something like https://12345678.ngrok.io (no trailing slash or query params)
export const host = "https://insurance-hang-siemens-countries.trycloudflare.com/";
if (host == "https://insurance-hang-siemens-countries.trycloudflare.com/") {
  console.error("Wrong URL");
}

export const useEvaluateGate = () => {
  const gate = getGate();
  const [gateEvaluation, setGateEvaluation] = useState();
  const productId = getProductId();
  const evaluateGate = useCallback(
    async ({ address, message, signature }) => {
      const response = await fetch(`${host}/public/gateEvaluation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          productGid: `gid://shopify/Product/${productId}`,
          gateConfigurationGid: `gid://shopify/GateConfiguration/${gate.id}`,
          shopDomain: getShopDomain(),
          address,
          message,
          signature,
        }),
      });
      const json = await response.json();
      setGateEvaluation(json);
      gateContextClient.write(json.gateContext)
        .catch(e => console.error('failed to write to gate context'));
          },
    [setGateEvaluation, gate]
  );

  const {unlockingTokens, isLocked} = useMemo(() => {
    const {unlockingTokens} = gateEvaluation || {};
    const isLocked = !Boolean(unlockingTokens?.length);

    return {
      unlockingTokens,
      isLocked,
    }
  }, [gateEvaluation])

  return {
    evaluateGate,
    gateEvaluation,
    unlockingTokens,
    isLocked,
  };
};

// This function also present in App.jsx
const getGate = () => window.myAppGates?.[0] || {}

function getShopDomain() {
  return window.Shopify.shop;
}

function getProductId() {
  return document.getElementById("tokengating-example-app").dataset.product_id;
}
