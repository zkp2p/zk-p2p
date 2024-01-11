import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';

import { ThemedText } from '@theme/text';
import { IntentRow, IntentRowData } from "@components/Swap/OnRamperIntentRow";
import { AccessoryButton } from '@components/common/AccessoryButton';
import { toUsdcString, toUsdString } from '@helpers/units';
import { SECONDS_IN_DAY  } from '@helpers/constants';
import { OnRamperIntent, StoredDeposit } from '@helpers/types';
import useSmartContracts from '@hooks/useSmartContracts';
import usePlatformSettings from '@hooks/usePlatformSettings';

// Venmo
import useVenmoOnRamperIntents from '@hooks/venmo/useOnRamperIntents';
import useVenmoLiquidity from '@hooks/venmo/useLiquidity';

// Hdfc
import useHdfcOnRamperIntents from '@hooks/hdfc/useOnRamperIntents';
import useHdfcLiquidity from '@hooks/hdfc/useLiquidity';


interface OnRamperIntentTableProps {
  onIntentRowClick?: () => void;
  shouldAutoSelectIntent: boolean;
  resetShouldAutoSelectIntent: () => void;
}

export const OnRamperIntentTable: React.FC<OnRamperIntentTableProps> = ({
  onIntentRowClick,
  shouldAutoSelectIntent,
  resetShouldAutoSelectIntent,
}) => {
  /*
   * Contexts
   */

 const {
    currentIntentHash: currentVenmoIntentHash,
    currentIntent: currentVenmoIntent,
    refetchIntentHash: refetchVenmoIntentHash
  } = useVenmoOnRamperIntents();
 const {
  calculateUsdFromRequestedUSDC,
  depositStore: venmoDepositStore
} = useVenmoLiquidity();

 const {
    currentIntentHash: currentHdfcIntentHash,
    currentIntent: currentHdfcIntent,
    refetchIntentHash: refetchHdfcIntentHash
  } = useHdfcOnRamperIntents();
 const {
  depositStore: hdfcDepositStore
} = useHdfcLiquidity();

 const { PaymentPlatform, paymentPlatform } = usePlatformSettings();
 
 const {
  venmoRampAddress,
  venmoRampAbi,
  hdfcRampAddress,
  hdfcRampAbi
} = useSmartContracts();

  /*
   * State
   */

  const [currentIntentHash, setCurrentIntentHash] = useState<string | null>(null);
  const [currentIntent, setCurrentIntent] = useState<OnRamperIntent | null>(null);
  const [depositStore, setDepositStore] = useState<StoredDeposit[] | null>(null);
  const [refetchIntentHash, setRefetchIntentHash] = useState<(() => void) | null>(null);

  const [intentsRowData, setIntentsRowData] = useState<IntentRowData[]>([]);

  const [rampAddress, setRampAddress] = useState<string | null>(null);
  const [rampAbi, setRampAbi] = useState<string | null>(null);
  const [shouldConfigureCancelIntentWrite, setShouldConfigureCancelIntentWrite] = useState<boolean>(false);

  /*
   * Contract Writes
   */

  //
  // cancelIntent(bytes32 _intentHash)
  //
  const { config: writeCancelIntentConfig } = usePrepareContractWrite({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'cancelIntent',
    args: [
      currentIntentHash,
    ],
    enabled: shouldConfigureCancelIntentWrite
  });

  const {
    data: submitCancelIntentResult,
    isLoading: isSubmitCancelIntentLoading,
    status: submitCancelStatus,
    writeAsync: writeSubmitCancelIntentAsync
  } = useContractWrite(writeCancelIntentConfig);

  const {
    isLoading: isSubmitCancelIntentMining,
  } = useWaitForTransaction({
    hash: submitCancelIntentResult ? submitCancelIntentResult.hash : undefined,
    onSuccess(data: any) {
      console.log('writeSubmitCancelIntentAsync successful: ', data);
      
      refetchIntentHash?.();
    },
  });

  /*
   * Handlers
   */

  const handleCancelClick = async () => {
    setShouldConfigureCancelIntentWrite(true);
  };

  /*
   * Hooks
   */

  useEffect(() => {
    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setRampAddress(venmoRampAddress);
        setRampAbi(venmoRampAbi as any);
        break;

      case PaymentPlatform.HDFC:
        setRampAddress(hdfcRampAddress);
        setRampAbi(hdfcRampAbi as any);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, venmoRampAddress, hdfcRampAddress]);

  useEffect(() => {
    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setCurrentIntentHash(currentVenmoIntentHash);
        break;

      case PaymentPlatform.HDFC:
        setCurrentIntentHash(currentHdfcIntentHash);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, currentVenmoIntentHash, currentHdfcIntentHash]);

  useEffect(() => {
    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setDepositStore(venmoDepositStore);
        break;

      case PaymentPlatform.HDFC:
        setDepositStore(hdfcDepositStore);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, venmoDepositStore, hdfcDepositStore]);

  useEffect(() => {
    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setCurrentIntent(currentVenmoIntent);
        break;

      case PaymentPlatform.HDFC:
        setCurrentIntent(currentHdfcIntent);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, currentVenmoIntent, currentHdfcIntent]);

  useEffect(() => {
    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setRefetchIntentHash(() => refetchVenmoIntentHash);
        break;

      case PaymentPlatform.HDFC:
        setRefetchIntentHash(() => refetchHdfcIntentHash);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, refetchVenmoIntentHash, refetchHdfcIntentHash]);
 
  useEffect(() => {
    if (currentIntent && depositStore) {
      const storedDeposit = depositStore.find((storedDeposit) => {
        return storedDeposit.depositId === currentIntent.intent.deposit;
      });

      if (storedDeposit !== undefined) {
        const amountUSDC = currentIntent.intent.amount
        const conversionRate = storedDeposit.deposit.conversionRate;

        const usdToSend = calculateUsdFromRequestedUSDC(amountUSDC, conversionRate);
        const amountUSDToSend = toUsdString(usdToSend);

        const amountUSDCToReceive = toUsdcString(currentIntent.intent.amount, true);
        const expirationTimestamp = formatExpiration(currentIntent.intent.timestamp);
        const venmoIdString = currentIntent.depositorVenmoId.toString();
        const depositorAddress = storedDeposit.deposit.depositor;
        const recipientAddress = currentIntent.intent.to;
        const isVenmo = paymentPlatform === PaymentPlatform.VENMO;

        const sanitizedIntent: IntentRowData = {
          isVenmo,
          amountUSDCToReceive,
          amountUSDToSend,
          expirationTimestamp,
          depositorVenmoId: venmoIdString,
          depositorAddress,
          recipientAddress,
          handleCompleteOrderClick: () => {
            if (onIntentRowClick) {
              onIntentRowClick();
            }
          },
          shouldAutoSelectIntent,
          resetShouldAutoSelectIntent,
        };

        setIntentsRowData([sanitizedIntent]);
      } else {
        setIntentsRowData([]);  
      }
    } else {
      setIntentsRowData([]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIntent, depositStore]);

  useEffect(() => {
    const executeCancelIntent = async () => {
      const statusForExecution = submitCancelStatus === 'idle' || submitCancelStatus === 'error';

      if (shouldConfigureCancelIntentWrite && writeSubmitCancelIntentAsync && statusForExecution) {
        try {
          await writeSubmitCancelIntentAsync();
        } catch (error) {
          console.error('writeSubmitCancelIntentAsync failed: ', error);

          setShouldConfigureCancelIntentWrite(false);
        }
      }
    };
  
    executeCancelIntent();
  }, [
    shouldConfigureCancelIntentWrite,
    writeSubmitCancelIntentAsync,
    submitCancelStatus,
  ]);

  /*
   * Helpers
   */

  function calculateExpiration(unixTimestamp: bigint, timePeriod: bigint): bigint {
    return unixTimestamp + timePeriod;
  }
  
  function formatExpiration(unixTimestamp: bigint): string {
    const unixTimestampPlusOneDay = calculateExpiration(unixTimestamp, SECONDS_IN_DAY);
    
    const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
    if (currentTimestamp > unixTimestampPlusOneDay) {
      return "Expired";
    } else {
      const date = new Date(Number(unixTimestampPlusOneDay) * 1000);
      const formattedTime = date.toLocaleTimeString();
      const formattedDate = date.toLocaleDateString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric' }).split('/').slice(0, 2).join('/');

      return `${formattedTime} on ${formattedDate}`;
    }
  }

  return (
    <Container>
      <TitleAndTableContainer>
        <IntentCountTitle>
          <TitleAndTooltip>
            <ThemedText.LabelSmall textAlign="left">
              Current Order
            </ThemedText.LabelSmall>
          </TitleAndTooltip>

          <AccessoryButton
            onClick={handleCancelClick}
            height={36}
            loading={isSubmitCancelIntentLoading || isSubmitCancelIntentMining}
            title={'Cancel'}
            icon={'trash'}/>
        </IntentCountTitle>
        
        <Table>
          {intentsRowData.map((intentsRow, rowIndex) => (
            <IntentRow
              isVenmo={intentsRow.isVenmo}
              key={rowIndex}
              amountUSDCToReceive={intentsRow.amountUSDCToReceive}
              amountUSDToSend={intentsRow.amountUSDToSend}
              expirationTimestamp={intentsRow.expirationTimestamp}
              depositorVenmoId={intentsRow.depositorVenmoId}
              depositorAddress={intentsRow.depositorAddress}
              recipientAddress={intentsRow.recipientAddress}
              handleCompleteOrderClick={intentsRow.handleCompleteOrderClick}
              shouldAutoSelectIntent={intentsRow.shouldAutoSelectIntent}
              resetShouldAutoSelectIntent={intentsRow.resetShouldAutoSelectIntent}
            />
          ))}
        </Table>
      </TitleAndTableContainer>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  justify-content: center;
  gap: 1rem;
  
  border-radius: 16px;
  background-color: #0D111C;
  border: 1px solid #98a1c03d;
  border-radius: 16px;
  overflow: hidden;
`;

const TitleAndTableContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const IntentCountTitle = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem 1.5rem 0.75rem 1.5rem;
  border-bottom: 1px solid #98a1c03d;
  align-items: center;
`;

const TitleAndTooltip = styled.div`
  display: flex;
  gap: 0.25rem;
  align-items: center;
`;

const Table = styled.div`
  width: 100%;
  border-radius: 8px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.25);
  font-size: 16px;
  color: #616161;

  & > * {
    border-bottom: 1px solid #98a1c03d;
  }

  & > *:last-child {
    border-bottom: none;
  }
`;
