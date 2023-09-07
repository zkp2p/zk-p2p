import React, { useEffect, useState, ReactNode } from 'react'
import { erc20ABI, useBalance, useContractRead } from 'wagmi'

import useAccount from '../../hooks/useAccount'
import BalancesContext from './BalancesContext'
import BigNumber from '../../helpers/bignumber'
import { fromUsdc } from '../../helpers/units'


interface ProvidersProps {
  children: ReactNode;
}

const BalancesProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */
  const { ethereumAddress, rampAddress, usdcAddress } = useAccount()

  /*
   * State
   */
  const [ethBalance, setEthBalance] = useState<BigNumber>();
  const [usdcBalance, setUsdcBalance] = useState<BigNumber>();
  const [usdcApprovalToRamp, setUsdcApprovalToRamp] = useState<BigNumber>();

  /*
   * Contract Reads
   */

  const {
    data: usdcBalanceRaw,
    // isLoading: isFetchUsdcBalanceLoading,
    // isError: isFetchUsdcBalanceError,
    // refetch: refetchUsdcBalance,
  } = useBalance({
    address: ethereumAddress as `0x${string}`,
    token: usdcAddress as `0x${string}`,
    watch: true,
    // cacheTime: 20_000,
    enabled: true,
    onSettled(data, error) {
      console.log('USDC Balance', { data, error })
    },
  })

  const {
    data: usdcApprovalToRampRaw,
    // isLoading: isFetchUsdcApprovalToRampLoading,
    // isError: isFetchUsdcApprovalToRampError,
    // refetch: refetchUsdcApprovalToRamp,
  } = useContractRead({
    address: usdcAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: "allowance",
    args: [ethereumAddress as `0x${string}`, rampAddress as `0x${string}`],
    watch: true,
    // cacheTime: 20_000,
    enabled: true,
    onSettled(data, error) {
      console.log('USDC Approval to Ramp', { data, error })
    },
  });

  const {
    data: ethBalanceRaw,
    // isLoading: isFetchEthBalanceLoading,
    // isError: isFetchEthBalanceError,
    // refetch: refetchEthBalance,
  } = useBalance({
    address: ethereumAddress as `0x${string}`,
    watch: true,
    // cacheTime: 20_000,
    enabled: true,
    onSettled(data, error) {
      console.log('ETH Balance', { data, error })
    },
  })

  /*
   * Hooks
   */
  useEffect(() => {
    console.log('ethBalanceRaw_1');
    console.log(ethBalanceRaw);
  
    if (ethereumAddress && ethBalanceRaw) {
      const ethBalanceProcessed = ethBalanceRaw.formatted;
      console.log('ethBalanceProcessed');
      console.log(ethBalanceProcessed);
      setEthBalance(new BigNumber(ethBalanceProcessed));
    } else {
      setEthBalance(new BigNumber(0));
    }
  }, [ethereumAddress, ethBalanceRaw]);

  useEffect(() => {
    console.log('usdcBalanceRaw_1');
    console.log(usdcBalanceRaw);
  
    if (ethereumAddress && usdcBalanceRaw) {
      const usdcBalanceRawProcessed = usdcBalanceRaw.formatted;
      console.log('usdcBalanceRawProcessed');
      console.log(usdcBalanceRawProcessed);
      setUsdcBalance(new BigNumber(usdcBalanceRawProcessed));
    } else {
      setUsdcBalance(new BigNumber(0));
    }
  }, [ethereumAddress, usdcBalanceRaw]);

  useEffect(() => {
    console.log('usdcApprovalToRampRaw_1');
    console.log(usdcApprovalToRampRaw);
  
    if (ethereumAddress && usdcApprovalToRampRaw) {
      const usdcApprovalToRampProcessed = fromUsdc(usdcApprovalToRampRaw.toString());
      console.log('usdcApprovalToRampProcessed');
      console.log(usdcApprovalToRampProcessed);
      setUsdcApprovalToRamp(new BigNumber(usdcApprovalToRampProcessed));
    } else {
      setUsdcApprovalToRamp(new BigNumber(0));
    }
  }, [ethereumAddress, usdcApprovalToRampRaw]);

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
