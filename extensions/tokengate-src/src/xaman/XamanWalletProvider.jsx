import React, { useEffect, useContext, createContext, useState, useCallback } from 'react';
import { HStack, Modal, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Spinner, VStack, Text, Button, CopyIcon, LogoutIcon, useToast, Box } from '@3shop/ui';
import { httpServerless } from '../../../http-serverless';
import { logo } from './logo';

const authDefault = {
  address: undefined,
  isConnected: false,
  isDisconnected: true
};

export const XamanWalletContext = createContext();

const stepToDescription = new Map(
  [['none', "Please scan the QR code with your Xaman mobile app"],
  ['scanned', "Slide to accept"]]
);

const stateInitialState = {
  modalOpen: false,
  apiResponse: undefined,
  currentStep: "none",
  xummPayload: undefined,
  auth: {
    address: undefined,
  }
}

export const XamanWalletProvider = ({ children }) => {
  const [state, setState] = useState(stateInitialState);
  const toast = useToast();

  const setStateByKey = useCallback((key, value) => {
    setState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  }, []);

  useEffect(() => {
    if (!state.modalOpen || state.auth.address !== undefined)
      return;
    (async () => {
      try {
        const { data } = await httpServerless.post("api/shop/xaman/signin");
        useSocketService(WebSocket, data.refs.websocket_status, (eventData) => {
          switch (true) {
            // unhandled events
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
              // TODO: handle expired behaviour
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
  }, [state.modalOpen]);

  useEffect(() => {
    (async () => {
      if (!state.xummPayload)
        return;
      try {
        const response = await httpServerless.post("api/shop/xaman/payload", { payload_uuid: state.xummPayload['payload_uuidv4'] });
        const address = response.data.response.signer;
        if (!address) {
          toast({
            status: 'error',
            title: 'We failed to authenticate you. Please try again',
          });
          handlers.disconnect();
        }
        else {
          setStateByKey('auth', { ...state.auth, address });
          setStateByKey('modalOpen', false);
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
      else
        setStateByKey('modalOpen', false);
    },
    copyAdress: () => {
      if (state.auth.address) {
        navigator.clipboard.writeText(state.auth.address);
        toast({
          status: 'success',
          title: 'Address copied to clipboard',
        });
      } else {
        toast({
          status: 'error',
          title: 'Failed to copy address to clipboard',
        });
      }
    },
    disconnect: () => {
      setState(stateInitialState);
    }
  }

  const RenderQrCode = ({ children }) => {
    if (!state.apiResponse)
      return <Spinner />;
    return (
      <Box display="flex" justifyContent="center" flexDirection="column" alignItems="center">
        <img src={state.apiResponse.refs.qr_png} alt="xaman-signin-qrcode" />
        {children}
      </Box>
    );
  }

  const stepDescription = () => stepToDescription.get(state.currentStep) || '';

  const renderModal = (
    <Modal isOpen={state.modalOpen} onClose={handlers.close}>
      <ModalOverlay />
      <ModalContent padding="6">
        {
          state.auth.address !== undefined ? (
            <>
              <ModalCloseButton />
              <VStack>
                {logo({ width: "70", height: "70" })}
                <svg width="100" height="100" viewBox="0 0 100 100" fill="#F5F5F5">
                  <circle cx="50" cy="50" r="50" fill="#F5F5F5" />
                  <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="black" fontSize="25">{state.auth.address?.substring(0, 3)}</text>
                </svg>
                <Text fontWeight="bold">{state.auth.address?.substring(0, 4) + "..." + state.auth.address?.slice(-4)}</Text>
                <HStack spacing="20px">
                  <Button leftIcon={<CopyIcon />} onClick={handlers.copyAdress}>Copy address</Button>
                  <Button variant={"negativeOutlined"} onClick={handlers.disconnect} leftIcon={<LogoutIcon />}>Disconnect</Button>
                </HStack>
              </VStack>
            </>
          ) : (
            <>
              <ModalHeader textAlign="center">
                {"Connect your xaman wallet"}
                <ModalCloseButton />
              </ModalHeader>
              <VStack align="center" spacing="0">
                <RenderQrCode>
                  <HStack>
                    <Spinner />
                    <Text>{stepDescription()}</Text>
                  </HStack >
                </RenderQrCode>
              </VStack>
            </>
          )
        }
      </ModalContent>
    </Modal>
  );

  return <>
    {renderModal}
    <XamanWalletContext.Provider value={{
      modal: {
        open: () =>
          setStateByKey('modalOpen', true),
        close: () => setStateByKey('modalOpen', false),
        isOpen: () => state.modalOpen
      },
      auth: {
        address: state.auth.address,
        isConnected: () => state.auth.address !== undefined,
        isDisconnected: () => state.auth.address === undefined,
      },
    }}>
      {children}
    </XamanWalletContext.Provider>
  </>
}

export const useAccount = () => {
  const context = useContext(XamanWalletContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within a XamanWalletProvider');
  }
  return context.auth;
}