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
  const [ethereumAddress, setEthereumAddress] = useState<Address>(ZERO_ADDRESS);
  const [network, setNetwork] = useState<string>(chain?.network ?? "");

  /*
   * Hooks
   */
  useEffect(() => {
    if (address) {
      setEthereumAddress(address);
      setIsLoggedIn(true);
    } else {
      setEthereumAddress(ZERO_ADDRESS);
      setIsLoggedIn(false);
    }
  }, [address]);

  useEffect(() => {
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
        loggedInEthereumAddress: ethereumAddress,
        network,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export default AccountProvider
