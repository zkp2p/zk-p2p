import React, { useEffect, useState, ReactNode } from 'react'
import { useContractRead } from 'wagmi';

import { esl } from '@helpers/constants'
import useAccount from '@hooks/useAccount'
import useSmartContracts from '@hooks/useSmartContracts'
import useRegistration from '@hooks/venmo/useRegistration';

import PermissionsContext from './PermissionsContext'


interface ProvidersProps {
  children: ReactNode;
}

const PermissionsProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  const { isLoggedIn, loggedInEthereumAddress } = useAccount();
  const { venmoRampAddress, venmoRampAbi } = useSmartContracts();
  const { isRegistered } = useRegistration();

  /*
   * State
   */

  const [deniedUsers, setDeniedUsers] = useState<string[] | null>(null);

  const [shouldFetchDeniedUsers, setShouldFetchDeniedUsers] = useState<boolean>(false);

  /*
   * Contract Reads
   */

  /*
   * getDeniedUsers(address _account) external view returns (bytes32[] memory)
   */
  const {
    data: deniedUsersRaw,
    refetch: refetchDeniedUsers,
  } = useContractRead({
    address: venmoRampAddress,
    abi: venmoRampAbi,
    functionName: "getDeniedUsers",
    args: [
      loggedInEthereumAddress
    ],
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
    esl && console.log('venmo_shouldFetchDeniedUsers_1');
    esl && console.log('checking isLoggedIn: ', isLoggedIn);
    esl && console.log('checking loggedInEthereumAddress: ', loggedInEthereumAddress);
    esl && console.log('checking isRegistered: ', isRegistered);

    if (isLoggedIn && loggedInEthereumAddress && isRegistered) {
      esl && console.log('venmo_shouldFetchDeniedUsers_2');

      setShouldFetchDeniedUsers(true);
    } else {
      esl && console.log('venmo_shouldFetchDeniedUsers_3');

      setShouldFetchDeniedUsers(false);

      setDeniedUsers(null);
    }
  }, [isLoggedIn, loggedInEthereumAddress, isRegistered]);

  useEffect(() => {
    esl && console.log('venmo_deniedUsersRaw_1');
    esl && console.log('checking deniedUsersRaw: ', deniedUsersRaw);
  
    if (deniedUsersRaw && deniedUsersRaw.length > 0) {
      esl && console.log('venmo_deniedUsersRaw_2');

      const deniedUsersProcessed = deniedUsersRaw as string[];

      setDeniedUsers(deniedUsersProcessed);
    } else {
      esl && console.log('venmo_deniedUsersRaw_3');
      
      setDeniedUsers(null);
    }
  }, [deniedUsersRaw]);

  return (
    <PermissionsContext.Provider
      value={{
        deniedUsers,
        refetchDeniedUsers,
        shouldFetchDeniedUsers,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

export default PermissionsProvider;
