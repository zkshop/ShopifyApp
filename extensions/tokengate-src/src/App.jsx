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
      setWallet({ address: "rLLAmbFhd44wWfUbYmLSfd4qeTH4WAtTUo" });
    } else {
      setWallet({ address: null });
    }
  };

  const XRPNftReader = () => {
    return {
      getNft: async () => {
        const params = {
          uri: true,
        };
        const nft = await axios
          .get(`https://bithomp.com/api/v2/nft/${requirements.conditions[0].contractAddress}`, {
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

  // get image of gate on loading
  // 2 bithomp calls, can be optimized with better plan
    const callGetNft = async () => {
      const nftData = await XRPNftReader().getNft();
      // console.log("nftData", nftData);
      const nftIdentifiers = {
        issuer: nftData.issuer,
        nftokenTaxon: nftData.nftokenTaxon,
      };
      const nftWallet = nftData.owner;
      const client = XRPNftReaderClient();
      const nfts = await client.getWalletNfts(nftWallet, nftIdentifiers);
      // console.log("nfts", nfts);
      const selectedNft = nfts.find(nft => nft.nftokenID === requirements.conditions[0].contractAddress);
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
      // console.log("nftsData", nftsData);
    
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
    
        cycleImages(); // Set the initial image
    
        setInterval(cycleImages, 5000);
      } else {
        setNftImage(null);
      }
    };

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
          <h2>{requirements.conditions[0].name} discount for {reaction.discount.value}{reaction.discount.type === 'percentage' ? '%' : '$'}</h2>
          {nftImage && <img src={nftImage} alt="NFT" style={{ maxWidth: '100px', maxHeight: '100px' }} />}
          {isOwner ? <p style={{ color: 'green' }}>gate unlocked<br />add the product to your cart to see the discount</p> : <p style={{ color: 'red' }}>gate locked</p>}
          <button onClick={handleConnectWallet}>{wallet.address === null ? 'Connect your XRP wallet' : 'Disconnect your XRP wallet'}</button>
          <button onClick={callGetNfts}>Get NFTs</button>
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

