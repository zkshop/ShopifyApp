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
    issuer: requirements?.conditions?.[0]?.issuer,
    nftokenTaxon: requirements?.conditions?.[0]?.taxon,
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
        <div style={{border: '1px solid #ccc', borderRadius: '10px', padding: '10px', margin: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'column', position: 'relative'}}>
          <div style={{display: 'flex', alignItems: 'center', marginBottom: '5px', marginLeft: '10px', flexDirection: 'column'}}>
            <h2 style={{marginBottom: '5px', marginTop: '0'}}>{requirements?.conditions?.[0]?.name}</h2>
            <div>
              {isOwner ? <h3 style={{ color: 'green', marginTop: '5px' }}>gate unlocked</h3> : <h3 style={{ color: 'red', marginTop: '5px' }}>gate locked</h3>}
            </div>
          </div>
          <div style={{display: 'flex', justifyContent: 'center', marginTop: '5px', width: '90%'}}>
            <button style={{padding: '5px 10px', borderRadius: '5px', backgroundColor: '#007bff', color: '#fff', border: 'none', width: '100%', cursor: 'pointer', transition: 'background-color 0.3s ease-in-out'}} onClick={handleConnectWallet}>{wallet.address === null ? 'Unlock' : 'Lock'}</button>
          </div>
          {nftImage && <img src={nftImage} alt="NFT" style={{ maxWidth: '50px', maxHeight: '50px', borderRadius: '50%', position: 'absolute', top: '-10px', right: '-10px' }} />}
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

const getGate = () => {
  const gate = window.myAppGates?.[0];
  console.log("gate", gate);
  if (gate) {
    const { requirements } = gate;
    if (requirements) {
      const { conditions } = requirements;
      if (conditions && conditions.length > 0) {
        return gate;
      }
    }
  }
  return {};
};

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

