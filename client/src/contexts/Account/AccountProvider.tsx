import React, { useEffect, useState, ReactNode } from 'react'
import { useAccount } from "wagmi";

import AccountContext from './AccountContext'


interface ProvidersProps {
  children: ReactNode;
}

const AccountProvider = ({ children }: ProvidersProps) => {
  const { address } = useAccount();

  /*
    State
  */
  const [ethereumAddress, setEthereumAddress] = useState<string>(address ?? "");

  /*
   * Hooks
   */
  useEffect(() => {
    if (address) {
      setEthereumAddress(address);
    } else {
      setEthereumAddress("");
    }
  }, [address]);

  return (
    <AccountContext.Provider
      value={{
        ethereumAddress
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export default AccountProvider
