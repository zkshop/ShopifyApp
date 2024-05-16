import {buildConnectors} from '@shopify/connect-wallet';
import {configureChains, createConfig, mainnet} from 'wagmi';
import {alchemyProvider} from 'wagmi/providers/alchemy';

const {chains, publicClient, webSocketPublicClient} = configureChains(
  [mainnet],
  [
    alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY_API_KEY }),
  ],
);

const {connectors, wagmiConnectors} = buildConnectors({
  chains,
  appName: 'Sorcel',
  projectId: 'c7eab94604b36836a194849de4342b19',
});

const config = createConfig({
  autoConnect: true,
  connectors: wagmiConnectors,
  publicClient,
  webSocketPublicClient,
});

export {chains, config, connectors};
