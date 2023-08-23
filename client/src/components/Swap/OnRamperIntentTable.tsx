import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro'

import { ThemedText } from '../../theme/text'
import { IntentRow } from "./OnRamperIntentRow";
import { Intent } from "../../helpers/types";


// export interface Intent {
//   onRamper: string;
//   deposit: string;
//   amount: number;
//   timestamp: number;
// }

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
  const [intents, setIntents] = useState<Intent[]>([]);

  useEffect(() => {
    setIntents([
      {
        onRamper: '0x1234...5678',
        deposit: '0xdepositHash',
        amount: 1_000_000,          // 1 USDC
        timestamp: 1692540957
      },
      {
        onRamper: '0x1234...5678',
        deposit: '0xdepositHash',
        amount: 4_000_000,          // 4 USDC
        timestamp: 1629784800
      }
    ]);
  }, []);

  function convertDepositAmountToUSD(depositAmount: number) {
    return (depositAmount / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function formattedExpiration(unixTimestamp: number): string {
    const currentTimestamp = Math.floor(Date.now() / 1000);
  
    if (currentTimestamp > unixTimestamp) {
      return "Expired";
    } else {
      const date = new Date(unixTimestamp * 1000);
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
                Open Orders
              </ThemedText.LabelSmall>
            </IntentCountTitle>
            <Table>
              {intents.map((intent, rowIndex) => (
                <PermissionRowStyled
                  key={rowIndex}
                  onClick={() => {
                    onRowClick && onRowClick([rowIndex])}
                  }
                >
                  <IntentRow
                    address={intent.onRamper}
                    amount={convertDepositAmountToUSD(intent.amount)}
                    timestamp={formattedExpiration(intent.timestamp)}
                    rowIndex={rowIndex}
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
