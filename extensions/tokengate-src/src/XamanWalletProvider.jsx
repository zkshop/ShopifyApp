import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

export const XamanWalletContext = createContext(undefined);

const httpServerless = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_FUNCTIONS_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  params: {
    key: import.meta.env.VITE_SERVERLESS_API_KEY,
  },
});

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
};

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

  const handlers = {
    close: () => {
      if (!state.auth.address)
        setState(stateInitialState);
      setIsCanceled(true);
    },
    disconnect: () => {
      setState(stateInitialState);
    }
  };

  return (
    <XamanWalletContext.Provider value={{
      state,
      handlers,
      auth: {
        address: state.auth.address,
        isConnected: () => state.auth.address !== undefined,
        isDisconnected: () => state.auth.address === undefined,
      },
    }}>
      {children}
    </XamanWalletContext.Provider>
  );
};

export const RenderQrCode = () => {
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
  