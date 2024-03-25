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

import Client from 'shopify-buy';

function getShopDomain() {
  return window.Shopify.shop;
}

const _App = () => {
  // const client = Client.buildClient({
  //   domain: getShopDomain(),
  //   // storefrontAccessToken: 'your-storefront-access-token'
  // });
  // console.log("client", client);

  // const { wallet } = useConnectWallet({
  //   onConnect: (wallet) => {
  //     evaluateGate(wallet);
  //   },
  // });
  const [wallet, setWallet] = useState({ address: null });
  const [nftImage, setNftImage] = useState(null);
  const [isOwner, setIsOwner] = useState(null);

  // const { isLocked, unlockingTokens, evaluateGate, gateEvaluation } = useEvaluateGate();

  const { requirements, reaction } = getGate();

  const identifiers = {
    issuer: requirements.conditions[0].issuer,
    nftokenTaxon: requirements.conditions[0].taxon,
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

  const handleNftSearchOwner = async () => {
    if (wallet.address == null) {
      setIsOwner(false);
      return;
    }
    const client = XRPNftReaderClient();
    const nfts = await client.getWalletNfts(wallet.address, identifiers);
    if (nfts.length <= 0)
      setIsOwner(false);
    else
      setIsOwner(true);
  }

  useEffect(() => {
    handleNftSearchOwner();
  }, [wallet]);

  const handleConnectWallet = () => {
    if (wallet.address === null) {
      setWallet({ address: "rLLAmbFhd44wWfUbYmLSfd4qeTH4WAtTUo" }); // rV4o9Gmbj2DgoULL8RuAMB3644kLdoXKX 
    } else {
      setWallet({ address: null });
    }
  };

  const XRPNftsReader = () => {
    return {
      getNfts: async () => {
        const params = {
          issuer: identifiers.issuer,
          taxon: identifiers.nftokenTaxon,
        };
        const nft = await axios
          .get(`https://bithomp.com/api/v2/nfts`, {
            params,
            headers: {
              'x-bithomp-token': '131c5def-d154-4a4c-9dea-59afc1eb0a7d',
            },
          })
          .then(({ data }) => {
            return data;
          });
          return nft;
        },
      };
  };
  
    useEffect(() => {
      callGetNfts();
    }, []);
  
    const callGetNfts = async () => {
      const nftsData = await XRPNftsReader().getNfts();
    
      if (nftsData.nfts.length > 0) {
        let currentIndex = 0;
    
        const cycleImages = () => {
          const selectedNft = nftsData.nfts[currentIndex];
          if (selectedNft && selectedNft.url) {
            if (selectedNft.metadata && selectedNft.metadata.image && selectedNft.metadata.image.startsWith('ipfs://')) {
              setNftImage(`https://cloudflare-ipfs.com/ipfs/${selectedNft.metadata.image.slice(7)}`);
            } else if (selectedNft.metadata && selectedNft.metadata.image_url) {
              setNftImage(`https://cloudflare-ipfs.com/ipfs/${selectedNft.metadata.image_url.slice(12)}`);
            } else {
              setNftImage(null);
            }
          } else {
            setNftImage(null);
          }    
          currentIndex = (currentIndex + 1) % nftsData.nfts.length;
        };
    
        cycleImages();
    
        setInterval(cycleImages, 5000);
      } else {
        setNftImage(null);
      }
    };

  useEffect(() => {
    const buttons = document.querySelectorAll('.shopify-payment-button__button--unbranded, .product-form__submit');
    if (buttons) {
      buttons.forEach(button => {
        button.disabled = !isOwner;
      });
    }
  }, [isOwner]);

  return (
    <div>
        {/*
        <Tokengate
          isConnected={Boolean(wallet)}
          connectButton={<ConnectButton />}
          isLoading={false}
          requirements={requirements}
          reaction={reaction}
          isLocked={isLocked}
          unlockingTokens={unlockingTokens}
        />
        */}
        <div>
          <h2>{requirements.conditions[0].name} gate</h2>
          {nftImage && <img src={nftImage} alt="NFT" style={{ maxWidth: '100px', maxHeight: '100px' }} />}
          {isOwner ? <p style={{ color: 'green' }}>gate unlocked</p> : <p style={{ color: 'red' }}>gate locked</p>}
          <button onClick={handleConnectWallet}>{wallet.address === null ? 'Unlock' : 'Lock'}</button>
        </div>
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

