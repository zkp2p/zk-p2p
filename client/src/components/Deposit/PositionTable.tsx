import React, { useEffect, useState } from 'react';
import { Inbox, FileText } from 'react-feather'
import styled, { css } from 'styled-components/macro'
import { useNavigate } from 'react-router-dom';
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from 'wagmi'

import { Button } from '../Button'
import { RowBetween } from '../layouts/Row'
import { ThemedText } from '../../theme/text'
import { DepositWithAvailableLiquidity } from "../../contexts/Deposits/types";
import { PositionRow } from "./PositionRow";
import { CustomConnectButton } from "../common/ConnectButton"
import { toUsdcString } from '@helpers/units'
import { PRECISION } from '@helpers/constants'
import useAccount from '@hooks/useAccount'
import useDeposits from '@hooks/useDeposits';
import useSmartContracts from '@hooks/useSmartContracts';
import useRegistration from '@hooks/useRegistration'


export interface DepositPrime {
  depositor: string;
  availableDepositAmount: string;
  totalDepositAmount: string;
  outstandingIntentAmount: string;
  intentCount: string;
  conversionRate: string;
  convenienceFee: string;
}

interface PositionTableProps {
  handleNewPositionClick: () => void;
}

export const PositionTable: React.FC<PositionTableProps> = ({
  handleNewPositionClick
}) => {
  const navigate = useNavigate();

  /*
   * Contexts
   */

  const { isRegistered } = useRegistration();
  const { isLoggedIn } = useAccount();
  const { deposits, refetchDeposits } = useDeposits();
  const { rampAddress, rampAbi } = useSmartContracts();

  /*
   * State
   */

  const [positionsRowData, setPositionsRowData] = useState<DepositPrime[]>([]);

  const [selectedDepositIdToWithdraw, setSelectedDepositIdToWithdraw] = useState<bigint>(0n);
  const [shouldConfigureWithdrawWrite, setShouldConfigureWithdrawWrite] = useState<boolean>(false);

  /*
   * Hooks
   */

  useEffect(() => {
    if (!deposits) {
      setPositionsRowData([]);  
    } else {
      var sanitizedPositions: DepositPrime[] = [];
      sanitizedPositions = deposits.map((depositWithLiquidity: DepositWithAvailableLiquidity) => {
        const deposit = depositWithLiquidity.deposit

        const depositor = deposit.depositor;
        const availableDepositAmount = toUsdcString(depositWithLiquidity.availableLiquidity);
        const totalDepositAmount = toUsdcString(deposit.depositAmount);
        const intentCount = deposit.intentHashes.length.toString();
        const outstandingIntentAmount = toUsdcString(deposit.outstandingIntentAmount);
        const conversionRate = conversionRateToString(deposit.conversionRate);
        const convenienceFee = feeAmountString(toUsdcString(deposit.convenienceFee));

        return {
          depositor,
          availableDepositAmount,
          totalDepositAmount,
          outstandingIntentAmount,
          intentCount,
          conversionRate,
          convenienceFee
        };
      });

      setPositionsRowData(sanitizedPositions);
    }
  }, [deposits]);

  /*
   * Contract Writes
   */

  //
  // withdrawDeposit(uint256[] memory _depositIds)
  //
  const { config: writeWithdrawConfig } = usePrepareContractWrite({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'withdrawDeposit',
    args: [
      [selectedDepositIdToWithdraw],
    ],
    enabled: shouldConfigureWithdrawWrite
  });

  const {
    data: submitWithdrawResult,
    // isLoading: isSubmitWithdrawLoading,
    writeAsync: writeSubmitWithdrawAsync,
  } = useContractWrite(writeWithdrawConfig);

  const {
    // isLoading: isSubmitWithdrawMining
  } = useWaitForTransaction({
    hash: submitWithdrawResult ? submitWithdrawResult.hash : undefined,
    onSuccess(data) {
      console.log('writeSubmitWithdrawAsync successful: ', data);
      
      refetchDeposits?.();
    },
  });

  /*
   * Handlers
   */

  const navigateToRegistrationHandler = () => {
    navigate('/register');
  };

  const handleWithdrawClick = async (rowIndex: number) => {
    if (deposits) {
      const selectedDeposit = deposits[rowIndex];
      setSelectedDepositIdToWithdraw(selectedDeposit.depositId);

      setShouldConfigureWithdrawWrite(true);

      try {
        await writeSubmitWithdrawAsync?.();
      } catch (error) {
        console.log('writeSubmitWithdrawAsync failed: ', error);
      }
    }
  };
  
  /*
   * Helpers
   */

  function conversionRateToString(rate: bigint) {
    const scaledValue = rate * (PRECISION); // 833333333333333333000000000000000000n
    const reciprocal = (PRECISION * (100n * PRECISION)) / scaledValue; // 120n
    const difference = reciprocal - 100n;
  
    if (difference > 0n) {
      return difference.toString() + '%';
    } else {
      return '1:1';
    }
  }

  function feeAmountString(usdcAmountString: string) {
    return usdcAmountString + ' USDC';
  }

  return (
    <Container>
      <Column>
        <TitleRow>
          <ThemedText.HeadlineMedium>
            Deposit
          </ThemedText.HeadlineMedium>
          {isLoggedIn ? (
            <Button onClick={handleNewPositionClick} height={40}>
                + New Position
            </Button>
          ) : null}
        </TitleRow>

        <Content>
        {!isLoggedIn ? (
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
          ) : positionsRowData.length === 0 ? (
            <ErrorContainer>
              <ThemedText.DeprecatedBody textAlign="center">
                <InboxIcon strokeWidth={1} style={{ marginTop: '2em' }} />
                <div>
                  You have no active deposits.
                </div>
              </ThemedText.DeprecatedBody>
            </ErrorContainer>
          ) : (
            <PositionsContainer>
              <PositionCountTitle>
                <ThemedText.LabelSmall textAlign="left">
                  Your deposits ({positionsRowData.length})
                </ThemedText.LabelSmall>
              </PositionCountTitle>
              <Table>
                {positionsRowData.map((positionRow, rowIndex) => (
                  <PositionRowStyled key={rowIndex}>
                    <PositionRow
                      depositorHash={positionRow.depositor}
                      availableDepositAmount={positionRow.availableDepositAmount}
                      totalDepositAmount={positionRow.totalDepositAmount}
                      outstandingIntentAmount={positionRow.outstandingIntentAmount}
                      intentCount={positionRow.intentCount}
                      conversionRate={positionRow.conversionRate}
                      convenienceFee={positionRow.convenienceFee}
                      rowIndex={rowIndex}
                      handleWithdrawClick={() => {
                        handleWithdrawClick(rowIndex)
                      }}
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
  &:last-child {
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
  }
`;
