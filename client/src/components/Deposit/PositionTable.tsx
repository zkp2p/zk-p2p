import React, { useEffect, useState } from 'react';
import { Inbox, FileText } from 'react-feather'
import styled, { css } from 'styled-components/macro'
import { useNavigate } from 'react-router-dom';
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from 'wagmi'

import { Button } from '../Button';
import { RowBetween } from '../layouts/Row';
import { ThemedText } from '../../theme/text';
import { DepositWithAvailableLiquidity } from "../../contexts/venmo/Deposits/types";
import { PositionRow } from "./PositionRow";
import { CustomConnectButton } from "../common/ConnectButton";
import { PlatformSelector } from '@components/modals/PlatformSelector';
import { toUsdcString, conversionRateToString } from '@helpers/units';
import { Abi } from '../../contexts/common/SmartContracts/types';
import useAccount from '@hooks/useAccount';
import useDeposits from '@hooks/useDeposits';
import useHdfcDeposits from '@hooks/hdfc/useHdfcDeposits';
import useSmartContracts from '@hooks/useSmartContracts';
import useRegistration from '@hooks/useRegistration';
import useHdfcRegistration from '@hooks/hdfc/useHdfcRegistration';
import useBalances from '@hooks/useBalance';
import usePlatformSettings from '@hooks/usePlatformSettings';


export interface DepositPrime {
  depositor: string;
  availableDepositAmount: string;
  totalDepositAmount: string;
  outstandingIntentAmount: string;
  intentCount: string;
  conversionRate: string;
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

  const { isLoggedIn } = useAccount();
  const { rampAddress, rampAbi, hdfcRampAddress, hdfcRampAbi } = useSmartContracts();
  const { refetchUsdcBalance } = useBalances();
  const { PaymentPlatform, paymentPlatform } = usePlatformSettings();

  const {
    isRegistered: isVenmoRegistered
  } = useRegistration();

  const {
    isRegistered: isHdfcRegistered
  } = useHdfcRegistration();

  const {
    deposits: venmoDeposits,
    refetchDeposits: refetchVenmoDeposits
  } = useDeposits();

  const {
    deposits: hdfcDeposits,
    refetchDeposits: refetchHdfcDeposits
  } = useHdfcDeposits();

  /*
   * State
   */

  const [positionsRowData, setPositionsRowData] = useState<DepositPrime[]>([]);

  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  const [selectedDepositIdToWithdraw, setSelectedDepositIdToWithdraw] = useState<bigint>(0n);
  const [selectedRowIndexToWithdraw, setSelectedRowIndexToWithdraw] = useState<number>(0);

  const [withdrawRampAddress, setWithdrawRampAddress] = useState<string>(rampAddress);
  const [withdrawRampAbi, setWithdrawRampAbi] = useState<Abi>(rampAbi);

  const [shouldConfigureWithdrawWrite, setShouldConfigureWithdrawWrite] = useState<boolean>(false);

  /*
   * Contract Writes
   */

  //
  // withdrawDeposit(uint256[] memory _depositIds)
  //
  const { config: writeWithdrawConfig } = usePrepareContractWrite({
    address: withdrawRampAddress,
    abi: withdrawRampAbi,
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
    onSuccess(data) {
      console.log('writeSubmitWithdrawAsync successful: ', data);
      
      switch (paymentPlatform) {
        case PaymentPlatform.VENMO:
          refetchVenmoDeposits?.();
          break;

        case PaymentPlatform.HDFC:
          refetchHdfcDeposits?.();
          break;

        default:
          throw new Error(`Unknown payment platform: ${paymentPlatform}`);
      }

      refetchUsdcBalance?.();
    },
  });

  /*
   * Hooks
   */

