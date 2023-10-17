import React, { useCallback, useEffect, useState, ReactNode } from 'react'
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

  const [extractedVenmoIdStorageKey, setExtractedVenmoIdStorageKey] = useState<string | null>(null);
  const [extractedVenmoId, _setExtractedVenmoId] = useState<string | null>(() => {
    if (extractedVenmoIdStorageKey) {
      return localStorage.getItem(extractedVenmoIdStorageKey) || null;
    }
    return null;
  });

  const [shouldFetchRegistration, setShouldFetchRegistration] = useState<boolean>(false);

  /*
   * Overridden Setters
   */

  const setExtractedVenmoId = useCallback((value: string | null) => {
    if (extractedVenmoIdStorageKey) {
      localStorage.setItem(extractedVenmoIdStorageKey, value || '');
      _setExtractedVenmoId(value);
    }
  }, [extractedVenmoIdStorageKey]);

  /*
   * Helpers
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
      setExtractedVenmoId(null);
    }
  }, [isLoggedIn, loggedInEthereumAddress, rampAddress, setExtractedVenmoId]);

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

  useEffect(() => {
    esl && console.log('extractedVenmoIdStorageKey_1');
    esl && console.log('checking loggedInEthereumAddress: ', loggedInEthereumAddress);

    if (loggedInEthereumAddress) {
      esl && console.log('extractedVenmoIdStorageKey_2');

      setExtractedVenmoIdStorageKey(`extractedVenmoId_${loggedInEthereumAddress}`);
    } else {
      esl && console.log('extractedVenmoIdStorageKey_3');

      setExtractedVenmoIdStorageKey(null);
    }
  }, [loggedInEthereumAddress]);

  useEffect(() => {
    esl && console.log('extractedVenmoId_1');
    esl && console.log('checking extractedVenmoIdStorageKey: ', extractedVenmoIdStorageKey);

    if (extractedVenmoIdStorageKey) {
      esl && console.log('extractedVenmoId_2');

      const storedValue = localStorage.getItem(extractedVenmoIdStorageKey);
      if (storedValue !== null) {
        _setExtractedVenmoId(storedValue);
      } else {
        _setExtractedVenmoId(null);
      }
    } else {
      esl && console.log('extractedVenmoId_3');

      _setExtractedVenmoId(null);
    }
  }, [extractedVenmoIdStorageKey]);

  /*
   * Provider
   */

  return (
    <RegistrationContext.Provider
      value={{
        isRegistered,
        registrationHash,
        extractedVenmoId,
        setExtractedVenmoId,
        refetchRampAccount,
        shouldFetchRegistration,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};

export default RegistrationProvider
