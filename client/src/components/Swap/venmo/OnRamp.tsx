import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import Link from '@mui/material/Link';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'react-feather';
import { CircuitType } from '@zkp2p/circuits-circom-helpers/generate_input';
import { useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';

import { RowBetween } from '@components/layouts/Row';
import { ProofGenerationForm } from "@components/ProofGen/ProofForm";
import { NumberedStep } from "@components/common/NumberedStep";
import { SEND_KEY_FILE_NAME, RemoteProofGenEmailTypes  } from "@helpers/constants";
import { venmoStrings } from "@helpers/strings";
import { reformatProofForChain } from "@helpers/submitProof";
import { PaymentPlatform } from '@helpers/types';
import { ThemedText } from '@theme/text';
import useBalances from '@hooks/useBalance';
import useOnRamperIntents from '@hooks/venmo/useOnRamperIntents';
import useSmartContracts from '@hooks/useSmartContracts';


interface OnRampProps {
  handleBackClick: () => void;
  selectedIntentHash: string;
}

export const OnRamp: React.FC<OnRampProps> = ({
  handleBackClick,
  selectedIntentHash
}) => {
  const navigate = useNavigate();

  /*
   * Context
   */

  const {
    venmoRampAddress,
    venmoRampAbi,
    venmoSendProcessorAbi,
    venmoSendProcessorAddress,
  } = useSmartContracts();
  const { refetchIntentHash } = useOnRamperIntents();
  const { refetchUsdcBalance } = useBalances();

  /*
   * State
   */

  const [shouldConfigureRampWrite, setShouldConfigureRampWrite] = useState<boolean>(false);
  const [shouldFetchVerifyProof, setShouldFetchVerifyProof] = useState<boolean>(false);
  const [submitOnRampTransactionHash, setSubmitOnRampTransactionHash] = useState<string | null>(null);

  // ----- transaction state -----
  const [proof, setProof] = useState<string>('');
  const [bodyHashProof, setBodyHashProof] = useState<string>('');
  // const [proof, setProof] = useState<string>(
  //   JSON.stringify()
  // );

  const [publicSignals, setPublicSignals] = useState<string>('');
  const [bodyHashPublicSignals, setBodyHashPublicSignals] = useState<string>('');
  // const [publicSignals, setPublicSignals] = useState<string>(
  //   JSON.stringify()
  // );

  /*
   * Contract Reads
   */

  const {
    data: verifyProofRaw,
  } = useContractRead({
    address: venmoSendProcessorAddress,
    abi: venmoSendProcessorAbi,
    functionName: "verifyProof",
    args: [
      ...reformatProofForChain(proof[0]),
      publicSignals ? JSON.parse(publicSignals[0]) : null,
    ],
    enabled: shouldFetchVerifyProof,
  });

  /*
   * Contract Writes
   */

  //
  // onRamp(uint256[2] memory _a, uint256[2][2] memory _b, uint256[2] memory _c, uint256[10] memory _signals)
  //
  const { config: writeSubmitOnRampConfig } = usePrepareContractWrite({
    address: venmoRampAddress,
    abi: venmoRampAbi,
    functionName: 'onRamp',
    args: [
      ...reformatProofForChain(proof[0]),
      publicSignals ? JSON.parse(publicSignals[0]) : null,
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
    if (proof && publicSignals) {
      // console.log("proof", proof);
      // console.log("public signals", publicSignals);
      // console.log("vkey", vkey);

      // const proofVerified = await snarkjs.groth16.verify(vkey, JSON.parse(publicSignals), JSON.parse(proof));
      // console.log("proofVerified", proofVerified);

      setShouldFetchVerifyProof(true);
    } else {
      setShouldFetchVerifyProof(false);
    }
  }, [proof, publicSignals]);

  useEffect(() => {
    if (verifyProofRaw) {
      setShouldConfigureRampWrite(true);
    } else {
      setShouldConfigureRampWrite(false);
    }
  }, [verifyProofRaw]);

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
            {venmoStrings.get('PROOF_FORM_TITLE_SEND_INSTRUCTIONS')}
            <Link href="https://docs.zkp2p.xyz/zkp2p/user-guides/on-ramping" target="_blank">
              Learn more ↗
            </Link>
          </NumberedStep>
        </InstructionsAndTogglesContainer>
      </TitleContainer>

      <ProofGenerationForm
        paymentPlatformType={PaymentPlatform.VENMO}
        circuitType={CircuitType.EMAIL_VENMO_SEND}
        circuitRemoteFilePath={SEND_KEY_FILE_NAME}
        circuitInputs={selectedIntentHash}
        remoteProofGenEmailType={RemoteProofGenEmailTypes.SEND}
        proof={proof}
        publicSignals={publicSignals}
        setProof={setProof}
        setPublicSignals={setPublicSignals}
        bodyHashProof={bodyHashProof}
        bodyHashPublicSignals={bodyHashPublicSignals}
        setBodyHashProof={setBodyHashProof}
        setBodyHashPublicSignals={setBodyHashPublicSignals}
        onVerifyEmailCompletion={handleVerificationCompleteClick}
        submitTransactionStatus={submitOnRampStatus}
        isSubmitMining={isSubmitOnRampMining}
        isSubmitSuccessful={isSubmitOnRampSuccessful}
        handleSubmitVerificationClick={handleWriteSubmitOnRampClick}
        transactionAddress={submitOnRampTransactionHash}
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
  background-color: #0D111C;
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
