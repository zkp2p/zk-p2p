import React, { useEffect, useState, ReactNode } from 'react'
import { erc20ABI, useBalance, useContractRead } from 'wagmi'

import { ZERO, ZERO_ADDRESS } from '@helpers/constants'
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

  const [ethBalance, setEthBalance] = useState<bigint | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<bigint | null>(null);
  const [usdcApprovalToRamp, setUsdcApprovalToRamp] = useState<bigint | null>(null);

  const [shouldFetchEthBalance, setShouldFetchEthBalance] = useState<boolean>(false);
  const [shouldFetchUsdcBalance, setShouldFetchUsdcBalance] = useState<boolean>(false);
  const [shouldFetchUsdcApprovalToRamp, setShouldFetchUsdcApprovalToRamp] = useState<boolean>(false);

  /*
   * Contract Reads
   */

  const {
    data: ethBalanceRaw,
    // isLoading: isFetchEthBalanceLoading,
    // isError: isFetchEthBalanceError,
    // refetch: refetchEthBalance,
  } = useBalance({
    address: loggedInEthereumAddress ?? ZERO_ADDRESS,
    watch: true,
    // cacheTime: 20_000,
    enabled: shouldFetchEthBalance,
  });

  const {
    data: usdcBalanceRaw,
    // isLoading: isFetchUsdcBalanceLoading,
    // isError: isFetchUsdcBalanceError,
    // refetch: refetchUsdcBalance,
  } = useBalance({
    address: loggedInEthereumAddress ?? ZERO_ADDRESS,
    token: usdcAddress,
    // cacheTime: 20_000,
    enabled: shouldFetchUsdcBalance,
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
    args: [
      loggedInEthereumAddress ?? ZERO_ADDRESS,
      rampAddress
    ],
    // cacheTime: 20_000,
    enabled: shouldFetchUsdcApprovalToRamp,
  });

  /*
   * Hooks
   */

  useEffect(() => {
    // console.log('shouldFetchEthBalance_1');
    if (isLoggedIn && loggedInEthereumAddress) {
      // console.log('shouldFetchEthBalance_2');
      setShouldFetchEthBalance(true);
    } else {
      // console.log('shouldFetchEthBalance_3');
      setShouldFetchEthBalance(false);

      setEthBalance(null);
      setUsdcBalance(null);
      setUsdcApprovalToRamp(null);
    }
  }, [isLoggedIn, loggedInEthereumAddress]);

  useEffect(() => {
    // console.log('shouldFetchUsdcBalanceAndApproval_1');
    if (isLoggedIn && loggedInEthereumAddress && rampAddress && usdcAddress) {
      // console.log('shouldFetchUsdcBalanceAndApproval_2');
      setShouldFetchUsdcBalance(true);
      setShouldFetchUsdcApprovalToRamp(true);
    } else {
      // console.log('shouldFetchUsdcBalanceAndApproval_3');
      setShouldFetchUsdcBalance(false);
      setShouldFetchUsdcApprovalToRamp(false);

      setEthBalance(null);
      setUsdcBalance(null);
      setUsdcApprovalToRamp(null);
    }
  }, [isLoggedIn, loggedInEthereumAddress, rampAddress, usdcAddress]);
  
  useEffect(() => {
    // console.log('ethBalanceRaw_1');
  
    if (ethBalanceRaw) {
      // console.log('ethBalanceRaw_2');
      // console.log(ethBalanceRaw);
      const ethBalanceProcessed = ethBalanceRaw.value;

      setEthBalance(ethBalanceProcessed);
    } else {
      // console.log('ethBalanceRaw_3');
      setEthBalance(ZERO);
    }
  }, [ethBalanceRaw]);

  useEffect(() => {
    // console.log('usdcBalanceRaw_1');
  
    if (usdcBalanceRaw) {
      // console.log('usdcBalanceRaw_2');
      // console.log(usdcBalanceRaw);
      const usdcBalanceRawProcessed = usdcBalanceRaw.value;

      setUsdcBalance(usdcBalanceRawProcessed);
    } else {
      console.log('usdcBalanceRaw_3');
      setUsdcBalance(ZERO);
    }
  }, [usdcBalanceRaw]);

  useEffect(() => {
    // console.log('usdcApprovalToRampRaw_1');
  
    if (usdcApprovalToRampRaw) {
      // console.log('usdcApprovalToRampRaw_2');
      // console.log(usdcApprovalToRampRaw);

      setUsdcApprovalToRamp(usdcApprovalToRampRaw);
    } else {
      // console.log('usdcApprovalToRampRaw_3');
      setUsdcApprovalToRamp(ZERO);
    }
  }, [usdcApprovalToRampRaw]);

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
