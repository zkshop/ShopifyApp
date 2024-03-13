import { useEffect, useState } from "react";
import { Tokengate } from "@shopify/tokengate";
import {
  buildConnectors,
  ConnectButton,
  ConnectWalletProvider,
  useConnectWallet,
} from "@shopify/connect-wallet";
import { configureChains, createConfig, mainnet, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { useEvaluateGate } from './useEvaluateGate';
import axios from 'axios';

const _App = () => {
  // const { wallet } = useConnectWallet({
  //   onConnect: (wallet) => {
  //     evaluateGate(wallet);
  //   },
  // });
  const wallet = { address: "rLLAmbFhd44wWfUbYmLSfd4qeTH4WAtTUo" };

  const { isLocked, unlockingTokens, evaluateGate, gateEvaluation } = useEvaluateGate();

  const { requirements, reaction } = getGate();

  // console.log("requirements", requirements);
  // console.log("requirements next", requirements.conditions[0]);
  // console.log("reaction", reaction);

  const identifiers = {
    issuer: 'rMjFHVDLawmuFfXhJNXYcq1WD1wVSC45HU',
    nftokenTaxon: '3',
  };

  const XRPNftReaderClient = () => {
    return {
      getWalletNfts: async (walletAddress, identifiers) => {
        const params = {
          owner: walletAddress,
          list: 'nfts',
          issuer: identifiers.issuer,
          taxon: identifiers.nftokenTaxon,
        };
        const nfts = await axios
          .get(`https://bithomp.com/api/v2/nfts`, {
            params,
            headers: {
              'x-bithomp-token': '131c5def-d154-4a4c-9dea-59afc1eb0a7d',
            },
          })
          .then(({ data }) => {
            return data.nfts;
          });
          return nfts;
      },
    };
  };

  const [nftImage, setNftImage] = useState(null);

  const handleButtonClick = async () => {
    const client = XRPNftReaderClient();
    const nfts = await client.getWalletNfts(wallet.address, identifiers);
    if (nfts.length > 0 && nfts[0].metadata.image.startsWith('ipfs://')) {
      setNftImage(`https://ipfs.io/ipfs/${nfts[0].metadata.image.slice(7)}`);
    } else {
      setNftImage(null);
    }
  };

  return (
    <div>
        {/*
        <Tokengate
          isConnected={Boolean(wallet)}
          connectedButton={false}
          connectButton={<ConnectButton />}
          isLoading={false}
          requirements={requirements}
          reaction={reaction}
          isLocked={isLocked}
          unlockingTokens={unlockingTokens}
        />
        */}
        <p>Wallet Address: {wallet.address}</p>
        <p>Requirement Name: {requirements.conditions[0].name}</p>
        <p>Requirement Contract Address: {requirements.conditions[0].contractAddress}</p>
        <p>Requirement Image URL: {requirements.conditions[0].imageUrl}</p>
        <p>Reaction name: {reaction.name}</p>
        <p>Reaction type: {reaction.type}</p>
        <p>Reaction discount: {reaction.discount.type} {reaction.discount.value}</p>
        <button onClick={handleButtonClick}>Fetch NFTs</button>
        {nftImage && <img src={nftImage} alt="NFT" style={{ maxWidth: '100px', maxHeight: '100px' }} />}
      </div>
  );
};

export const App = () => {
  return (
    <WagmiConfig config={config}>
      <ConnectWalletProvider chains={chains} connectors={connectors}>
        <_App />
      </ConnectWalletProvider>
    </WagmiConfig>
  );
};

const getGate = () => window.myAppGates?.[0] || {};

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet],
  [publicProvider()],
);

const { connectors, wagmiConnectors } = buildConnectors({
  chains,
  projectId: '8fdf31e1873a277a317106c8e8120ec6',
});

const config = createConfig({
  autoConnect: true,
  connectors: wagmiConnectors,
  publicClient,
  webSocketPublicClient,
});
