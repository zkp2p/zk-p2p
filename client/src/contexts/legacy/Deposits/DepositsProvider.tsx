import React, { useEffect, useState, ReactNode } from 'react';
import { useContractRead } from 'wagmi';

import { Deposit, DepositWithAvailableLiquidity } from '../../../helpers/types/deposit';
import { PaymentPlatform } from '../../../helpers/types/paymentPlatform';
import { esl } from '@helpers/constants';
import { unpackPackedVenmoId } from '@helpers/poseidonHash';
import useAccount from '@hooks/useAccount';
import useSmartContracts from '@hooks/useSmartContracts';

import DepositsContext from './DepositsContext';


interface ProvidersProps {
  children: ReactNode;
}

const DepositsProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  const { isLoggedIn, loggedInEthereumAddress } = useAccount();
  const { legacyRampAddress, legacyRampAbi } = useSmartContracts();

  /*
   * State
   */

  const [deposits, setDeposits] = useState<DepositWithAvailableLiquidity[] | null>(null);

  const [shouldFetchDeposits, setShouldFetchDeposits] = useState<boolean>(false);

  /*
   * Contract Reads
   */

  // function getAccountDeposits(address _account)
  const {
    data: depositsRaw,
    refetch: refetchDeposits,
  } = useContractRead({
    address: legacyRampAddress,
    abi: legacyRampAbi,
    functionName: 'getAccountDeposits',
    args: [
      loggedInEthereumAddress
    ],
    enabled: shouldFetchDeposits,
  })

  /*
   * Hooks
   */

  useEffect(() => {
    esl && console.log('venmo_shouldFetchDeposits_1');
    esl && console.log('checking isLoggedIn: ', isLoggedIn);
    esl && console.log('checking loggedInEthereumAddress: ', loggedInEthereumAddress);
    esl && console.log('checking legacyRampAddress: ', legacyRampAddress);

    if (isLoggedIn && loggedInEthereumAddress && legacyRampAddress) {
      esl && console.log('venmo_shouldFetchDeposits_2');

      setShouldFetchDeposits(true);
    } else {
      esl && console.log('venmo_shouldFetchDeposits_3');

      setShouldFetchDeposits(false);

      setDeposits(null);
    }
  }, [isLoggedIn, loggedInEthereumAddress, legacyRampAddress]);

  useEffect(() => {
    esl && console.log('venmo_depositsRaw_1');
    esl && console.log('checking depositsRaw: ', depositsRaw);

    if (depositsRaw) {
      esl && console.log('venmo_depositsRaw_2');

      const depositsArrayRaw = depositsRaw as any[];

      const sanitizedDeposits: DepositWithAvailableLiquidity[] = [];
      for (let i = depositsArrayRaw.length - 1; i >= 0; i--) {
        const depositWithAvailableLiquidityData = depositsArrayRaw[i];

        const depositData = depositWithAvailableLiquidityData.deposit;
        const deposit: Deposit = {
          platformType: PaymentPlatform.VENMO,
          depositor: depositData.depositor.toString(),
          venmoId: unpackPackedVenmoId(depositData.packedVenmoId),
          depositAmount: depositData.depositAmount,
          remainingDepositAmount: depositData.remainingDeposits,
          outstandingIntentAmount: depositData.outstandingIntentAmount,
          conversionRate: depositData.conversionRate,
          intentHashes: depositData.intentHashes,
        };

        const depositWithLiquidity: DepositWithAvailableLiquidity = {
          deposit,
          availableLiquidity: depositWithAvailableLiquidityData.availableLiquidity,
          depositId: depositWithAvailableLiquidityData.depositId,
        }

        sanitizedDeposits.push(depositWithLiquidity);
      }
          
      setDeposits(sanitizedDeposits);
    } else {
      esl && console.log('venmo_depositsRaw_3');

      setDeposits(null);
    }
  }, [depositsRaw]);

  return (
    <DepositsContext.Provider
      value={{
        deposits,
        refetchDeposits,
        shouldFetchDeposits,
      }}
    >
      {children}
    </DepositsContext.Provider>
  );
};

export default DepositsProvider;
