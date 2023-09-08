import React, { useEffect, useState, ReactNode } from 'react'
import { useContractRead } from 'wagmi'

import { Deposit } from './types'
import useAccount from '@hooks/useAccount'
import useSmartContracts from '@hooks/useSmartContracts';

import DepositsContext from './DepositsContext'


interface ProvidersProps {
  children: ReactNode;
}

const DepositsProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */
  const { isLoggedIn, loggedInEthereumAddress } = useAccount()
  const { rampAddress, rampAbi } = useSmartContracts()

  /*
   * State
   */
  const [deposits, setDeposits] = useState<Deposit[]>([]);

  /*
   * Contract Reads
   */

  // function getAccountDeposits(address _account) external view returns (Deposit[] memory accountDeposits) {
  const {
    data: depositsRaw,
    isLoading: isFetchDepositsLoading,
    isError: isFetchDepositsError,
    // refetch: refetchDeposits,
  } = useContractRead({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'getAccountDeposits',
    args: [loggedInEthereumAddress],
  })

  /*
   * Additional Reads:
   */

  // function getDeposit(uint256 _depositId) external view returns (Deposit memory) {
  // function getDepositFromIds(uint256[] memory _depositIds) external view returns (Deposit[] memory depositArray) {

  /*
   * Hooks
   */
  useEffect(() => {
    if (!isFetchDepositsLoading && !isFetchDepositsError && depositsRaw) {
      const depositsArrayRaw = depositsRaw as any[];

      const sanitizedDeposits: Deposit[] = [];
      for (let i = depositsArrayRaw.length - 1; i >= 0; i--) {
        const depositData = depositsArrayRaw[i];
        
        const deposit: Deposit = {
          depositor: depositData.depositor.toString(),
          remainingDepositAmount: depositData.remainingDeposits.toString(),
          outstandingIntentAmount: depositData.outstandingIntentAmount.toString(),
          conversionRate: depositData.conversionRate.toString(),
          convenienceFee: depositData.convenienceFee.toString(),
        };

        sanitizedDeposits.push(deposit);
      }

      if (isLoggedIn && depositsRaw) {
        setDeposits(sanitizedDeposits);
        console.log(sanitizedDeposits);
      } else {
        setDeposits([]);
      }
    }
  }, [isLoggedIn, depositsRaw, isFetchDepositsLoading, isFetchDepositsError]);

  return (
    <DepositsContext.Provider
      value={{
        deposits,
      }}
    >
      {children}
    </DepositsContext.Provider>
  );
};

export default DepositsProvider
