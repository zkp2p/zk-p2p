import React, { useEffect, useState, ReactNode } from 'react'
import { Address, useContractRead } from 'wagmi';

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
    // isLoading: isFetchUsdcApprovalToRampLoading,
    // isError: isFetchUsdcApprovalToRampError,
    // refetch: refetchUsdcApprovalToRamp,
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
    // console.log('shouldFetchDeniedUsers_1');
    if (isLoggedIn && loggedInEthereumAddress && isRegistered) {
      // console.log('shouldFetchDeniedUsers_2');
      setShouldFetchDeniedUsers(true);
    } else {
      // console.log('shouldFetchDeniedUsers_3');
      setShouldFetchDeniedUsers(false);

      setDeniedUsers(null);
    }
  }, [isLoggedIn, loggedInEthereumAddress, isRegistered]);

  useEffect(() => {
    // console.log('deniedUsersRaw_1');
  
    if (deniedUsersRaw) {
      // console.log('deniedUsersRaw_2');
      // console.log(deniedUsersRaw);

      const deniedUsersProcessed = deniedUsersRaw as Address[];

      setDeniedUsers(deniedUsersProcessed);
    } else {
      // console.log('deniedUsersRaw_3');
      setDeniedUsers(null);
    }
  }, [deniedUsersRaw]);

  return (
    <PermissionsContext.Provider
      value={{
        deniedUsers
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

export default PermissionsProvider
