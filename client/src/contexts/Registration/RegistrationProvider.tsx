import React, { useEffect, useState, ReactNode } from 'react'
import { useContractRead } from 'wagmi'

import { esl, ZERO_ADDRESS } from '@helpers/constants'
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

  const [registrationHash, setRegistrationHash] = useState<string | null>(null);
  const [registeredVenmoId, setRegisteredVenmoId] = useState<string | null>(null);

  const [shouldFetchRegistration, setShouldFetchRegistration] = useState<boolean>(false);

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
    refetch: refetchRampAccount,
  } = useContractRead({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'getAccountInfo',
    args: [
      loggedInEthereumAddress
    ],
    enabled: shouldFetchRegistration,
  })

  /*
   * Additional Reads:
   */

  // mapping(address => AccountInfo) public accounts;
  // mapping(bytes32 => bytes32) public venmoIdIntent;

  /*
   * Hooks
   */

  useEffect(() => {
    esl && console.log('shouldFetchRegistration_1');
    esl && console.log('checking isLoggedIn: ', isLoggedIn);
    esl && console.log('checking loggedInEthereumAddress: ', loggedInEthereumAddress);
    esl && console.log('checking rampAddress: ', rampAddress);
    
    if (isLoggedIn && loggedInEthereumAddress && rampAddress) {
      esl && console.log('shouldFetchRegistration_2');

      setShouldFetchRegistration(true);
    } else {
      esl && console.log('shouldFetchRegistration_3');
      
      setShouldFetchRegistration(false);

      setRegistrationHash(null);
      setRegisteredVenmoId(null);
    }
  }, [isLoggedIn, loggedInEthereumAddress, rampAddress]);

  useEffect(() => {
    esl && console.log('rampAccountRaw_1');
    esl && console.log('checking rampAccountRaw: ', rampAccountRaw);
  
    if (rampAccountRaw) {
      esl && console.log('rampAccountRaw_2');

      const rampAccountData = rampAccountRaw as any;
      const rampAccountProcessed = rampAccountData.venmoIdHash;
      
      setRegistrationHash(rampAccountProcessed);
    } else {
      esl && console.log('rampAccountRaw_3');
      
      setRegistrationHash(null);
    }
  }, [rampAccountRaw]);

  return (
    <RegistrationContext.Provider
      value={{
        isRegistered,
        registrationHash,
        registeredVenmoId,
        refetchRampAccount,
        shouldFetchRegistration,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};

export default RegistrationProvider
