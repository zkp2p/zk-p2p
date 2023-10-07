import React, { useEffect, useState, ReactNode } from 'react'
import { Address, useContractRead } from 'wagmi';

import { esl } from '@helpers/constants'
import useAccount from '@hooks/useAccount'
import useSmartContracts from '@hooks/useSmartContracts'
import useRegistration from '@hooks/useRegistration';

import PermissionsContext from './PermissionsContext'


interface ProvidersProps {
  children: ReactNode;
}

const PermissionsProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  const { isLoggedIn, loggedInEthereumAddress } = useAccount()
  const { rampAddress, rampAbi } = useSmartContracts()
  const { isRegistered } = useRegistration()

  /*
   * State
   */

  const [deniedUsers, setDeniedUsers] = useState<Address[] | null>(null);

  const [shouldFetchDeniedUsers, setShouldFetchDeniedUsers] = useState<boolean>(false);

  /*
   * Contract Reads
   */

  /*
   * getDeniedUsers(address _account) external view returns (bytes32[] memory)
   */
  const {
    data: deniedUsersRaw,
    // isLoading: isFetchDeniedUsersLoading,
    // isError: isFetchDeniedUsersError,
    refetch: refetchDeniedUsers,
  } = useContractRead({
    address: rampAddress,
    abi: rampAbi,
    functionName: "getDeniedUsers",
    args: [loggedInEthereumAddress],
    watch: true,
    // cacheTime: 20_000,
    enabled: shouldFetchDeniedUsers
  });

  /*
   * Other deny list functions:
   * isDeniedUser(address _account, bytes32 _deniedUser)
   */

  /*
   * Hooks
   */

  useEffect(() => {
    esl && console.log('shouldFetchDeniedUsers_1');
    esl && console.log('checking isLoggedIn: ', isLoggedIn);
    esl && console.log('checking loggedInEthereumAddress: ', loggedInEthereumAddress);
    esl && console.log('checking isRegistered: ', isRegistered);

    if (isLoggedIn && loggedInEthereumAddress && isRegistered) {
      esl && console.log('shouldFetchDeniedUsers_2');

      setShouldFetchDeniedUsers(true);
    } else {
      esl && console.log('shouldFetchDeniedUsers_3');

      setShouldFetchDeniedUsers(false);

      setDeniedUsers(null);
    }
  }, [isLoggedIn, loggedInEthereumAddress, isRegistered]);

  useEffect(() => {
    esl && console.log('deniedUsersRaw_1');
    esl && console.log('checking deniedUsersRaw: ', deniedUsersRaw);
  
    if (deniedUsersRaw && deniedUsersRaw.length > 0) {
      esl && console.log('deniedUsersRaw_2');

      const deniedUsersProcessed = deniedUsersRaw as Address[];

      setDeniedUsers(deniedUsersProcessed);
    } else {
      esl && console.log('deniedUsersRaw_3');
      
      setDeniedUsers(null);
    }
  }, [deniedUsersRaw]);

  return (
    <PermissionsContext.Provider
      value={{
        deniedUsers,
        refetchDeniedUsers
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

export default PermissionsProvider
