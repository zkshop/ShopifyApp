import React, { useContext } from 'react';
import { XamanWalletContext } from './App';

const stepToDescription = new Map([
    ['none', "Please scan the QR code with your Xaman mobile app"],
    ['scanned', "Slide to accept"]
  ]);
  
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