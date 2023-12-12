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

  const { isLoggedIn, loggedInEthereumAddress } = useAccount();
  const { hdfcRampAddress, hdfcRampAbi } = useSmartContracts();

  /*
   * State
   */

  const [registrationHash, setRegistrationHash] = useState<string | null>(null);

  const [shouldFetchHdfcRegistration, setShouldFetchHdfcRegistration] = useState<boolean>(false);

  /*
   * Helpers
   */

  // The !! operator will convert any truthy value to true and any falsy value to false.
  const isRegistered = !!(registrationHash && registrationHash !== ZERO_ADDRESS);

  /*
   * Contract Reads
   */

  // getAccountInfo(address _account) external view returns (bytes32)
  const {
    data: hdfcRampAccountRaw,
    refetch: refetchHdfcRampAccount,
  } = useContractRead({
    address: hdfcRampAddress,
    abi: hdfcRampAbi,
    functionName: 'getAccountInfo',
    args: [
      loggedInEthereumAddress
    ],
    enabled: shouldFetchHdfcRegistration,
  })

  /*
   * Hooks
   */

  useEffect(() => {
    esl && console.log('hdfc_shouldFetchHdfcRegistration_1');
    esl && console.log('checking isLoggedIn: ', isLoggedIn);
    esl && console.log('checking loggedInEthereumAddress: ', loggedInEthereumAddress);
    esl && console.log('checking hdfcRampAddress: ', hdfcRampAddress);
    
    if (isLoggedIn && loggedInEthereumAddress && hdfcRampAddress) {
      esl && console.log('hdfc_shouldFetchHdfcRegistration_2');

      setShouldFetchHdfcRegistration(true);
    } else {
      esl && console.log('hdfc_shouldFetchHdfcRegistration_3');
      
      setShouldFetchHdfcRegistration(false);

      setRegistrationHash(null);
    }
  }, [isLoggedIn, loggedInEthereumAddress, hdfcRampAddress]);

  useEffect(() => {
    esl && console.log('hdfc_hdfcRampAccountRaw_1');
    esl && console.log('checking hdfcRampAccountRaw: ', hdfcRampAccountRaw);
  
    if (hdfcRampAccountRaw) {
      esl && console.log('hdfc_hdfcRampAccountRaw_2');

      const rampAccountData = hdfcRampAccountRaw as any;
      const rampAccountProcessed = rampAccountData.idHash;
      
      setRegistrationHash(rampAccountProcessed);
    } else {
      esl && console.log('hdfc_hdfcRampAccountRaw_3');
      
      setRegistrationHash(null);
    }
  }, [hdfcRampAccountRaw]);

  /*
   * Provider
   */

  return (
    <RegistrationContext.Provider
      value={{
        isRegistered,
        registrationHash,
        refetchRampAccount: refetchHdfcRampAccount,
        shouldFetchRegistration: shouldFetchHdfcRegistration,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};

export default RegistrationProvider
