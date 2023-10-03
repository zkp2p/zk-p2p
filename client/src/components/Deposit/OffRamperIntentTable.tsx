import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro'

import { ThemedText } from '../../theme/text'
import { IntentRow, IntentRowData } from "./OffRamperIntentRow";
import { Intent } from "../../contexts/Deposits/types";
import { fromUsdcToNaturalString } from '@helpers/units'
import useDeposits from '@hooks/useDeposits';


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
  const { depositIntents } = useDeposits()

  /*
    State
  */
  const [intentsRowData, setIntentsRowData] = useState<IntentRowData[]>([]);

  /*
    Hooks
  */

  useEffect(() => {
    if (!depositIntents) {
      setIntentsRowData([]);
    } else {
      var sanitizedIntents: IntentRowData[] = [];
      sanitizedIntents = depositIntents.map((intent: Intent) => {
        const onRamper = intent.onRamper;
        const amount = convertDepositAmountToUSD(intent.amount);
        const timestamp = calculateAndFormatExpiration(intent.timestamp);
        
        return {
          venmoHash: onRamper,
          amount,
          timestamp
        };
      });

      setIntentsRowData(sanitizedIntents);
    }
  }, [depositIntents]);

  /*
    Helpers
  */

  function convertDepositAmountToUSD(depositAmount: bigint) {
    const depositAmountInUSD = fromUsdcToNaturalString(depositAmount);
    const localizedDepositAmount = depositAmountInUSD.toLocaleString(
      'en-US',
      { minimumFractionDigits: 0, maximumFractionDigits: 2 }
    );

    return localizedDepositAmount;
  }

  // TODO: move this to OffRamperIntentRow
  function calculateAndFormatExpiration(unixTimestamp: bigint): string {
    console.log("unixTimestamp");
    console.log(unixTimestamp);

    const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));

    const unixTimestampPlusOneDay = unixTimestamp + BigInt(86400);
  
    if (currentTimestamp > unixTimestampPlusOneDay) {
      return "Expired";
    } else {
      // Convert BigInt to number before creating a Date object
      const date = new Date(Number(unixTimestampPlusOneDay) * 1000);
      const formattedDate = date.toLocaleString();
      
      return formattedDate;
    }
  }

  return (
    <Container>
      <Column>
        <Content>
          <IntentContainer>
            <IntentCountTitle>
              <ThemedText.LabelSmall textAlign="left">
                Orders on your Deposits
              </ThemedText.LabelSmall>
            </IntentCountTitle>
            <Table>
              {intentsRowData.map((intentsRow, rowIndex) => (
                <PermissionRowStyled
                  key={rowIndex}
                  onClick={() => {
                    onRowClick && onRowClick([rowIndex])}
                  }
                >
                  <IntentRow
                    venmoHash={intentsRow.venmoHash}
                    amount={intentsRow.amount}
                    timestamp={intentsRow.timestamp}
                  />
                </PermissionRowStyled>
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

const PermissionRowStyled = styled.div`
  &:hover {
    border: 1px solid rgba(255, 255, 255, 0.8);
    box-shadow: none;
  }    

  &:last-child {
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
  }
`;
