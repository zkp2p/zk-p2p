import React, { useEffect, useState } from "react";
import styled from 'styled-components';
import { ArrowLeft, Unlock } from 'react-feather';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'

import { ThemedText } from '../../theme/text'
import { Overlay } from '@components/modals/Overlay';
import { commonStrings } from '@helpers/strings';
import { Abi } from '../../contexts/common/SmartContracts/types';
import { TransactionStatus, TransactionStatusType } from "@helpers/types";
import { Button } from "../Button";
import useDeposits from '@hooks/useDeposits';
import useHdfcDeposits from '@hooks/hdfc/useHdfcDeposits';
import useSmartContracts from '@hooks/useSmartContracts';
import useBalances from '@hooks/useBalance';
import usePlatformSettings from '@hooks/usePlatformSettings';


interface ConfirmReleaseProps {
  onBackClick: () => void
  intentHash: string;
  amountUSDCToSend: string;
}

export const ConfirmRelease: React.FC<ConfirmReleaseProps> = ({
  onBackClick,
  intentHash,
  amountUSDCToSend,
}) => {
  /*
   * Contexts
   */

  const { venmoRampAddress, venmoRampAbi, hdfcRampAddress, hdfcRampAbi, blockscanUrl } = useSmartContracts();
  const { refetchUsdcBalance } = useBalances();
  const { PaymentPlatform, paymentPlatform } = usePlatformSettings();

  const {
    refetchDeposits: refetchVenmoDeposits
  } = useDeposits();

  const {
    refetchDeposits: refetchHdfcDeposits
  } = useHdfcDeposits();

  /*
   * State
   */

  const [ctaButtonTitle, setCtaButtonTitle] = useState<string>("");

  const [transactionAddress, setTransactionAddress] = useState<string>("");

  const [submitTransactionStatus, setSubmitTransactionStatus] = useState<TransactionStatusType>(TransactionStatus.TRANSACTION_CONFIGURED);

  const [releaseRampAddress, setReleaseRampAddress] = useState<string>(venmoRampAddress);
  const [releaseRampAbi, setReleaseRampAbi] = useState<Abi>(venmoRampAbi);

  /*
   * Contract Writes
   */

  //
  // releaseFundsToOnramper(bytes32 _intentHash)
  //
  const { config: writeReleaseConfig } = usePrepareContractWrite({
    address: releaseRampAddress,
    abi: releaseRampAbi,
    functionName: 'releaseFundsToOnramper',
    args: [
      intentHash,
    ],
  });

  const {
    data: submitReleaseResult,
    isLoading: isSubmitReleaseLoading,
    status: submitReleaseStatus,
    writeAsync: writeSubmitReleaseAsync,
  } = useContractWrite(writeReleaseConfig);

  const {
    isLoading: isSubmitReleaseMining
  } = useWaitForTransaction({
    hash: submitReleaseResult ? submitReleaseResult.hash : undefined,
    onSuccess(data) {
      console.log('writeSubmitReleaseAsync successful: ', data);
      
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

      setSubmitTransactionStatus(TransactionStatus.TRANSACTION_MINED);
    },
  });

  /*
   * Handlers
   */

  const handleOverlayClick = () => {
    onBackClick();
  }

  /*
   * Hooks
   */

  useEffect(() => {
    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        if (venmoRampAddress && venmoRampAbi) {
          setReleaseRampAddress(venmoRampAddress);
          setReleaseRampAbi(venmoRampAbi);
        }
        break;

      case PaymentPlatform.HDFC:
        if (hdfcRampAddress && hdfcRampAbi) {
          setReleaseRampAddress(hdfcRampAddress);
          setReleaseRampAbi(hdfcRampAbi);
        }
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, venmoRampAddress, venmoRampAbi, hdfcRampAddress, hdfcRampAbi]);

  useEffect(() => {
    if (submitReleaseResult?.hash) {
      setTransactionAddress(submitReleaseResult.hash);
    }
  }, [submitReleaseResult])

  useEffect(() => {
    switch (submitReleaseStatus) {
      case 'idle':
        setSubmitTransactionStatus(TransactionStatus.TRANSACTION_CONFIGURED);
        break;

      case 'loading':
        setSubmitTransactionStatus(TransactionStatus.TRANSACTION_LOADING);
        break;

      case 'success':
        setSubmitTransactionStatus(TransactionStatus.TRANSACTION_MINING);
        break;
    }

  }, [submitReleaseStatus]);

  useEffect(() => {
    switch (submitTransactionStatus) {
      case TransactionStatus.TRANSACTION_CONFIGURED:
        setCtaButtonTitle("Submit Transaction");
        break;

      case TransactionStatus.TRANSACTION_LOADING:
        setCtaButtonTitle("Signing Transaction");
        break;

      case TransactionStatus.TRANSACTION_MINING:
        setCtaButtonTitle("Mining Transaction");
        break;

      case TransactionStatus.TRANSACTION_MINED:
          default:
            setCtaButtonTitle('Go to Deposits');
        break;
    }

  }, [submitTransactionStatus]);

  /*
   * Helpers
   */

  const ctaOnClick = async () => {
    try {
      await writeSubmitReleaseAsync?.();
    } catch (error) {
      console.log('writeSubmitReleaseAsync failed: ', error);

      setSubmitTransactionStatus(TransactionStatus.TRANSACTION_CONFIGURED);
    }
  }

  /*
   * Component
   */

  return (
    <ModalAndOverlayContainer>
      <Overlay />

      <ModalContainer>
        <TitleCenteredRow>
          <div style={{ flex: 0.25 }}>
            <button
              onClick={handleOverlayClick}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >

              <StyledArrowLeft/>
            </button>
          </div>

          <ThemedText.HeadlineSmall style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
            {'Release Funds'}
          </ThemedText.HeadlineSmall>

          <div style={{ flex: 0.25 }}/>
        </TitleCenteredRow>

        <StyledUnlock />

        <InstructionsContainer>
          <InstructionsLabel>
            { commonStrings.get('RELEASE_FUNDS_WARNING_ONE') }
            { `${amountUSDCToSend} USDC` }
            { commonStrings.get('RELEASE_FUNDS_WARNING_TWO') }
          </InstructionsLabel>
        </InstructionsContainer>

        { transactionAddress?.length ? (
          <Link
            href={`${blockscanUrl}/tx/${transactionAddress}`}
            target="_blank"
            rel="noopener noreferrer">
              <ThemedText.LabelSmall textAlign="left" paddingBottom={"0.75rem"}>
                View on Explorer ↗
              </ThemedText.LabelSmall>
          </Link>
        ) : null}

        <Button
          disabled={isSubmitReleaseLoading || isSubmitReleaseMining}
          onClick={ctaOnClick}
          fullWidth={true}
        >
          {ctaButtonTitle}
        </Button>
      </ModalContainer>
    </ModalAndOverlayContainer>
  );
};

const ModalAndOverlayContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  position: fixed;
  align-items: flex-start;
  top: 0;
  left: 0;
  z-index: 10;
`;

const ModalContainer = styled.div`
  width: 472px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.25rem;
  background: #0D111C;
  justify-content: space-between;
  align-items: center;
  z-index: 20;
  gap: 1.3rem;
  top: 33%;
  position: relative;
`;

const TitleCenteredRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  color: #FFF;
`;

const StyledArrowLeft = styled(ArrowLeft)`
  color: #FFF;
`;

const StyledUnlock = styled(Unlock)`
  width: 64px;
  height: 64px;
  color: #FFF;
  padding: 0.75rem 0;
`;

const InstructionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  padding: 0 1.75rem;
  color: #FFF;
`;

const InstructionsLabel = styled.div`
  font-size: 16px;
  text-align: center;
  line-height: 1.5;
`;

const Link = styled.a`
  white-space: pre;
  display: inline-block;
  color: #1F95E2;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
