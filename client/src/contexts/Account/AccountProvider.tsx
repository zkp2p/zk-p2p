import React, { useEffect, useState, ReactNode } from 'react'
import { Address, useAccount, useNetwork } from 'wagmi';

import { esl, DEFAULT_NETWORK } from '@helpers/constants'

import AccountContext from './AccountContext'


interface ProvidersProps {
  children: ReactNode;
}

const AccountProvider = ({ children }: ProvidersProps) => {
  const { address } = useAccount();
  const { chain } = useNetwork();

  /*
   * State
   */
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loggedInEthereumAddress, setLoggedInEthereumAddress] = useState<Address | null>(null);
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

      setNetwork(DEFAULT_NETWORK);
    }
  }, [chain]);

  return (
    <AccountContext.Provider
      value={{
        isLoggedIn,
        loggedInEthereumAddress,
        network,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export default AccountProvider
