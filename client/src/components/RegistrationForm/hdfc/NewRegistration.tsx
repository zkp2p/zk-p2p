import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro'
import { ArrowLeft } from 'react-feather';
import { CircuitType } from '@zkp2p/circuits-circom/scripts/generate_input';
import Link from '@mui/material/Link';
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
 } from 'wagmi'

import { RowBetween } from '../../layouts/Row'
import { ThemedText } from '../../../theme/text'
import { ProofGenerationForm } from "../../ProofGen/ProofForm";
import { NumberedStep } from "../../common/NumberedStep";
import { PaymentPlatform } from '../../../contexts/common/PlatformSettings/types';
import { REGISTRATION_KEY_FILE_NAME, RemoteProofGenEmailTypes } from "@helpers/constants";
import { hdfcStrings } from "@helpers/strings";
import { reformatProofForChain } from "@helpers/submitProof";
import useSmartContracts from '@hooks/useSmartContracts';
import useRegistration from '@hooks/hdfc/useHdfcRegistration';


interface NewRegistrationProps {
  handleBackClick: () => void;
}

export const NewRegistration: React.FC<NewRegistrationProps> = ({
  handleBackClick
}) => {
  /*
   * Context
   */

  const { hdfcRampAddress, hdfcRampAbi } = useSmartContracts();
  const { refetchRampAccount } = useRegistration();

  // ----- transaction state -----
  const [proof, setProof] = useState<string>('');
  const [submitRegistrationTransactionHash, setSubmitRegistrationTransactionHash] = useState<string | null>(null);
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
    address: hdfcRampAddress,
    abi: hdfcRampAbi,
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
    status: submitRegistrationStatus,
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

  useEffect(() => {
    if (submitRegistrationResult?.hash) {
      setSubmitRegistrationTransactionHash(submitRegistrationResult.hash);
    }
  }, [submitRegistrationResult])

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
          <div style={{ flex: 0.5 }}>
            <button
              onClick={handleBackClick}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <StyledArrowLeft/>
            </button>
          </div>

          <ThemedText.HeadlineSmall style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
            New Registration
          </ThemedText.HeadlineSmall>

          <div style={{ flex: 0.5 }}/>
        </RowBetween>

        <InstructionsAndTogglesContainer>
          <NumberedStep>
            {hdfcStrings.get('PROOF_FORM_TITLE_REGISTRATION_INSTRUCTIONS')}
            <Link
              href={"https://bridge.base.org/deposit"}
              target="_blank">
                Base Bridge ↗
            </Link>
          </NumberedStep>
        </InstructionsAndTogglesContainer>
      </TitleContainer>

      <ProofGenerationForm
        paymentPlatformType={PaymentPlatform.HDFC}
        circuitType={CircuitType.EMAIL_VENMO_REGISTRATION}
        circuitRemoteFilePath={REGISTRATION_KEY_FILE_NAME}
        circuitInputs={"1"} // Arbitrary value, unused for registration
        remoteProofGenEmailType={RemoteProofGenEmailTypes.REGISTRATION}
        proof={proof}
        publicSignals={publicSignals}
        setProof={setProof}
        setPublicSignals={setPublicSignals}
        submitTransactionStatus={submitRegistrationStatus}
        isSubmitMining={isSubmitRegistrationMining}
        isSubmitSuccessful={isSubmitRegistrationSuccessful}
        handleSubmitVerificationClick={handleRegistrationSubmit}
        onVerifyEmailCompletion={handleBackClick}
        transactionAddress={submitRegistrationTransactionHash}
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
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
