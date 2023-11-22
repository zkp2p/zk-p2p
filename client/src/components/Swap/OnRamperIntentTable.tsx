import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';

import { ThemedText } from '../../theme/text';
import { IntentRow, IntentRowData } from "./OnRamperIntentRow";
import { AccessoryButton } from '@components/common/AccessoryButton';
import { toUsdcString, toUsdString } from '@helpers/units';
import { SECONDS_IN_DAY  } from '@helpers/constants';
import useLiquidity from '@hooks/useLiquidity';
import useOnRamperIntents from '@hooks/useOnRamperIntents';
import useSmartContracts from '@hooks/useSmartContracts';


interface OnRamperIntentTableProps {
  onIntentRowClick?: () => void;
}

export const OnRamperIntentTable: React.FC<OnRamperIntentTableProps> = ({
  onIntentRowClick,
}) => {
  /*
   * Contexts
   */

 const { currentIntentHash, currentIntent, refetchIntentHash } = useOnRamperIntents();
 const { calculateUsdFromRequestedUSDC, depositStore } = useLiquidity();
 const { rampAddress, rampAbi } = useSmartContracts();

  /*
   * State
   */

  const [intentsRowData, setIntentsRowData] = useState<IntentRowData[]>([]);

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
    onSuccess(data) {
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
    Hooks
  */
 
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

        const sanitizedIntent: IntentRowData = {
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
          }
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
      if (shouldConfigureCancelIntentWrite && writeSubmitCancelIntentAsync && submitCancelStatus === 'idle') {
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
    Helpers
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
              key={rowIndex}
              amountUSDCToReceive={intentsRow.amountUSDCToReceive}
              amountUSDToSend={intentsRow.amountUSDToSend}
              expirationTimestamp={intentsRow.expirationTimestamp}
              depositorVenmoId={intentsRow.depositorVenmoId}
              depositorAddress={intentsRow.depositorAddress}
              recipientAddress={intentsRow.recipientAddress}
              handleCompleteOrderClick={intentsRow.handleCompleteOrderClick}
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
