import ReactDOM from "react-dom";
import React from "react";
import {App} from './App';

// The element ID is defined in app-block.liquid
const container = document.getElementById("tokengating-example-app");
if (container.dataset.product_gated === 'true') {
    console.log("---log to console---");
    ReactDOM.createRoot(container).render(<App />);
} else {
    console.log("---log to console---");
    container.innerHTML = '';
}
