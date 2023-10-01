import React, { useEffect, useState, ReactNode } from 'react'
import { useContractRead } from 'wagmi'

import { ZERO_ADDRESS } from '../../helpers/constants'
import useAccount from '@hooks/useAccount'
import useSmartContracts from '@hooks/useSmartContracts';

import RegistrationContext from './RegistrationContext'


interface ProvidersProps {
  children: ReactNode;
}

const RegistrationProvider = ({ children }: ProvidersProps) => {
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
    functionName: 'getAccountInfo',
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

  /*
   * Hooks
   */
  useEffect(() => {
    console.log('rampAccountRaw_1');
    console.log(rampAccountRaw);
  
    if (isLoggedIn && rampAccountRaw) {
      const rampAccountData = rampAccountRaw as any;
      const rampAccountProcessed = rampAccountData.venmoIdHash;
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

  return (
    <RegistrationContext.Provider
      value={{
        isRegistered,
        registrationHash,
        registeredVenmoId,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};

export default RegistrationProvider
