import React, { useEffect, useState, ReactNode } from 'react'
import { useContractRead } from 'wagmi'

import useAccount from '../../hooks/useAccount'
import RampRegistrationContext from './RampRegistrationContext'
import AccountInfo from './types'
import { abi } from "../../helpers/abi/ramp.abi";


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

  /*
   * Contract Reads
   */

  // mapping(address => AccountInfo) public accounts;
  const {
    data: registrationDataRaw,
    // isLoading: isRegistrationDataLoading,
    // isError: isRegistrationDataError,
    // refetch: refetchRegistrationData,
  } = useContractRead({
    address: rampAddress as `0x${string}`,
    abi: abi,
    functionName: 'accounts',
    args: [ethereumAddress],
  })

  /*
   * Hooks
   */
  useEffect(() => {
    console.log('registrationDataRaw_1');
    console.log(registrationDataRaw);

    if (registrationDataRaw) {
      const registrationData = registrationDataRaw as AccountInfo;
      
      console.log('registrationDataRaw_2');
      console.log(registrationData);
  
      if (ethereumAddress && registrationData.venmoIdHash) {
        setRegistrationHash(registrationData.venmoIdHash);
      } else {
        setRegistrationHash("");
      }
    }
  }, [ethereumAddress, registrationDataRaw]);

  // useEffect(() => {
  //   console.log('refetchRegistrationData');

  //   if (ethereumAddress) {
  //     const intervalId = setInterval(() => {
  //       refetchRegistrationData();
  //     }, 15000); // Refetch every 15 seconds
  
  //     return () => {
  //       clearInterval(intervalId);
  //     };
  //   }
  // }, [ethereumAddress, refetchRegistrationData]);

  return (
    <RampRegistrationContext.Provider
      value={{
        registrationHash
      }}
    >
      {children}
    </RampRegistrationContext.Provider>
  );
};

export default AccountProvider
