import ReactDOM from "react-dom";
import React from "react";
import {App} from './App';

import "@shopify/connect-wallet/styles.css";
import "@shopify/tokengate/styles.css";

// The element ID is defined in app-block.liquid
const container = document.getElementById("tokengating-example-app");
if (container.dataset.product_gated === 'true') {
    ReactDOM.createRoot(container).render(<App />);
} else {
    container.innerHTML = 'This product is not gated.'; //change to empty in the end
}
