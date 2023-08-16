import React, { useEffect, useState } from 'react';
import { Inbox } from 'react-feather'
import styled, { css } from 'styled-components/macro'

import { Button } from '../Button'
import { RowBetween } from '../layouts/Row'
import { ThemedText } from '../../theme/text'
import { Deposit } from "../../helpers/types";
import { PositionRow } from "./PositionRow";


interface PositionTableProps {
  loggedInWalletAddress: string;
  handleNewPositionClick: () => void;
}

export const PositionTable: React.FC<PositionTableProps> = ({
  loggedInWalletAddress,
  handleNewPositionClick
}) => {
  const [positions, setPositions] = useState<Deposit[]>([]);

  useEffect(() => {
    setPositions([
      {
        depositor: '0x1234...5678',
        remainingDepositAmount: 10_000_000_000, // 10_000
        outstandingIntentAmount: 200_000_000,   // 200
        conversionRate: 1_000_000,              // 1%
        convenienceFee: 100_000                 // 1%
      },
      {
        depositor: '0x1234...5678',
        remainingDepositAmount: 10_000_000_000,
        outstandingIntentAmount: 200_000_000,
        conversionRate: 1_000_000,
        convenienceFee: 100_000
      }
    ]);
  }, []);

  function convertDepositAmountToUSD(depositAmount: number) {
    return (depositAmount / 1_000_000).toString();
  }

  function convertRatesToPercentage(rate: number) {
    return (rate / 1_000_000).toFixed(2) + '%';
  }

  return (
    <Container>
      <Column>
        <TitleRow>
          <ThemedText.HeadlineMedium>
            Pool
          </ThemedText.HeadlineMedium>
          <Button onClick={handleNewPositionClick} height={40}>
            + New Position
          </Button>
        </TitleRow>

        <Content>
          {!loggedInWalletAddress ? (
            <ErrorContainer>
              <ThemedText.DeprecatedBody textAlign="center">
                <InboxIcon strokeWidth={1} style={{ marginTop: '2em' }} />
                <div>
                  Your active pool positions will appear here!
                </div>
              </ThemedText.DeprecatedBody>
              <Button>
                Connect Wallet
              </Button>
            </ErrorContainer>
          ) : positions.length === 0 ? (
            <ErrorContainer>
              <ThemedText.DeprecatedBody textAlign="center">
                <InboxIcon strokeWidth={1} style={{ marginTop: '2em' }} />
                <div>
                  You have no active positions.
                </div>
              </ThemedText.DeprecatedBody>
            </ErrorContainer>
          ) : (
            <PositionsContainer>
              <PositionCountTitle>
                <ThemedText.LabelSmall textAlign="left">
                  Your positions ({positions.length})
                </ThemedText.LabelSmall>
              </PositionCountTitle>
              <Table>
                {positions.map((position, rowIndex) => (
                  <PositionRowStyled key={rowIndex}>
                    <PositionRow
                      remainingDepositAmount={convertDepositAmountToUSD(position.remainingDepositAmount)}
                      outstandingIntentAmount={convertDepositAmountToUSD(position.outstandingIntentAmount)}
                      conversionRate={convertRatesToPercentage(position.conversionRate)}
                      convenienceFee={convertRatesToPercentage(position.convenienceFee)}
                      rowIndex={rowIndex}
                    />
                  </PositionRowStyled>
                ))}
              </Table>
            </PositionsContainer>
          )}
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

const TitleRow = styled(RowBetween)`
  margin-bottom: 20px;
  height: 50px;
  align-items: flex-end;
  color: #FFF;
  padding: 0 1rem;

  @media (max-width: 600px) {
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
  };
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

const ErrorContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  padding: 36px 0px;
  max-width: 340px;
  min-height: 25vh;
  gap: 36px;
`

const IconStyle = css`
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
`

const InboxIcon = styled(Inbox)`
  ${IconStyle}
`

const PositionsContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
`

const PositionCountTitle = styled.div`
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

const PositionRowStyled = styled.div`
  &:last-child {
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
  }
`;
