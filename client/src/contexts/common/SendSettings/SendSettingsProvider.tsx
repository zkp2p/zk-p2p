import React, { useEffect, useState, ReactNode } from 'react';

import { SendNetworkType, SendNetwork, sendNetworks } from '@helpers/types';

import SendSettingsContext from './SendSettingsContext'


interface ProvidersProps {
  children: ReactNode;
};

const SendSettingsProvider = ({ children }: ProvidersProps) => {
  /*
   * State
   */

  const [sendNetwork, setSendNetwork] = useState<SendNetworkType>(SendNetwork.BASE);

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
      }
    }, [sendNetwork]);

  return (
    <SendSettingsContext.Provider
      value={{
        sendNetwork,
        setSendNetwork,
        SendNetwork,
        sendNetworks
      }}
    >
      {children}
    </SendSettingsContext.Provider>
  );
};

export default SendSettingsProvider;
