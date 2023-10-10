import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro'

import { ThemedText } from '../../theme/text'
import { IntentRow, IntentRowData } from "./OffRamperIntentRow";
import { toUsdString, toUsdcString  } from '@helpers/units'
import { SECONDS_IN_DAY, PRECISION  } from '@helpers/constants'
import { DepositIntent } from "../../contexts/Deposits/types";
import useDeposits from '@hooks/useDeposits';
import useLiquidity from '@hooks/useLiquidity';


interface IntentTableProps {
  onRowClick?: (rowData: any[]) => void;
  selectedRow?: number;
  rowsPerPage?: number;
}

export const IntentTable: React.FC<IntentTableProps> = ({
  onRowClick,
  selectedRow,
  rowsPerPage = 10
}) => {
  /*
    Contexts
  */

  const { deposits, depositIntents } = useDeposits();
  const { calculateUsdFromRequestedUSDC } = useLiquidity();

  /*
    State
  */
 
  const [intentsRowData, setIntentsRowData] = useState<IntentRowData[]>([]);

  /*
    Hooks
  */

  useEffect(() => {
    if (depositIntents && deposits) {
      var sanitizedIntents: IntentRowData[] = [];
      sanitizedIntents = depositIntents.map((depositIntent: DepositIntent) => {
        const intent = depositIntent.intent;
        const deposit = depositIntent.deposit;

        const amountUSDC = intent.amount
        const usdToSend = calculateUsdFromRequestedUSDC(amountUSDC, deposit.conversionRate);

        const onRamper = truncateAddress(intent.onRamper);
        const amountUSDToReceive = toUsdString(usdToSend);
        const amountUSDCToSend = toUsdcString(amountUSDC);
        const expirationTimestamp = calculateAndFormatExpiration(intent.timestamp);
        
        return {
          onRamper,
          amountUSDToReceive,
          amountUSDCToSend,
          expirationTimestamp
        };
      });

      setIntentsRowData(sanitizedIntents);
    } else {
      setIntentsRowData([]);
    }
  }, [depositIntents, deposits]);

  /*
    Helpers
  */

  function truncateAddress(onRamperAddress: string): string {
    return `${onRamperAddress.slice(0, 4)}...${onRamperAddress.slice(-4)}`;
  }

  function calculateAndFormatExpiration(unixTimestamp: bigint): string {
    const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
    const unixTimestampPlusOneDay = unixTimestamp + SECONDS_IN_DAY;
  
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
      <Column>
        <Content>
          <IntentContainer>
            <IntentCountTitle>
              <ThemedText.LabelSmall textAlign="left">
                Orders on your deposits
              </ThemedText.LabelSmall>
            </IntentCountTitle>
            <Table>
              {intentsRowData.map((intentsRow, rowIndex) => (
                <IntentRowStyled
                  key={rowIndex}
                  onClick={() => {
                    onRowClick && onRowClick([rowIndex])}
                  }
                >
                  <IntentRow
                    amountUSDToReceive={intentsRow.amountUSDToReceive}
                    amountUSDCToSend={intentsRow.amountUSDCToSend}
                    expirationTimestamp={intentsRow.expirationTimestamp}
                    onRamper={intentsRow.onRamper}
                  />
                </IntentRowStyled>
              ))}
            </Table>
          </IntentContainer>
        </Content>
      </Column>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  gap: 1rem;
`

const Column = styled.div`
  gap: 1rem;
  align-self: flex-start;
  border-radius: 16px;
  justify-content: center;
`;

const Content = styled.main`
  display: flex;
  background-color: #0D111C;
  border: 1px solid #98a1c03d;
  border-radius: 16px;
  flex-direction: column;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  overflow: hidden;
`;

const IntentContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
`

const IntentCountTitle = styled.div`
  width: 100%;
  text-align: left;
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

const IntentRowStyled = styled.div`
  &:hover {
    border: 1px solid rgba(255, 255, 255, 0.8);
    box-shadow: none;
  }    

  &:last-child {
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
  }
`;
