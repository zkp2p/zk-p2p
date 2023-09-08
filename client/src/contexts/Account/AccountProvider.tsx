import React, { useEffect, useState, ReactNode } from 'react'
import { Address, useAccount, useNetwork } from 'wagmi';

import { ZERO_ADDRESS } from '../../helpers/constants'

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
  const [loggedInEthereumAddress, setLoggedInEthereumAddress] = useState<Address>(ZERO_ADDRESS);
  const [network, setNetwork] = useState<string>("");

  /*
   * Hooks
   */
  useEffect(() => {
    console.log('addressRaw_1');
    console.log(address);

    if (address) {
      setLoggedInEthereumAddress(address);
      setIsLoggedIn(true);
    } else {
      setLoggedInEthereumAddress(ZERO_ADDRESS);
      setIsLoggedIn(false);
    }
  }, [address]);

  useEffect(() => {
    console.log('networkRaw_1');
    console.log(chain);

    if (chain) {
      setNetwork(chain.network);
    } else {
      setNetwork("");
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
