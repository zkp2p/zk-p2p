import React, { useEffect, useState, ReactNode } from 'react'
import { useContractRead } from 'wagmi'

import useAccount from '../../hooks/useAccount'
import RampRegistrationContext from './RampRegistrationContext'
import { Deposit } from './types'
import { abi } from "../../helpers/abi/ramp.abi";
import { ZERO_ADDRESS } from '../../helpers/constants'


interface ProvidersProps {
  children: ReactNode;
}

const AccountProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */
  const { ethereumAddress, rampAddress } = useAccount()

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
    // isLoading: isFetchVenmoIdHashLoading,
    // isError: isRegistrationDataError,
    // refetch: refetchVenmoIdHash,
  } = useContractRead({
    address: rampAddress as `0x${string}`,
    abi: abi,
    functionName: 'getAccountVenmoId',
    args: [ethereumAddress],
  })

  // function getAccountDeposits(address _account) external view returns (Deposit[] memory accountDeposits) {
  const {
    data: depositsRaw,
    isLoading: isFetchDepositsLoading,
    isError: isFetchDepositsError,
    // refetch: refetchDeposits,
  } = useContractRead({
    address: rampAddress as `0x${string}`,
    abi: abi,
    functionName: 'getAccountDeposits',
    args: [ethereumAddress],
  })

  // mapping(bytes32 => Intent) public intents;
  // const {
  //   data: intentRaw,
  //   // isLoading: isFetchVenmoIdHashLoading,
  //   // isError: isRegistrationDataError,
  //   // refetch: refetchVenmoIdHash,
  // } = useContractRead({
  //   address: rampAddress as `0x${string}`,
  //   abi: abi,
  //   functionName: 'intents',
  //   args: [registrationHash],
  // })

  /*
   * Additional Reads:
   */

  // mapping(address => AccountInfo) public accounts;
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
  
    if (ethereumAddress && rampAccountRaw) {
      setRegistrationHash(rampAccountRaw as string);
      // setRegisteredVenmoId(rampAccountRaw[1] as string);
    } else {
      setRegistrationHash("");
      // setRegisteredVenmoId("");
    }
  }, [ethereumAddress, rampAccountRaw]);

  // useEffect(() => {
  //   console.log('refetchVenmoIdHash');

  //   if (ethereumAddress) {
  //     const intervalId = setInterval(() => {
  //       refetchVenmoIdHash();
  //     }, 15000); // Refetch every 15 seconds
  
  //     return () => {
  //       clearInterval(intervalId);
  //     };
  //   }
  // }, [ethereumAddress, refetchVenmoIdHash]);

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

      if (ethereumAddress && depositsRaw) {
        setDeposits(sanitizedDeposits);
        console.log(sanitizedDeposits);
      } else {
        setDeposits([]);
      }
    }
  }, [ethereumAddress, depositsRaw, isFetchDepositsLoading, isFetchDepositsError]);

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
