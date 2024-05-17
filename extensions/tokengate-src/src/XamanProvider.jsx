import React, { useState, useEffect, useCallback } from 'react';
import { httpServerless } from './App';
import { XamanWalletContext } from './App';

const stateInitialState = {
    apiResponse: undefined,
    currentStep: "none",
    xummPayload: undefined,
    auth: {
      address: undefined,
    }
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