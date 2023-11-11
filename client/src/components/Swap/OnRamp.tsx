import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro'
import Link from '@mui/material/Link';
import { ArrowLeft } from 'react-feather';
import { CircuitType } from '@zkp2p/circuits-circom/scripts/generate_input';
import {
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from 'wagmi'

import { RowBetween } from '../layouts/Row'
import { ThemedText } from '../../theme/text'
import { ProofGenerationForm } from "../ProofGen/ProofForm";
import { NumberedStep } from "../common/NumberedStep";
import { ProofSettings } from "@components/ProofGen/ProofSettings";
import { SEND_KEY_FILE_NAME, RemoteProofGenEmailTypes  } from "@helpers/constants";
import { PROOF_FORM_TITLE_SEND_INSTRUCTIONS } from "@helpers/tooltips";
import { reformatProofForChain } from "@helpers/submitProof";
import useBalances from '@hooks/useBalance';
import useOnRamperIntents from '@hooks/useOnRamperIntents';
import useSmartContracts from '@hooks/useSmartContracts';


interface OnRampProps {
  handleBackClick: () => void;
  selectedIntentHash: string;
}
 
export const OnRamp: React.FC<OnRampProps> = ({
  handleBackClick,
  selectedIntentHash
}) => {
  /*
   * Context
   */
  
  const {
    rampAddress,
    rampAbi,
    sendProcessorAddress,
    sendProcessorAbi,
  } = useSmartContracts();
  const { refetchIntentHash } = useOnRamperIntents();
  const { refetchUsdcBalance } = useBalances();

  /*
   * State
   */

  const [shouldConfigureRampWrite, setShouldConfigureRampWrite] = useState<boolean>(false);
  const [shouldFetchVerifyProof, setShouldFetchVerifyProof] = useState<boolean>(false);

  // ----- transaction state -----
  const [proof, setProof] = useState<string>('');
  // const [proof, setProof] = useState<string>(
  //   JSON.stringify()
  // );
  
  const [publicSignals, setPublicSignals] = useState<string>('');
  // const [publicSignals, setPublicSignals] = useState<string>(
  //   JSON.stringify()
  // );

  /*
   * Contract Reads
   */

  const {
    data: verifyProofRaw,
  } = useContractRead({
    address: sendProcessorAddress,
    abi: sendProcessorAbi,
    functionName: "verifyProof",
    args: [
      ...reformatProofForChain(proof),
      publicSignals ? JSON.parse(publicSignals) : null,
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
    address: rampAddress,
    abi: rampAbi,
    functionName: 'onRamp',
    args: [
      ...reformatProofForChain(proof),
      publicSignals ? JSON.parse(publicSignals) : null,
    ],
    onError: (error: { message: any }) => {
      console.error(error.message);
    },
    enabled: shouldConfigureRampWrite
  });

  const {
    data: submitOnRampResult,
    isLoading: isWriteSubmitOnRampLoading,
    writeAsync: writeSubmitOnRampAsync
  } = useContractWrite(writeSubmitOnRampConfig);

  const {
    isLoading: isSubmitOnRampMining,
    isSuccess: isSubmitOnRampSuccessful
  } = useWaitForTransaction({
    hash: submitOnRampResult ? submitOnRampResult.hash : undefined,
    onSuccess(data) {
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
            {PROOF_FORM_TITLE_SEND_INSTRUCTIONS}
            <Link href="https://zkp2p.gitbook.io/zkp2p/user-guides/on-ramping" target="_blank">
              Learn more ↗
            </Link>
          </NumberedStep>

          <ProofSettings/>
        </InstructionsAndTogglesContainer>
      </TitleContainer>

      <ProofGenerationForm
        circuitType={CircuitType.EMAIL_VENMO_SEND}
        circuitRemoteFilePath={SEND_KEY_FILE_NAME}
        circuitInputs={selectedIntentHash}
        remoteProofGenEmailType={RemoteProofGenEmailTypes.SEND}
        proof={proof}
        publicSignals={publicSignals}
        setProof={setProof}
        setPublicSignals={setPublicSignals}
        isSubmitProcessing={isSubmitOnRampMining || isWriteSubmitOnRampLoading}
        isSubmitSuccessful={isSubmitOnRampSuccessful}
        handleSubmitVerificationClick={handleWriteSubmitOnRampClick}
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
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
