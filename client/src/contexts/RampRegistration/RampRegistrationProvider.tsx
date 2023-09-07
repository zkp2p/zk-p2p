import React, { useEffect, useState, ReactNode } from 'react'
import { useContractRead } from 'wagmi'

import { Deposit } from './types'
import { ZERO_ADDRESS } from '../../helpers/constants'
import useAccount from '@hooks/useAccount'
import useSmartContracts from '@hooks/useSmartContracts';

import RampRegistrationContext from './RampRegistrationContext'


interface ProvidersProps {
  children: ReactNode;
}

const AccountProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */
  const { isLoggedIn, loggedInEthereumAddress } = useAccount()
  const { rampAddress, rampAbi } = useSmartContracts()

  /*
   * State
   */
  const [registrationHash, setRegistrationHash] = useState<string>("");
  const [registeredVenmoId, setRegisteredVenmoId] = useState<string>("");
  const [deposits, setDeposits] = useState<Deposit[]>([]);

  /*
    Helpers
  */
  // The !! operator will convert any truthy value to true and any falsy value to false.
  const isRegistered = !!(registrationHash && registrationHash !== ZERO_ADDRESS);

  /*
   * Contract Reads (migrate to: https://wagmi.sh/react/hooks/useContractReads)
   */

  // function getAccountVenmoId(address _account) external view returns (bytes32) {
  const {
    data: rampAccountRaw,
    // isLoading: isFetchRampAccountLoading,
    // isError: isRegistrationDataError,
    // refetch: refetchRampAccount,
  } = useContractRead({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'getAccountVenmoId',
    args: [loggedInEthereumAddress],
  })

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

  // mapping(bytes32 => Intent) public intents;
  // const {
  //   data: intentRaw,
  //   // isLoading: isFetchVenmoIdHashLoading,
  //   // isError: isRegistrationDataError,
  //   // refetch: refetchVenmoIdHash,
  // } = useContractRead({
  //   address: rampAddress,
  //   abi: rampAbi,
  //   functionName: 'intents',
  //   args: [registrationHash],
  // })

  /*
   * Additional Reads:
   */

  // mapping(address => AccountInfo) public accounts;
  // mapping(bytes32 => bytes32) public venmoIdIntent;

  // function getDeposit(uint256 _depositId) external view returns (Deposit memory) {
  // function getDepositFromIds(uint256[] memory _depositIds) external view returns (Deposit[] memory depositArray) {

  /*
   * Hooks
   */
  useEffect(() => {
    console.log('rampAccountRaw_1');
    console.log(rampAccountRaw);
  
    if (isLoggedIn && rampAccountRaw) {
      const rampAccountProcessed = rampAccountRaw as string;
      console.log('rampAccountProcessed');
      console.log(rampAccountProcessed);
      setRegistrationHash(rampAccountProcessed);
    } else {
      setRegistrationHash("");
    }
  }, [isLoggedIn, rampAccountRaw]);

  // useEffect(() => {
  //   console.log('refetchVenmoIdHash');

  //   if (isLoggedIn) {
  //     const intervalId = setInterval(() => {
  //       refetchVenmoIdHash();
  //     }, 15000); // Refetch every 15 seconds
  
  //     return () => {
  //       clearInterval(intervalId);
  //     };
  //   }
  // }, [isLoggedIn, refetchVenmoIdHash]);

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
    <RampRegistrationContext.Provider
      value={{
        isRegistered,
        registrationHash,
        registeredVenmoId,
        deposits,
      }}
    >
      {children}
    </RampRegistrationContext.Provider>
  );
};

export default AccountProvider
