import React, { useEffect, useState, ReactNode } from 'react'
import { erc20ABI, useBalance, useContractRead } from 'wagmi'

import { esl, ZERO, ZERO_ADDRESS } from '@helpers/constants'
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
    // cacheTime: 20_000,
    enabled: shouldFetchEthBalance,
  });

  const {
    data: usdcBalanceRaw,
    // isLoading: isFetchUsdcBalanceLoading,
    // isError: isFetchUsdcBalanceError,
    refetch: refetchUsdcBalance,
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
    refetch: refetchUsdcApprovalToRamp,
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
    esl && console.log('shouldFetchEthBalance_1');
    esl && console.log('checking isLoggedIn: ', isLoggedIn);
    esl && console.log('checking loggedInEthereumAddress: ', loggedInEthereumAddress);

    if (isLoggedIn && loggedInEthereumAddress) {
      esl && console.log('shouldFetchEthBalance_2');

      setShouldFetchEthBalance(true);
    } else {
      esl && console.log('shouldFetchEthBalance_3');

      setShouldFetchEthBalance(false);

      setEthBalance(null);
      setUsdcBalance(null);
      setUsdcApprovalToRamp(null);
    }
  }, [isLoggedIn, loggedInEthereumAddress]);

  useEffect(() => {
    esl && console.log('shouldFetchUsdcBalanceAndApproval_1');
    esl && console.log('checking isLoggedIn: ', isLoggedIn);
    esl && console.log('checking loggedInEthereumAddress: ', loggedInEthereumAddress);
    esl && console.log('checking rampAddress: ', rampAddress);
    esl && console.log('checking usdcAddress: ', usdcAddress);

    if (isLoggedIn && loggedInEthereumAddress && rampAddress && usdcAddress) {
      esl && console.log('shouldFetchUsdcBalanceAndApproval_2');

      setShouldFetchUsdcBalance(true);
      setShouldFetchUsdcApprovalToRamp(true);
    } else {
      esl && console.log('shouldFetchUsdcBalanceAndApproval_3');

      setShouldFetchUsdcBalance(false);
      setShouldFetchUsdcApprovalToRamp(false);

      setEthBalance(null);
      setUsdcBalance(null);
      setUsdcApprovalToRamp(null);
    }
  }, [isLoggedIn, loggedInEthereumAddress, rampAddress, usdcAddress]);
  
  useEffect(() => {
    esl && console.log('ethBalanceRaw_1');
    esl && console.log('checking ethBalanceRaw: ', ethBalanceRaw);
  
    if (ethBalanceRaw) {
      esl && console.log('ethBalanceRaw_2');

      const ethBalanceProcessed = ethBalanceRaw.value;

      setEthBalance(ethBalanceProcessed);
    } else {
      esl && console.log('ethBalanceRaw_3');

      setEthBalance(null);
    }
  }, [ethBalanceRaw]);

  useEffect(() => {
    esl && console.log('usdcBalanceRaw_1');
    esl && console.log('checking usdcBalanceRaw: ', usdcBalanceRaw);
  
    if (usdcBalanceRaw) {
      esl && console.log('usdcBalanceRaw_2');

      const usdcBalanceRawProcessed = usdcBalanceRaw.value;

      setUsdcBalance(usdcBalanceRawProcessed);
    } else {
      esl && console.log('usdcBalanceRaw_3');

      setUsdcBalance(null);
    }
  }, [usdcBalanceRaw]);

  useEffect(() => {
    esl && console.log('usdcApprovalToRampRaw_1');
    esl && console.log('checking usdcApprovalToRampRaw: ', usdcApprovalToRampRaw);
  
    if (usdcApprovalToRampRaw || usdcApprovalToRampRaw === ZERO) { // BigInt(0) is falsy
      esl && console.log('usdcApprovalToRampRaw_2');

      setUsdcApprovalToRamp(usdcApprovalToRampRaw);
    } else {
      esl && console.log('usdcApprovalToRampRaw_3');
      
      setUsdcApprovalToRamp(null);
    }
  }, [usdcApprovalToRampRaw]);

  return (
    <BalancesContext.Provider
      value={{
        ethBalance,
        usdcBalance,
        usdcApprovalToRamp,
        refetchUsdcApprovalToRamp,
        refetchUsdcBalance,
      }}
    >
      {children}
    </BalancesContext.Provider>
  );
};

export default BalancesProvider
