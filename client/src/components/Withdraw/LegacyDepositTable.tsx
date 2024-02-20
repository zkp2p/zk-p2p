import React, { useEffect, useState } from 'react';
import { Inbox } from 'react-feather';
import styled, { css } from 'styled-components/macro';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';

import { RowBetween } from '@components/layouts/Row';
import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';
import { DepositWithAvailableLiquidity } from '@helpers/types';
import { LegacyDepositRow } from "@components/Withdraw/LegacyDepositRow";
import { CustomConnectButton } from "@components/common/ConnectButton";
import { toUsdcString, conversionRateToMultiplierString } from '@helpers/units';
import useAccount from '@hooks/useAccount';
import useLegacyDeposits from '@hooks/useLegacyDeposits';
import useSmartContracts from '@hooks/useSmartContracts';
import useBalances from '@hooks/useBalance';


export interface DepositPrime {
  depositor: string;
  availableDepositAmount: string;
  totalDepositAmount: string;
  outstandingIntentAmount: string;
  intentCount: string;
  conversionRate: string;
}

export const LegacyDepositTable: React.FC = () => {
  /*
   * Contexts
   */

  const { isLoggedIn } = useAccount();
  const { legacyRampAddress, legacyRampAbi } = useSmartContracts();
  const { refetchUsdcBalance } = useBalances();

  const {
    deposits: legacyVenmoDeposits,
    refetchDeposits: refetchLegacyVenmoDeposits
  } = useLegacyDeposits();

  /*
   * State
   */

  const [positionsRowData, setPositionsRowData] = useState<DepositPrime[]>([]);

  const [selectedDepositIdToWithdraw, setSelectedDepositIdToWithdraw] = useState<bigint>(0n);
  const [selectedRowIndexToWithdraw, setSelectedRowIndexToWithdraw] = useState<number>(0);

  const [shouldConfigureWithdrawWrite, setShouldConfigureWithdrawWrite] = useState<boolean>(false);

  /*
   * Contract Writes
   */

  //
  // withdrawDeposit(uint256[] memory _depositIds)
  //
  const { config: writeWithdrawConfig } = usePrepareContractWrite({
    address: legacyRampAddress,
    abi: legacyRampAbi,
    functionName: 'withdrawDeposit',
    args: [
      [selectedDepositIdToWithdraw],
    ],
    enabled: shouldConfigureWithdrawWrite
  });

  const {
    data: submitWithdrawResult,
    isLoading: isSubmitWithdrawLoading,
    status: submitWithdrawStatus,
    writeAsync: writeSubmitWithdrawAsync,
  } = useContractWrite(writeWithdrawConfig);

  const {
    isLoading: isSubmitWithdrawMining
  } = useWaitForTransaction({
    hash: submitWithdrawResult ? submitWithdrawResult.hash : undefined,
    onSuccess(data: any) {
      console.log('writeSubmitWithdrawAsync successful: ', data);

      refetchUsdcBalance?.();

      refetchLegacyVenmoDeposits?.();

      setShouldConfigureWithdrawWrite(false);
    },
  });

  /*
   * Hooks
   */

  useEffect(() => {
    if (!legacyVenmoDeposits) {
      setPositionsRowData([]);  
    } else {
      var sanitizedPositions: DepositPrime[] = [];
      sanitizedPositions = legacyVenmoDeposits.map((depositWithLiquidity: DepositWithAvailableLiquidity) => {
        const deposit = depositWithLiquidity.deposit

        const depositor = deposit.depositor;
        const availableDepositAmount = toUsdcString(depositWithLiquidity.availableLiquidity, true);
        const totalDepositAmount = toUsdcString(deposit.depositAmount, true);
        const intentCount = deposit.intentHashes.length.toString();
        const outstandingIntentAmount = toUsdcString(deposit.outstandingIntentAmount, true);
        const conversionRate = conversionRateToMultiplierString(deposit.conversionRate);

        return {
          depositor,
          availableDepositAmount,
          totalDepositAmount,
          outstandingIntentAmount,
          intentCount,
          conversionRate
        };
      });

      setPositionsRowData(sanitizedPositions);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [legacyVenmoDeposits]);

  useEffect(() => {
    const executeWithdrawDeposit = async () => {
      const requiredStatusForExecution = submitWithdrawStatus === 'idle' || submitWithdrawStatus === 'error';

      if (shouldConfigureWithdrawWrite && writeSubmitWithdrawAsync && requiredStatusForExecution) {
        try {
          await writeSubmitWithdrawAsync();
        } catch (error) {
          console.log('writeSubmitWithdrawAsync failed: ', error);

          setShouldConfigureWithdrawWrite(false);
        }
      }
    };
  
    executeWithdrawDeposit();
  }, [shouldConfigureWithdrawWrite, writeSubmitWithdrawAsync, submitWithdrawStatus]);

  /*
   * Handlers
   */

  const handleWithdrawClick = async (rowIndex: number) => {
    if (legacyVenmoDeposits) {
      const selectedDeposit = legacyVenmoDeposits[rowIndex];
      setSelectedDepositIdToWithdraw(selectedDeposit.depositId);

      setSelectedRowIndexToWithdraw(rowIndex);

      setShouldConfigureWithdrawWrite(true);
    }
  };
  
  /*
   * Component
   */

  return (
    <Container>
      <Column>
        <TitleRow>
          <ThemedText.HeadlineMedium>
            Withdraw
          </ThemedText.HeadlineMedium>
        </TitleRow>

        <Content>
          {!isLoggedIn ? (
            <ErrorContainer>
              <ThemedText.DeprecatedBody textAlign="center">
                <InboxIcon strokeWidth={1} style={{ marginTop: '2em' }} />
                <div>
                  Your legacy deposits will appear here.
                </div>
              </ThemedText.DeprecatedBody>
              <CustomConnectButton width={152} />
            </ErrorContainer>
          ) : positionsRowData.length === 0 ? (
            <ErrorContainer>
              <ThemedText.DeprecatedBody textAlign="center">
                <InboxIcon strokeWidth={1} style={{ marginTop: '2em' }} />
                <div>
                  You have no legacy deposits.
                </div>
              </ThemedText.DeprecatedBody>
            </ErrorContainer>
          ) : (
            <DepositsContainer>
              <DepositsCountTitle>
                <ThemedText.LabelSmall textAlign="left">
                  Your legacy deposits ({positionsRowData.length})
                </ThemedText.LabelSmall>
              </DepositsCountTitle>
              <Table>
                {positionsRowData.map((positionRow, rowIndex) => (
                  <DepositRowStyled key={rowIndex}>
                    <LegacyDepositRow
                      availableDepositAmount={positionRow.availableDepositAmount}
                      totalDepositAmount={positionRow.totalDepositAmount}
                      outstandingIntentAmount={positionRow.outstandingIntentAmount}
                      intentCount={positionRow.intentCount}
                      conversionRate={positionRow.conversionRate}
                      rowIndex={rowIndex}
                      isWithdrawDepositLoading={rowIndex === selectedRowIndexToWithdraw && (isSubmitWithdrawLoading || isSubmitWithdrawMining)}
                      handleWithdrawClick={() => {
                        handleWithdrawClick(rowIndex)
                      }}
                    />
                  </DepositRowStyled>
                ))}
              </Table>
            </DepositsContainer>
          )}
        </Content>
      </Column>
    </Container>
  )
};

const Container = styled.div`
  width: 100%;
  gap: 1rem;
`;

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
  background-color: ${colors.container};
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 16px;
  flex-direction: column;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  overflow: hidden;
  position: relative;
`;

const ErrorContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  padding: 36px;
  max-width: 340px;
  min-height: 25vh;
  gap: 36px;
`;

const IconStyle = css`
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
`;

const InboxIcon = styled(Inbox)`
  ${IconStyle}
`;

const DepositsContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
`;

const DepositsCountTitle = styled.div`
  width: 100%;
  justify-content: space-between;
  text-align: left;
  padding-top: 2rem;
  padding-bottom: 1.75rem;
  padding-left: 1.5rem;
  border-bottom: 1px solid ${colors.defaultBorderColor};
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
    border-bottom: 1px solid ${colors.defaultBorderColor};
  }

  & > *:last-child {
    border-bottom: none;
  }
`;

const DepositRowStyled = styled.div`
  &:last-child {
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
  }
`;
