import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro'
import { ArrowLeft } from 'react-feather';
import { CircuitType } from '@zkp2p/circuits-circom/scripts/generate_input';
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
 } from 'wagmi'

import { RowBetween } from '../layouts/Row'
import { ThemedText } from '../../theme/text'
import { ProofGenerationForm } from "../ProofGen/ProofForm";
import { NumberedStep } from "../common/NumberedStep";
import { ProofSettings } from "@components/ProofGen/ProofSettings";
import { REGISTRATION_KEY_FILE_NAME, RemoteProofGenEmailTypes } from "@helpers/constants";
import { PROOF_FORM_TITLE_REGISTRATION_INSTRUCTIONS } from "@helpers/tooltips";
import { reformatProofForChain } from "@helpers/submitProof";
import useSmartContracts from '@hooks/useSmartContracts';
import useRegistration from '@hooks/useRegistration';


interface NewRegistrationProps {
  handleBackClick: () => void;
}
 
export const NewRegistration: React.FC<NewRegistrationProps> = ({
  handleBackClick
}) => {
  /*
   * Context
   */

  const { rampAddress, rampAbi } = useSmartContracts();
  const { refetchRampAccount } = useRegistration();

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
   * State
   */

  const [shouldConfigureRegistrationWrite, setShouldConfigureRegistrationWrite] = useState<boolean>(false);

  /*
    Contract Writes
  */

  //
  // register(uint256[2] memory _a, uint256[2][2] memory _b, uint256[2] memory _c, uint256[msgLen] memory _signals)
  //
  const {
    config: writeSubmitRegistrationConfig
  } = usePrepareContractWrite({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'register',
    args: [
      ...reformatProofForChain(proof),
      publicSignals ? JSON.parse(publicSignals) : null,
    ],
    onError: (error: { message: any }) => {
      console.error(error.message);
    },
    enabled: shouldConfigureRegistrationWrite
  });

  const {
    data: submitRegistrationResult,
    isLoading: isSubmitRegistrationLoading,
    writeAsync: writeSubmitRegistrationAsync
  } = useContractWrite(writeSubmitRegistrationConfig);

  const {
    isLoading: isSubmitRegistrationMining,
    isSuccess: isSubmitRegistrationSuccessful
  } = useWaitForTransaction({
    hash: submitRegistrationResult ? submitRegistrationResult.hash : undefined,
    onSuccess(data) {
      console.log('writeSubmitRegistrationAsync successful: ', data);
      
      refetchRampAccount?.();
    },
  });

  /*
   * Hooks
   */

  useEffect(() => {
    if (proof && publicSignals) {
      // TODO: perform local verification

      setShouldConfigureRegistrationWrite(true);
    } else {
      setShouldConfigureRegistrationWrite(false);
    }
  }, [proof, publicSignals]);

  /*
   * Handlers
   */

  const handleRegistrationSubmit = async () => {
    try {
      await writeSubmitRegistrationAsync?.();
    } catch (error) {
      console.log('writeSubmitRegistrationAsync failed: ', error);
    }
  };

  /*
   * Component
   */

  return (
    <Container>
      <TitleContainer>
        <RowBetween style={{ padding: '0.25rem 0rem 1.5rem 0rem' }}>
          <button
            onClick={handleBackClick}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <StyledArrowLeft/>
          </button>

          <ThemedText.HeadlineSmall style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
            New Registration
          </ThemedText.HeadlineSmall>
        </RowBetween>

        <InstructionsAndTogglesContainer>
          <NumberedStep>
            {PROOF_FORM_TITLE_REGISTRATION_INSTRUCTIONS}
          </NumberedStep>

          <ProofSettings/>
        </InstructionsAndTogglesContainer>
      </TitleContainer>

      <ProofGenerationForm
        circuitType={CircuitType.EMAIL_VENMO_REGISTRATION}
        circuitRemoteFilePath={REGISTRATION_KEY_FILE_NAME}
        circuitInputs={"1"} // Arbitrary value, unused for registration
        remoteProofGenEmailType={RemoteProofGenEmailTypes.REGISTRATION}
        proof={proof}
        publicSignals={publicSignals}
        setProof={setProof}
        setPublicSignals={setPublicSignals}
        isSubmitProcessing={isSubmitRegistrationLoading || isSubmitRegistrationMining}
        isSubmitSuccessful={isSubmitRegistrationSuccessful}
        handleSubmitVerificationClick={handleRegistrationSubmit}
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
