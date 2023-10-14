import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro'
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from 'wagmi'
import { Trash2 } from 'react-feather';

import { ThemedText } from '../../theme/text'
import { IntentRow, IntentRowData } from "./OnRamperIntentRow";
import { toUsdcString, toUsdString } from '@helpers/units'
import { PRECISION, SECONDS_IN_DAY  } from '@helpers/constants'
import useLiquidity from '@hooks/useLiquidity';
import useOnRamperIntents from '@hooks/useOnRamperIntents'
import useRampState from '@hooks/useRampState';
import useSmartContracts from '@hooks/useSmartContracts';


interface OnRamperIntentTableProps {
  onIntentRowClick?: () => void;
}

export const OnRamperIntentTable: React.FC<OnRamperIntentTableProps> = ({
  onIntentRowClick,
}) => {
  /*
    Contexts
  */

 const { currentIntentHash, currentIntent, refetchIntentHash } = useOnRamperIntents();
 const { depositStore } = useLiquidity();
 const { rampAddress, rampAbi } = useSmartContracts();
 const { convenienceRewardTimePeriod } = useRampState();

  
  /*
    State
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

    try {
      await writeSubmitCancelIntentAsync?.();
    } catch (error) {
      console.log('writeSubmitCancelIntentAsync failed: ', error);
    }
  };

  /*
    Hooks
  */
 
  useEffect(() => {
    if (currentIntent && depositStore && convenienceRewardTimePeriod) {
      const storedDeposit = depositStore.find((storedDeposit) => {
        return storedDeposit.depositId === currentIntent.intent.deposit;
      });

      if (storedDeposit !== undefined) {
        const amountUSDC = currentIntent.intent.amount
        const conversionRate = storedDeposit.deposit.conversionRate;
        const usdToSend = amountUSDC * PRECISION / conversionRate;
        const amountUSDToSend = toUsdString(usdToSend);
        const intentTimestamp = currentIntent.intent.timestamp;

        const amountUSDCToReceive = toUsdcString(currentIntent.intent.amount);
        const expirationTimestamp = formatExpiration(currentIntent.intent.timestamp);
        const convenienceRewardTimestampRaw = calculateExpiration(intentTimestamp, convenienceRewardTimePeriod);
        const venmoIdString = currentIntent.depositorVenmoId.toString();

        const sanitizedIntent: IntentRowData = {
          amountUSDCToReceive,
          amountUSDToSend,
          expirationTimestamp,
          convenienceRewardTimestampRaw,
          depositorVenmoId: venmoIdString,
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
  }, [currentIntent, depositStore, convenienceRewardTimePeriod]);

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
          <ThemedText.LabelSmall textAlign="left">
            Current Order
          </ThemedText.LabelSmall>

          <StyledTrash2 onClick={handleCancelClick}/>
        </IntentCountTitle>
        
        <Table>
          {intentsRowData.map((intentsRow, rowIndex) => (
            <IntentRow
              key={rowIndex}
              amountUSDCToReceive={intentsRow.amountUSDCToReceive}
              amountUSDToSend={intentsRow.amountUSDToSend}
              expirationTimestamp={intentsRow.expirationTimestamp}
              convenienceRewardTimestampRaw={intentsRow.convenienceRewardTimestampRaw}
              depositorVenmoId={intentsRow.depositorVenmoId}
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
  padding: 1.25rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #98a1c03d;
  align-items: center;
`

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

const StyledTrash2 = styled(Trash2)`
  width: 18px;
  height: 18px;
  color: #6C757D;

  &:hover {
    color: #FFF;
  }
`;
