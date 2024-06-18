import React, { useEffect, useState, ReactNode } from 'react';

import {
  ReceiveNetworkType,
  ReceiveNetwork,
  receiveNetworks,
  ReceiveTokenType,
  ReceiveToken,
  networkSupportedTokens
} from '@helpers/types';
import useQuery from '@hooks/useQuery';

import SendSettingsContext from './SendSettingsContext'


interface ProvidersProps {
  children: ReactNode;
};

const SendSettingsProvider = ({ children }: ProvidersProps) => {
  const { queryParams } = useQuery();
  const networkFromQuery = queryParams.NETWORK;
  const tokenFromQuery = queryParams.TO_TOKEN;

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

    if (networkFromQuery) {
      const isValidNetworkFromQuery = Object.values(ReceiveNetwork).includes(networkFromQuery as ReceiveNetworkType);

      if (isValidNetworkFromQuery) {
        setReceiveNetwork(networkFromQuery as ReceiveNetworkType);
      }
    }
  }, [networkFromQuery]);

  useEffect(() => {
    if (receiveNetwork) {
      localStorage.setItem('storedSelectedReceiveNetwork', JSON.stringify(receiveNetwork));

      const newReceiveToken = networkSupportedTokens[receiveNetwork][0];
      setReceiveToken(newReceiveToken);

      if (tokenFromQuery) {
        const isValidTokenFromQuery = networkSupportedTokens[receiveNetwork].includes(tokenFromQuery as ReceiveTokenType);
  
        if (isValidTokenFromQuery) {
          setReceiveToken(tokenFromQuery as ReceiveTokenType);
        }
      }
    }
  }, [receiveNetwork, tokenFromQuery]);

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
