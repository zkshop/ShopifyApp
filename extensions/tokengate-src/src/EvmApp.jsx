import React, { useEffect, useState } from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export const EVMApp = () => {
    const { address, isConnected } = useAccount();

    const [nftImage, setNftImage] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    
    const { requirements } = getGate();
    const buttons = document.querySelectorAll('.shopify-payment-button__button--unbranded, .product-form__submit');
    
    const handleNftSearchOwner = async () => {
      if (address === null) {
        setIsOwner(false);
        return;
      }
      else if (!isConnected) {
        setIsOwner(false);
        return;
      }
      const options = {method: 'GET', headers: {accept: 'application/json'}};

      const network = requirements?.conditions?.network;
      let networkPath;
      if (network === "Ethereum") {
        networkPath = "eth-mainnet";
      } else if (network === "Polygon") {
        networkPath = "polygon-mainnet";
      } else if (network === "Base") {
        networkPath = "base-mainnet";
      }
      //networkPath = "opt-mainnet"; // Here to test with my wallet

      const alchemyUrl = `https://${networkPath}.g.alchemy.com/nft/v3/${import.meta.env.VITE_SECRET_ALCHEMY}/isHolderOfContract?wallet=${address}&contractAddress=${requirements?.conditions?.contractAddress}`;

      fetch(alchemyUrl, options)
        .then(response => response.json())
        .then(response => {
          if (response.isHolderOfContract) {
            setIsOwner(true);
          } else {
            setIsOwner(false);
          }
        })
        .catch(err => {
          console.error(err);
          setIsOwner(false);
        });
    };
    
    useEffect(() => {
      handleNftSearchOwner();
    }, [address]);
      
    useEffect(() => {
      callGetNfts();
    }, []);
      
    const callGetNfts = async () => {
      const options = {method: 'GET', headers: {accept: 'application/json'}};

      const network = requirements?.conditions?.network;
      let networkPath;
      if (network === "Ethereum") {
        networkPath = "eth-mainnet";
      } else if (network === "Polygon") {
        networkPath = "polygon-mainnet";
      } else if (network === "Base") {
        networkPath = "base-mainnet";
      }

      const alchemyUrl = `https://${networkPath}.g.alchemy.com/nft/v3/${import.meta.env.VITE_SECRET_ALCHEMY}/getNFTMetadata?contractAddress=${requirements?.conditions?.contractAddress}&tokenId=231&refreshCache=false`;

      fetch(alchemyUrl, options)
        .then(response => response.json())
        .then(response => {
          console.log(response);
        })
        .catch(err => {
          console.error(err);
        });  
        
      setNftImage(null);
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
              <div style={{display: 'flex', justifyContent: 'center', marginTop: '5px', width: '90%'}}>
                <ConnectButton label="Connect your wallet" accountStatus="address" showBalance={false} chainStatus="none"/> 
              </div>
            {nftImage && <img src={nftImage} alt="NFT" style={{ maxWidth: '50px', maxHeight: '50px', borderRadius: '50%', position: 'absolute', top: '-10px', right: '-10px' }} />}
          </div>
        </div>
    );
  };

  const getGate = () => window.myAppGates?.[0] || {};
