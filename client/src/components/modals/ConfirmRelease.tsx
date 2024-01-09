import React, { useEffect, useState } from "react";
import styled from 'styled-components';
import { ArrowLeft, Unlock } from 'react-feather';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';

import { TransactionButton } from "@components/common/TransactionButton";
import { Overlay } from '@components/modals/Overlay';
import { commonStrings } from '@helpers/strings';
import { Abi } from '@helpers/types';
import { ThemedText } from '@theme/text'
import useDeposits from '@hooks/venmo/useDeposits';
import useHdfcDeposits from '@hooks/hdfc/useDeposits';
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

  const [transactionAddress, setTransactionAddress] = useState<string>("");

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
    status: signReleaseTransactionStatus,
    writeAsync: writeSubmitReleaseAsync,
  } = useContractWrite(writeReleaseConfig);

  const {
    status: mineReleaseTransactionStatus,
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

  /*
   * Helpers
   */

  const ctaOnClick = async () => {
    try {
      await writeSubmitReleaseAsync?.();
    } catch (error) {
      console.log('writeSubmitReleaseAsync failed: ', error);
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

        <TransactionButton
          signTransactionStatus={signReleaseTransactionStatus}
          mineTransactionStatus={mineReleaseTransactionStatus}
          defaultLabel={"Submit Transaction"}
          minedLabel={"Go to Deposits"}
          onClick={ctaOnClick}
          fullWidth={true}
        />
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
  width: 56px;
  height: 56px;
  color: #FFF;
  padding: 0.5rem 0;
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
