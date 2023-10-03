import React, { useEffect, useState, ReactNode } from 'react'
import { Address, useContractRead } from 'wagmi';

import useAccount from '@hooks/useAccount'
import useSmartContracts from '@hooks/useSmartContracts'

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

  /*
   * State
   */
  const [deniedUsers, setDeniedUsers] = useState<Address[] | undefined>(undefined);

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
    enabled: true,
  });

  /*
   * Other deny list functions:
   * isDeniedUser(address _account, bytes32 _deniedUser)
   */

  /*
   * Hooks
   */
  useEffect(() => {
    console.log('deniedUsersRaw_1');
    console.log(deniedUsersRaw);
  
    if (isLoggedIn && deniedUsersRaw) {
      const deniedUsersProcessed = deniedUsersRaw as Address[];
      
      // console.log('deniedUsersProcessed');
      // console.log(deniedUsersProcessed);

      setDeniedUsers(deniedUsersProcessed);
    } else {
      setDeniedUsers(undefined);
    }
  }, [isLoggedIn, deniedUsersRaw]);

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
