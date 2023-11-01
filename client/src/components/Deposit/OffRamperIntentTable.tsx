import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro'

import { ThemedText } from '../../theme/text'
import { IntentRow, IntentRowData } from "./OffRamperIntentRow";
import { toUsdString, toUsdcString  } from '@helpers/units'
import { SECONDS_IN_DAY  } from '@helpers/constants'
import { DepositIntent } from "../../contexts/Deposits/types";
import useDeposits from '@hooks/useDeposits';
import useLiquidity from '@hooks/useLiquidity';


interface OffRamperIntentTableProps {
  selectedRow?: number;
  rowsPerPage?: number;
}

export const OffRamperIntentTable: React.FC<OffRamperIntentTableProps> = ({
  selectedRow,
  rowsPerPage = 10
}) => {
  /*
   * Contexts
   */

  const { deposits, depositIntents } = useDeposits();
  const { calculateUsdFromRequestedUSDC } = useLiquidity();

  /*
   * State
   */
 
  const [intentsRowData, setIntentsRowData] = useState<IntentRowData[]>([]);

  /*
   * Hooks
   */

  useEffect(() => {
    if (depositIntents && deposits) {
      var sanitizedIntents: IntentRowData[] = [];
      sanitizedIntents = depositIntents.map((depositIntent: DepositIntent, index: number) => {
        const intent = depositIntent.intent;
        const deposit = depositIntent.deposit;

        const amountUSDC = intent.amount
        const usdToSend = calculateUsdFromRequestedUSDC(amountUSDC, deposit.conversionRate);

        const onRamper = truncateAddress(intent.onRamper);
        const amountUSDToReceive = toUsdString(usdToSend);
        const amountUSDCToSend = toUsdcString(amountUSDC);
        const expirationTimestamp = formatExpiration(intent.timestamp);
        
        const sanitizedIntent: IntentRowData = {
          onRamper,
          amountUSDToReceive,
          amountUSDCToSend,
          expirationTimestamp,
        }

        return sanitizedIntent;
      });

      setIntentsRowData(sanitizedIntents);
    } else {
      setIntentsRowData([]);
    }
  }, [depositIntents, deposits]);

  /*
   * Helpers
   */

  function truncateAddress(onRamperAddress: string): string {
    return `${onRamperAddress.slice(0, 4)}...${onRamperAddress.slice(-4)}`;
  }

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
            Orders on your deposits
          </ThemedText.LabelSmall>
        </IntentCountTitle>

        <Table>
          {intentsRowData.map((intentsRow, rowIndex) => (
            <IntentRow
              key={rowIndex}
              amountUSDToReceive={intentsRow.amountUSDToReceive}
              amountUSDCToSend={intentsRow.amountUSDCToSend}
              expirationTimestamp={intentsRow.expirationTimestamp}
              onRamper={intentsRow.onRamper}
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
`

const TitleAndTableContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const IntentCountTitle = styled.div`
  width: 100%;
  padding-top: 1.25rem;
  padding-bottom: 1rem;
  padding-left: 1.5rem;
  border-bottom: 1px solid #98a1c03d;
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
