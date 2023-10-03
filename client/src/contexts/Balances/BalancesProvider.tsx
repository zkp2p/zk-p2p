import React, { useEffect, useState, ReactNode } from 'react'
import { erc20ABI, useBalance, useContractRead } from 'wagmi'

import { ZERO } from '@helpers/constants'
import useAccount from '@hooks/useAccount'
import useSmartContracts from '@hooks/useSmartContracts'

import BalancesContext from './BalancesContext'


interface ProvidersProps {
  children: ReactNode;
}

const BalancesProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */
  const { isLoggedIn, loggedInEthereumAddress } = useAccount()
  const { rampAddress, usdcAddress } = useSmartContracts()

  /*
   * State
   */
  const [ethBalance, setEthBalance] = useState<bigint>();
  const [usdcBalance, setUsdcBalance] = useState<bigint>();
  const [usdcApprovalToRamp, setUsdcApprovalToRamp] = useState<bigint>();

  /*
   * Contract Reads
   */

  const {
    data: usdcBalanceRaw,
    // isLoading: isFetchUsdcBalanceLoading,
    // isError: isFetchUsdcBalanceError,
    // refetch: refetchUsdcBalance,
  } = useBalance({
    address: loggedInEthereumAddress,
    token: usdcAddress,
    watch: true,
    // cacheTime: 20_000,
    enabled: true,
  })

  const {
    data: usdcApprovalToRampRaw,
    // isLoading: isFetchUsdcApprovalToRampLoading,
    // isError: isFetchUsdcApprovalToRampError,
    // refetch: refetchUsdcApprovalToRamp,
  } = useContractRead({
    address: usdcAddress,
    abi: erc20ABI,
    functionName: "allowance",
    args: [loggedInEthereumAddress, rampAddress],
    watch: true,
    // cacheTime: 20_000,
    enabled: true,
  });

  const {
    data: ethBalanceRaw,
    // isLoading: isFetchEthBalanceLoading,
    // isError: isFetchEthBalanceError,
    // refetch: refetchEthBalance,
  } = useBalance({
    address: loggedInEthereumAddress,
    watch: true,
    // cacheTime: 20_000,
    enabled: true,
  })

  /*
   * Hooks
   */
  useEffect(() => {
    console.log('ethBalanceRaw_1');
    console.log(ethBalanceRaw);
  
    if (isLoggedIn && ethBalanceRaw) {
      const ethBalanceProcessed = ethBalanceRaw.value;
      
      // console.log('ethBalanceProcessed');
      // console.log(ethBalanceProcessed);

      setEthBalance(ethBalanceProcessed);
    } else {
      setEthBalance(ZERO);
    }
  }, [isLoggedIn, ethBalanceRaw]);

  useEffect(() => {
    console.log('usdcBalanceRaw_1');
    console.log(usdcBalanceRaw);
  
    if (isLoggedIn && usdcBalanceRaw) {
      const usdcBalanceRawProcessed = usdcBalanceRaw.value;

      // console.log('usdcBalanceRawProcessed');
      // console.log(usdcBalanceRawProcessed);

      setUsdcBalance(usdcBalanceRawProcessed);
    } else {
      setUsdcBalance(ZERO);
    }
  }, [isLoggedIn, usdcBalanceRaw]);

  useEffect(() => {
    console.log('usdcApprovalToRampRaw_1');
    console.log(usdcApprovalToRampRaw);
  
    if (isLoggedIn && usdcApprovalToRampRaw) {
      setUsdcApprovalToRamp(usdcApprovalToRampRaw);
    } else {
      setUsdcApprovalToRamp(ZERO);
    }
  }, [isLoggedIn, usdcApprovalToRampRaw]);

  return (
    <BalancesContext.Provider
      value={{
        ethBalance,
        usdcBalance,
        usdcApprovalToRamp,
      }}
    >
      {children}
    </BalancesContext.Provider>
  );
};

export default BalancesProvider
