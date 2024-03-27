import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import Link from '@mui/material/Link';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'react-feather';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';

import { RowBetween } from '@components/layouts/Row';
import { NotaryForm } from '@components/Notary/NotaryForm';
import { NumberedStep } from "@components/common/NumberedStep";
import { wiseStrings } from "@helpers/strings";
import { PaymentPlatform, NotaryVerificationCircuit } from '@helpers/types';
import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';
import useBalances from '@hooks/useBalance';
import useOnRamperIntents from '@hooks/wise/useOnRamperIntents';
import useSmartContracts from '@hooks/useSmartContracts';


interface OnRampProps {
  handleBackClick: () => void;
  selectedUIntIntentHash: string;
}

export const OnRamp: React.FC<OnRampProps> = ({
  handleBackClick,
  selectedUIntIntentHash
}) => {
  const navigate = useNavigate();

  /*
   * Context
   */

  const { wiseRampAddress, wiseRampAbi } = useSmartContracts();
  const { refetchIntentHash } = useOnRamperIntents();
  const { refetchUsdcBalance } = useBalances();

  /*
   * State
   */

  const [shouldConfigureRampWrite, setShouldConfigureRampWrite] = useState<boolean>(false);
  const [submitOnRampTransactionHash, setSubmitOnRampTransactionHash] = useState<string | null>(null);

  // ----- transaction state -----
  const [verificationSignature, setVerificationSignature] = useState<string>('');
  // const [verificationSignature, setVerificationSignature] = useState<string>(
  //   JSON.stringify()
  // );

  const [publicSignals, setPublicSignals] = useState<string>('');
  // const [publicSignals, setPublicSignals] = useState<string>(
  //   JSON.stringify()
  // );

  /*
   * Contract Writes
   */

  //
  // onRamp(bytes32 _intentHash, IWiseSendProcessor.SendData calldata _sendData, bytes calldata _verifierSignature)
  //
  const { config: writeSubmitOnRampConfig } = usePrepareContractWrite({
    address: wiseRampAddress,
    abi: wiseRampAbi,
    functionName: 'onRamp',
    args: [
      publicSignals,
      verificationSignature
    ],
    onError: (error: { message: any }) => {
      console.error(error.message);
    },
    enabled: shouldConfigureRampWrite
  });

  const {
    data: submitOnRampResult,
    status: submitOnRampStatus,
    writeAsync: writeSubmitOnRampAsync
  } = useContractWrite(writeSubmitOnRampConfig);

  const {
    isLoading: isSubmitOnRampMining,
    isSuccess: isSubmitOnRampSuccessful
  } = useWaitForTransaction({
    hash: submitOnRampResult ? submitOnRampResult.hash : undefined,
    onSuccess(data: any) {
      console.log('writeSubmitOnRampAsync successful: ', data);

      refetchUsdcBalance?.();
      
      refetchIntentHash?.();
    },
  });

  /*
   * Hooks
   */

  useEffect(() => {
    if (verificationSignature && publicSignals) {
      setShouldConfigureRampWrite(true);
    } else {
      setShouldConfigureRampWrite(false);
    }
  }, [verificationSignature, publicSignals]);

  useEffect(() => {
    if (submitOnRampResult?.hash) {
      setSubmitOnRampTransactionHash(submitOnRampResult.hash);
    }
  }, [submitOnRampResult])

  /*
   * Handlers
   */

  const handleWriteSubmitOnRampClick = async () => {
    try {
      await writeSubmitOnRampAsync?.();
    } catch (error) {
      console.log('writeSubmitDepositAsync failed: ', error);
    }
  };

  const handleVerificationCompleteClick = () => {
    navigate('/send');
  };

  /*
   * Component
   */

  return (
    <Container>
      <TitleContainer>
        <RowBetween style={{ paddingBottom: '1.5rem' }}>
          <div style={{ flex: 0.5 }}>
            <button
              onClick={handleBackClick}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <StyledArrowLeft/>
            </button>
          </div>

          <ThemedText.HeadlineSmall style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
            Complete On-Ramp
          </ThemedText.HeadlineSmall>

          <div style={{ flex: 0.5 }}/>
        </RowBetween>

        <InstructionsAndTogglesContainer>
          <NumberedStep>
            {wiseStrings.get('PROOF_FORM_TITLE_SEND_INSTRUCTIONS')}
            <Link href="https://docs.zkp2p.xyz/zkp2p/user-guides/on-ramping" target="_blank">
              Learn more ↗
            </Link>
          </NumberedStep>
        </InstructionsAndTogglesContainer>
      </TitleContainer>

      <NotaryForm
        paymentPlatformType={PaymentPlatform.WISE}
        circuitType={NotaryVerificationCircuit.TRANSFER}
        verificationSignature={verificationSignature}
        publicSignals={publicSignals}
        setVerificationSignature={setVerificationSignature}
        setPublicSignals={setPublicSignals}
        submitTransactionStatus={submitOnRampStatus}
        isSubmitMining={isSubmitOnRampMining}
        isSubmitSuccessful={isSubmitOnRampSuccessful}
        handleSubmitVerificationClick={handleWriteSubmitOnRampClick}
        onVerifyNotarizationCompletion={handleVerificationCompleteClick}
        transactionAddress={submitOnRampTransactionHash}
        selectedUIntIntentHash={selectedUIntIntentHash}
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 4rem;
`;

const TitleContainer = styled.div`
  padding: 1.5rem;
  background-color: ${colors.container};
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const InstructionsAndTogglesContainer = styled.div`
  display: grid;
  flex-direction: column;
  gap: 1rem;
`;

const StyledArrowLeft = styled(ArrowLeft)`
  color: #FFF;
`;
