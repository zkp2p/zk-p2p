import React, { useEffect, useState, ReactNode } from 'react'
import { useAccount, useNetwork } from 'wagmi';

import { contractAddresses } from "../../helpers/deployed_addresses";

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
  const [ethereumAddress, setEthereumAddress] = useState<string>(address ?? "");
  const [network, setNetwork] = useState<string>(chain?.network ?? "");

  const [rampAddress, setRampAddress] = useState<string>("");
  const [usdcAddress, setUsdcAddress] = useState<string>("");

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

  useEffect(() => {
    if (chain) {
      setNetwork(chain.network);
      setRampAddress(contractAddresses[chain.network].ramp);
      setUsdcAddress(contractAddresses[chain.network].fusdc);
    } else {
      setNetwork("");
      setRampAddress("");
      setUsdcAddress("");
    }
  }, [chain]);

  return (
    <AccountContext.Provider
      value={{
        ethereumAddress,
        network,
        rampAddress,
        usdcAddress
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export default AccountProvider
