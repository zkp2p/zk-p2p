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

  const { isLoggedIn, loggedInEthereumAddress } = useAccount();
  const { venmoRampAddress, hdfcRampAddress, usdcAddress } = useSmartContracts();

  /*
   * State
   */

  const [ethBalance, setEthBalance] = useState<bigint | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<bigint | null>(null);
  const [usdcApprovalToRamp, setUsdcApprovalToRamp] = useState<bigint | null>(null);
  const [usdcApprovalToHdfcRamp, setUsdcApprovalToHdfcRamp] = useState<bigint | null>(null);

  const [shouldFetchEthBalance, setShouldFetchEthBalance] = useState<boolean>(false);
  const [shouldFetchUsdcBalance, setShouldFetchUsdcBalance] = useState<boolean>(false);
  const [shouldFetchUsdcApprovalToRamp, setShouldFetchUsdcApprovalToRamp] = useState<boolean>(false);

  /*
   * Contract Reads
   */

  const {
    data: ethBalanceRaw,
    refetch: refetchEthBalance,
  } = useBalance({
    address: loggedInEthereumAddress ?? ZERO_ADDRESS,
    enabled: shouldFetchEthBalance,
  });

  const {
    data: usdcBalanceRaw,
    refetch: refetchUsdcBalance,
  } = useBalance({
    address: loggedInEthereumAddress ?? ZERO_ADDRESS,
    token: usdcAddress,
    enabled: shouldFetchUsdcBalance,
  })

  const {
    data: usdcApprovalToRampRaw,
    refetch: refetchUsdcApprovalToRamp,
  } = useContractRead({
    address: usdcAddress,
    abi: erc20ABI,
    functionName: "allowance",
    args: [
      loggedInEthereumAddress ?? ZERO_ADDRESS,
      venmoRampAddress
    ],
    enabled: shouldFetchUsdcApprovalToRamp,
  });

  const {
    data: usdcApprovalToHdfcRampRaw,
    refetch: refetchUsdcApprovalToHdfcRamp,
  } = useContractRead({
    address: usdcAddress,
    abi: erc20ABI,
    functionName: "allowance",
    args: [
      loggedInEthereumAddress ?? ZERO_ADDRESS,
      hdfcRampAddress
    ],
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
    esl && console.log('checking venmoRampAddress: ', venmoRampAddress);
    esl && console.log('checking usdcAddress: ', usdcAddress);

    if (isLoggedIn && loggedInEthereumAddress && venmoRampAddress && usdcAddress) {
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
  }, [isLoggedIn, loggedInEthereumAddress, venmoRampAddress, usdcAddress]);
  
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

  useEffect(() => {
    esl && console.log('usdcApprovalToHdfcRampRaw_1');
    esl && console.log('checking usdcApprovalToHdfcRampRaw: ', usdcApprovalToHdfcRampRaw);
  
    if (usdcApprovalToHdfcRampRaw || usdcApprovalToHdfcRampRaw === ZERO) { // BigInt(0) is falsy
      esl && console.log('usdcApprovalToHdfcRampRaw_2');

      setUsdcApprovalToHdfcRamp(usdcApprovalToHdfcRampRaw);
    } else {
      esl && console.log('usdcApprovalToHdfcRampRaw_3');
      
      setUsdcApprovalToHdfcRamp(null);
    }
  }, [usdcApprovalToHdfcRampRaw]);

  return (
    <BalancesContext.Provider
      value={{
        ethBalance,
        refetchEthBalance,
        shouldFetchEthBalance,
        usdcBalance,
        refetchUsdcBalance,
        shouldFetchUsdcBalance,
        usdcApprovalToRamp,
        refetchUsdcApprovalToRamp,
        usdcApprovalToHdfcRamp,
        refetchUsdcApprovalToHdfcRamp,
      }}
    >
      {children}
    </BalancesContext.Provider>
  );
};

export default BalancesProvider
