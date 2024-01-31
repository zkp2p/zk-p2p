import React, { useEffect, useState, ReactNode } from 'react';

import {
  SendNetworkType,
  SendNetwork,
  sendNetworks,
  ReceiveTokenType,
  ReceiveToken,
  networkSupportedTokens
} from '@helpers/types';

import SendSettingsContext from './SendSettingsContext'


interface ProvidersProps {
  children: ReactNode;
};

const SendSettingsProvider = ({ children }: ProvidersProps) => {
  /*
   * State
   */

  const [sendNetwork, setSendNetwork] = useState<SendNetworkType>(SendNetwork.BASE);


  const [receiveToken, setReceiveToken] = useState<ReceiveTokenType>(ReceiveToken.USDC);

  /*
   * Hooks
   */

  useEffect(() => {
    const storedSelectedSendNetwork = localStorage.getItem('storedSelectedSendNetwork');
    
    if (storedSelectedSendNetwork) {
      setSendNetwork(JSON.parse(storedSelectedSendNetwork));
    }
  }, []);

  useEffect(() => {
    if (sendNetwork) {
      localStorage.setItem('storedSelectedSendNetwork', JSON.stringify(sendNetwork));

      const newReceiveToken = networkSupportedTokens[sendNetwork][0];
      setReceiveToken(newReceiveToken);
    }
  }, [sendNetwork]);

  useEffect(() => {
    const storedSelectedReceiveToken = localStorage.getItem('storedSelectedReceiveToken');
    
    if (storedSelectedReceiveToken) {
      setReceiveToken(JSON.parse(storedSelectedReceiveToken));
    }
  }, []);

  useEffect(() => {
    if (receiveToken) {
      localStorage.setItem('storedSelectedReceiveToken', JSON.stringify(receiveToken));
    }
  }, [receiveToken]);

  return (
    <SendSettingsContext.Provider
      value={{
        sendNetwork,
        setSendNetwork,
        SendNetwork,
        sendNetworks,
        receiveToken,
        setReceiveToken
      }}
    >
      {children}
    </SendSettingsContext.Provider>
  );
};

export default SendSettingsProvider;
