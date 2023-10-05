import React, { useEffect, useState, ReactNode } from 'react'
import { Address, useAccount, useNetwork } from 'wagmi';

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
    // console.log('addressRaw_1');
    // console.log(address);

    if (address) {
      // console.log('addressRaw_2');
      setLoggedInEthereumAddress(address);
      setIsLoggedIn(true);
    } else {
      // console.log('addressRaw_3');
      setLoggedInEthereumAddress(null);
      setIsLoggedIn(false);
    }
  }, [address]);

  useEffect(() => {
    // console.log('networkRaw_1');
    // console.log(chain);

    if (chain) {
      // console.log('networkRaw_2');
      setNetwork(chain.network);
    } else {
      // console.log('networkRaw_3');
      setNetwork(null);
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
