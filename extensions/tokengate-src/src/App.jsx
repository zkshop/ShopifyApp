import React, { useEffect, useState, createContext, useCallback, useContext } from "react";
import axios from 'axios';

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

const stateInitialState = {
  apiResponse: undefined,
  currentStep: "none",
  xummPayload: undefined,
  auth: {
    address: undefined,
  }
};

const stepToDescription = new Map([
  ['none', "Please scan the QR code with your Xaman mobile app"],
  ['scanned', "Slide to accept"]
]);

XamanWalletContext.propTypes = {
  auth: PropTypes.shape({
    address: PropTypes.string,
    isConnected: PropTypes.bool,
    isDisconnected: PropTypes.bool
  })
};

const useSocketService = (websocketClient, websocket_status, onEvent) => {
  const socket = new websocketClient(websocket_status);
  socket.onmessage = (message) => {
    const eventData = JSON.parse(message.data);
    onEvent(eventData);
  };
  socket.onerror = (error) => {
    console.error('WebSocket error: ', error);
  };
  socket.onclose = () => {
    console.warn('WebSocket connection closed');
  };
  return socket;
}

export const XamanWalletProvider = ({ children }) => {
  const [state, setState] = useState(stateInitialState);
  const [isCanceled, setIsCanceled] = useState(false);
  
  const setStateByKey = useCallback((key, value) => {
    setState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  }, []);
  
  useEffect(() => {
    setIsCanceled(false);
    if (state.auth.address !== undefined)
      return;
    (async () => {
      try {
        const { data } = await httpServerless.post("api/shop/xaman/signin");
        useSocketService(WebSocket, data.refs.websocket_status, (eventData) => {
          switch (true) {
            case eventData.devapp_fetched:
              case eventData.pre_signed:
                case eventData.dispatched:
                  break;
                  case 'expires_in_seconds' in eventData:
                    if (Number(eventData.expires_in_seconds) <= 0)
                    setStateByKey('currentStep', 'expired');
                  break;
                  case eventData.opened:
                    setStateByKey('currentStep', 'scanned');
                    break;
                    case 'signed' in eventData:
                      setStateByKey('currentStep', 'signed');
                      setStateByKey('xummPayload', eventData);
                      break;
                      case eventData.expired:
                        setStateByKey('currentStep', 'expired');
                        break;
                        default:
                          break;
                        }
                      });
                      setStateByKey('apiResponse', data);
                    } catch (e) {
                      console.error(e);
                    }
                  })();
                }, [state.auth.address, isCanceled]);
                
                useEffect(() => {
                  (async () => {
                    if (!state.xummPayload)
                    return;
                  try {
                    const response = await httpServerless.post("api/shop/xaman/payload", { payload_uuid: state.xummPayload['payload_uuidv4'] });
                    const address = response.data.response.signer;
                    if (!address) {
                      handlers.disconnect();
                    }
                    else {
                      setStateByKey('auth', { ...state.auth, address });
                    }
                  } catch (e) {
                    console.error(e);
                  }
                })();
              }, [state.xummPayload]);
              
              const handlers = {
                close: () => {
                  if (!state.auth.address)
                  setState(stateInitialState);
                setIsCanceled(true);
              },
              disconnect: () => {
                setState(stateInitialState);
              }
            }
            
            return <>
    <XamanWalletContext.Provider value={
      {state,
        handlers,
        auth: {
          address: state.auth.address,
          isConnected: (() => state.auth.address !== undefined)(),
          isDisconnected: (() => state.auth.address === undefined)(),
        },
      }}>
      {children}
    </XamanWalletContext.Provider>
  </>
}

const RenderQrCode = () => {
  const { state } = useContext(XamanWalletContext);
  
  if (!state.apiResponse || !state.apiResponse.refs || ['expired', 'signed'].includes(state.currentStep)) {
    return null;
  }
  
  return (
    <div style={{display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center"}}>
      <img src={state.apiResponse.refs.qr_png} alt="xaman-signin-qrcode" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      <p>{stepToDescription.get(state.currentStep) || ''}</p>
    </div>
  );
};

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
            'x-bithomp-token': import.meta.env.VITE_BITHOMP_TOKEN,
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
            'x-bithomp-token': import.meta.env.VITE_BITHOMP_TOKEN,
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
      console.log("serverless", import.meta.env.VITE_PUBLIC_FUNCTIONS_URL);
      console.log("serverless", import.meta.env.VITE_SERVERLESS_API_KEY);
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
    <XamanWalletProvider>
      <_App />
    </XamanWalletProvider>
  );
};
