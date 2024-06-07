import React, { createContext } from "react";
import axios from 'axios';

import { XamanWalletProvider } from './XamanProvider';
import { XamanApp } from './XamanApp';
import { EVMApp } from './EvmApp';

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  base,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: 'Sorcel-Shopify',
  projectId: import.meta.env.VITE_PROJECT_ID,
  chains: [mainnet, polygon, base],
});

export const httpServerless = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_FUNCTIONS_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  params: {
    key: import.meta.env.VITE_SERVERLESS_API_KEY,
  },
});

import PropTypes from 'prop-types';

export const XamanWalletContext = createContext(undefined);

XamanWalletContext.propTypes = {
  auth: PropTypes.shape({
    address: PropTypes.string,
    isConnected: PropTypes.bool,
    isDisconnected: PropTypes.bool
  })
};

const getGate = () => window.myAppGates?.[0] || {};

const queryClient = new QueryClient();

export const App = () => {
  const { requirements } = getGate();

  // App depends on the network
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <XamanWalletProvider>
            {requirements?.conditions?.network === 'XRP' ? <XamanApp /> : <EVMApp />}
          </XamanWalletProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