  useEffect(() => {
    if (paymentPlatform) {
      switch (paymentPlatform) {
        case PaymentPlatform.VENMO:
          setIsRegistered(isVenmoRegistered);
          break;

        case PaymentPlatform.HDFC:
          setIsRegistered(isHdfcRegistered);
          break;

        default:
          throw new Error(`Unknown payment platform: ${paymentPlatform}`);
      }
    } else {
      setIsRegistered(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, isVenmoRegistered, isHdfcRegistered]);

  useEffect(() => {
    let depositsToDisplay: DepositWithAvailableLiquidity[] | null = [];
    if (paymentPlatform) {
      switch (paymentPlatform) {
        case PaymentPlatform.VENMO:
          depositsToDisplay = venmoDeposits;
          break;

        case PaymentPlatform.HDFC:
          depositsToDisplay = hdfcDeposits;
          break;

        default:
          throw new Error(`Unknown payment platform: ${paymentPlatform}`);
      }
    }

    if (!depositsToDisplay) {
      setPositionsRowData([]);  
    } else {
      var sanitizedPositions: DepositPrime[] = [];
      sanitizedPositions = depositsToDisplay.map((depositWithLiquidity: DepositWithAvailableLiquidity) => {
        const deposit = depositWithLiquidity.deposit

        const depositor = deposit.depositor;
        const availableDepositAmount = toUsdcString(depositWithLiquidity.availableLiquidity, true);
        const totalDepositAmount = toUsdcString(deposit.depositAmount, true);
        const intentCount = deposit.intentHashes.length.toString();
        const outstandingIntentAmount = toUsdcString(deposit.outstandingIntentAmount, true);
        const conversionRate = conversionRateToString(deposit.conversionRate, true);

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
  }, [venmoDeposits, hdfcDeposits, paymentPlatform]);

  useEffect(() => {
    const executeWithdrawDeposit = async () => {
      if (shouldConfigureWithdrawWrite && writeSubmitWithdrawAsync && submitWithdrawStatus === 'idle') {
        try {
          await writeSubmitWithdrawAsync();
        } catch (error) {
          console.log('writeSubmitWithdrawAsync failed: ', error);

          setShouldConfigureWithdrawWrite(false);
        }
      }
    };
  
    executeWithdrawDeposit();
  }, [
    shouldConfigureWithdrawWrite,
    writeSubmitWithdrawAsync,
    submitWithdrawStatus,
  ]);

  /*
   * Handlers
   */

  const navigateToRegistrationHandler = () => {
    navigate('/register');
  };

  const handleWithdrawClick = async (rowIndex: number) => {
    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        if (venmoDeposits) {
          const selectedDeposit = venmoDeposits[rowIndex];
          setSelectedDepositIdToWithdraw(selectedDeposit.depositId);

          setSelectedRowIndexToWithdraw(rowIndex);

          setWithdrawRampAddress(rampAddress);
          setWithdrawRampAbi(rampAbi);

          setShouldConfigureWithdrawWrite(true);
        }
        break;

      case PaymentPlatform.HDFC:
        if (hdfcDeposits) {
          const selectedDeposit = hdfcDeposits[rowIndex];
          setSelectedDepositIdToWithdraw(selectedDeposit.depositId);

          setSelectedRowIndexToWithdraw(rowIndex);
          
          setWithdrawRampAddress(hdfcRampAddress);
          setWithdrawRampAbi(hdfcRampAbi);

          setShouldConfigureWithdrawWrite(true);
        }
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
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
            Deposits
          </ThemedText.HeadlineMedium>
          {isLoggedIn && isRegistered ? (
            <Button onClick={handleNewPositionClick} height={40}>
                + New Position
            </Button>
          ) : null}
        </TitleRow>

        <Content>
          <PlatformSelectorContainer>
            <PlatformSelector />
          </PlatformSelectorContainer>

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
                  Your active deposits ({positionsRowData.length})
                </ThemedText.LabelSmall>

                <PlatformSelectorContainer>
                  <PlatformSelector />
                </PlatformSelectorContainer>
              </PositionCountTitle>
              <Table>
                {positionsRowData.map((positionRow, rowIndex) => (
                  <PositionRowStyled key={rowIndex}>
                    <PositionRow
                      availableDepositAmount={positionRow.availableDepositAmount}
                      totalDepositAmount={positionRow.totalDepositAmount}
                      outstandingIntentAmount={positionRow.outstandingIntentAmount}
                      intentCount={positionRow.intentCount}
                      conversionRate={positionRow.conversionRate}
                      rowIndex={rowIndex}
                      isCancelDepositLoading={rowIndex === selectedRowIndexToWithdraw && (isSubmitWithdrawLoading || isSubmitWithdrawMining)}
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
  background-color: #0D111C;
  border: 1px solid #98a1c03d;
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

const PlatformSelectorContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
  padding: 1.5rem;
`;

const IconStyle = css`
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
`;

const InboxIcon = styled(Inbox)`
  ${IconStyle}
`;

const FileTextIcon = styled(FileText)`
  ${IconStyle}
`;

const PositionsContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
`;

const PositionCountTitle = styled.div`
  width: 100%;
  justify-content: space-between;
  text-align: left;
  padding-top: 2rem;
  padding-bottom: 1.75rem;
  padding-left: 1.5rem;
  border-bottom: 1px solid #98a1c03d;
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

const PositionRowStyled = styled.div`
  &:last-child {
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
  }
`;
