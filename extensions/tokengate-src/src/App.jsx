import React, { useEffect, useState, useContext } from "react";

// XRP
import { XamanWalletProvider, RenderQrCode } from './XamanWalletProvider';
import { XRPNftReaderClient, XRPNftsReader } from './BithompClient';

// EVM
import { chains, walletConfig } from './walletClient';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';

const _App = () => {
  const [wallet, setWallet] = useState({ address: null });
  const [nftImage, setNftImage] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  const { auth, handlers } = useContext(XamanWalletContext);
  const { requirements } = getGate();
  const buttons = document.querySelectorAll('.shopify-payment-button__button--unbranded, .product-form__submit');
  
  const identifiers = {
    issuer: requirements?.conditions?.issuer,
    nftokenTaxon: requirements?.conditions?.taxon,
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
  };
  
  useEffect(() => {
    handleNftSearchOwner();
  }, [wallet]);
  
  useEffect(() => {
    if (auth.address !== undefined)
      setWallet({ address: auth.address });
    else
      setWallet({ address: null });
  }, [auth.address]);

  const handleConnectWallet = () => {
    if (wallet.address === null) {
      setShowQR(true);
    }
  };

  const handleDisconnectWallet = () => {
    if (showQR)
      setShowQR(false);
    if (wallet.address !== null)
      handlers.disconnect();
    else
      handlers.close();
  };
    
  useEffect(() => {
    callGetNfts();
  }, []);
    
  const callGetNfts = async () => {
    const nftsData = await XRPNftsReader().getNfts();
      
    if (nftsData.nfts.length > 0) {
      for (let i = 0; i < nftsData.nfts.length; i++) {
        const selectedNft = nftsData.nfts[i];
        if (selectedNft && selectedNft.url) {
          if (selectedNft.metadata && selectedNft.metadata.image && selectedNft.metadata.image.startsWith('ipfs://')) {
            setNftImage(`https://cloudflare-ipfs.com/ipfs/${selectedNft.metadata.image.slice(7)}`);
            break;
          } else if (selectedNft.metadata && selectedNft.metadata.image_url) {
            setNftImage(`https://cloudflare-ipfs.com/ipfs/${selectedNft.metadata.image_url.slice(12)}`);
            break;
          }
        }
      }
    } else {
      setNftImage(null);
    }
  };

  useEffect(() => {
    if (buttons) {
      buttons.forEach(button => {
        button.disabled = !isOwner;
      });
    }
    const variantSelects = document.querySelector('variant-selects');
    if (variantSelects) {
      variantSelects.style.display = isOwner ? '' : 'none';
    }
  }, [isOwner, buttons]);
  
  return (
    <div>
      <div style={{border: '1px solid #ccc', borderRadius: '10px', padding: '10px', margin: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'column', position: 'relative'}}>
        <div style={{display: 'flex', alignItems: 'center', marginBottom: '5px', marginLeft: '10px', flexDirection: 'column'}}>
          <h2 style={{marginBottom: '5px', marginTop: '0'}}>{requirements?.conditions?.[0]?.name}</h2>
          <div>
            {isOwner ? <h3 style={{ color: 'green', marginTop: '5px' }}>content unlocked</h3> : <h3 style={{ color: 'red', marginTop: '5px' }}>content locked</h3>}
          </div>
        </div>
        {showQR && <RenderQrCode />}
        <div style={{display: 'flex', justifyContent: 'center', marginTop: '5px', width: '90%'}}>
          {showQR === false ?
            <button style={{padding: '5px 10px', borderRadius: '5px', backgroundColor: '#007bff', color: '#fff', border: 'none', width: '100%', cursor: 'pointer', transition: 'background-color 0.3s ease-in-out'}} onClick={handleConnectWallet}>Connect your Wallet</button>
            :
            <button style={{padding: '5px 10px', borderRadius: '5px', backgroundColor: 'red', color: '#fff', border: 'none', width: '100%', cursor: 'pointer', transition: 'background-color 0.3s ease-in-out'}} onClick={handleDisconnectWallet}>{wallet.address === null ? 'Cancel' : `Disconnect ${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}`}</button>
          }
        </div>
        {nftImage && <img src={nftImage} alt="NFT" style={{ maxWidth: '50px', maxHeight: '50px', borderRadius: '50%', position: 'absolute', top: '-10px', right: '-10px' }} />}
      </div>
    </div>
  );
};

const getGate = () => window.myAppGates?.[0] || {};

export const App = () => {
  return (
    <WagmiConfig config={walletConfig}>
      <RainbowKitProvider chains={chains}>
        <XamanWalletProvider>
          <_App />
        </XamanWalletProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
};
