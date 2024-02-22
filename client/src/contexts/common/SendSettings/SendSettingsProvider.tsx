import React, { useEffect, useState, ReactNode } from 'react';

import {
  ReceiveNetworkType,
  ReceiveNetwork,
  receiveNetworks,
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

  const [receiveNetwork, setReceiveNetwork] = useState<ReceiveNetworkType>(ReceiveNetwork.ZKSYNC);


  const [receiveToken, setReceiveToken] = useState<ReceiveTokenType>(ReceiveToken.USDC);

  /*
   * Hooks
   */

  useEffect(() => {
    const storedSelectedReceiveNetwork = localStorage.getItem('storedSelectedReceiveNetwork');
    
    if (storedSelectedReceiveNetwork) {
      setReceiveNetwork(JSON.parse(storedSelectedReceiveNetwork));
    }
  }, []);

  useEffect(() => {
    if (receiveNetwork) {
      localStorage.setItem('storedSelectedReceiveNetwork', JSON.stringify(receiveNetwork));

      const newReceiveToken = networkSupportedTokens[receiveNetwork][0];
      setReceiveToken(newReceiveToken);
    }
  }, [receiveNetwork]);

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
        receiveNetwork,
        setReceiveNetwork,
        ReceiveNetwork,
        receiveNetworks,
        receiveToken,
        setReceiveToken
      }}
    >
      {children}
    </SendSettingsContext.Provider>
  );
};

export default SendSettingsProvider;
