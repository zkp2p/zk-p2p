import React, { useEffect, useState } from 'react';
import { Inbox, FileText } from 'react-feather'
import styled, { css } from 'styled-components/macro'
import { useNavigate } from 'react-router-dom';

import { Button } from '../Button'
import { RowBetween } from '../layouts/Row'
import { ThemedText } from '../../theme/text'
import { Deposit, DepositPrime } from "../../helpers/types";
import { PositionRow } from "./PositionRow";
import { CustomConnectButton } from "../common/ConnectButton"
import useRampRegistration from '../../hooks/useRampRegistration'


interface PositionTableProps {
  loggedInWalletAddress: string;
  handleNewPositionClick: () => void;
}

export const PositionTable: React.FC<PositionTableProps> = ({
  loggedInWalletAddress,
  handleNewPositionClick
}) => {
  const navigate = useNavigate();

  /*
   * Contexts
   */
  const { isRegistered } = useRampRegistration()

  const [positions, setPositions] = useState<DepositPrime[]>([]);

  useEffect(() => {
    setPositions([
      {
        depositor: '0x1234...5678',
        remainingDepositAmount: 4_000_100_000,  // 4_000
        totalDepositAmount: 10_000_000_000,     // 10_000
        outstandingIntentAmount: 200_000_000,   // 200
        intentCount: 2,                         // 2
        conversionRate: 500_000,                // 0.5%
        convenienceFee: 5_000_000               // 5
      },
      {
        depositor: '0x1234...5678',
        remainingDepositAmount: 5_500_000_000,
        totalDepositAmount: 7_500_000_000,
        outstandingIntentAmount: 300_000_000,
        intentCount: 1,
        conversionRate: 1_000_000,
        convenienceFee: 2_000_000
      }
    ]);
  }, []);

  /*
    Handlers
  */

  const navigateToRegistrationHandler = () => {
    navigate('/register');
  };
  
  /*
    Helpers
  */

  function convertDepositAmountToUSD(depositAmount: number) {
    return (depositAmount / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function convertRatesToPercentage(rate: number) {
    return (rate / 1_000_000).toFixed(2) + '%';
  }

  function convertFeeToFlatAmount(rate: number) {
    return (rate / 1_000_000).toFixed(0) + ' USDC';
  }

  return (
    <Container>
      <Column>
        <TitleRow>
          <ThemedText.HeadlineMedium>
            Deposit
          </ThemedText.HeadlineMedium>
          {loggedInWalletAddress ? (
            <Button onClick={handleNewPositionClick} height={40}>
                + New Position
            </Button>
          ) : null}
        </TitleRow>

        <Content>
        {!loggedInWalletAddress ? (
            <ErrorContainer>
              <ThemedText.DeprecatedBody textAlign="center">
                <InboxIcon strokeWidth={1} style={{ marginTop: '2em' }} />
                <div>
                  Your active deposits will appear here.
                </div>
              </ThemedText.DeprecatedBody>
              <CustomConnectButton />
            </ErrorContainer>
          ) : !isRegistered ? (
            <ErrorContainer>
              <ThemedText.DeprecatedBody textAlign="center">
                <FileTextIcon strokeWidth={1} style={{ marginTop: '2em' }} />
                <div>
                  You must register to create a deposit.
                </div>
              </ThemedText.DeprecatedBody>
              <Button
                onClick={navigateToRegistrationHandler}
              >
                Complete Registration
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
                      depositorHash={position.depositor}
                      remainingDepositAmount={convertDepositAmountToUSD(position.remainingDepositAmount)}
                      totalDepositAmount={convertDepositAmountToUSD(position.totalDepositAmount)}
                      outstandingIntentAmount={convertDepositAmountToUSD(position.outstandingIntentAmount)}
                      intentCount={position.intentCount.toString()}
                      conversionRate={convertRatesToPercentage(position.conversionRate)}
                      convenienceFee={convertFeeToFlatAmount(position.convenienceFee)}
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

const FileTextIcon = styled(FileText)`
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
  &:hover {
    border: 1px solid rgba(255, 255, 255, 0.8);
    box-shadow: none;
  }  

  &:last-child {
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
  }
`;
