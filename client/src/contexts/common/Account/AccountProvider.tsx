import React, { useEffect, useState, ReactNode } from 'react';
import { useAccount, useConnect, useDisconnect, useNetwork } from 'wagmi';

import { esl } from '@helpers/constants';

import AccountContext from './AccountContext';


interface ProvidersProps {
  children: ReactNode;
}

const AccountProvider = ({ children }: ProvidersProps) => {
  const { address, status: accountStatus } = useAccount();
  const { chain } = useNetwork();
  const { disconnect, status: disconnectStatus } = useDisconnect();
  const { status: connectStatus } = useConnect();

  /*
   * State
   */

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loggedInEthereumAddress, setLoggedInEthereumAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);

  /*
   * Hooks
   */

  useEffect(() => {
    esl && console.log('addressRaw_1');
    esl && console.log('checking address: ', address);

    if (address) {
      esl && console.log('addressRaw_2');

      setLoggedInEthereumAddress(address);
      setIsLoggedIn(true);
    } else {
      esl && console.log('addressRaw_3');

      setLoggedInEthereumAddress(null);
      setIsLoggedIn(false);
    }
  }, [address]);

  useEffect(() => {
    esl && console.log('networkRaw_1');
    esl && console.log('checking chain: ', chain);

    if (chain) {
      esl && console.log('networkRaw_2');

      setNetwork(chain.network);
    } else {
      esl && console.log('networkRaw_3');

      setNetwork(null);
    }
  }, [chain]);

  useEffect(() => {
    esl && console.log('status_1');
    esl && console.log('checking accountStatus: ', accountStatus);

    if (accountStatus === 'reconnecting') {
      esl && console.log('status_2');

      disconnect();

      setIsLoggedIn(false);
      setLoggedInEthereumAddress(null);
    } else {
      esl && console.log('status_3');
    }
  }, [accountStatus, disconnect]);

  return (
    <AccountContext.Provider
      value={{
        isLoggedIn,
        loggedInEthereumAddress,
        network,
        accountStatus,
        connectStatus,
        disconnectStatus,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export default AccountProvider;
