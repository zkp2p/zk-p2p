import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro'
import { ArrowLeft } from 'react-feather';
import { CircuitType } from '@zkp2p/circuits-circom-helpers/generate_input';
import Link from '@mui/material/Link';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';

import { RowBetween } from '@components/layouts/Row';
import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';
import { ProofGenerationForm } from "@components/ProofGen/ProofForm";
import { NumberedStep } from "@components/common/NumberedStep";
import { PaymentPlatform, LoginStatus } from '@helpers/types';
import { REGISTRATION_KEY_FILE_NAME, RemoteProofGenEmailTypes } from "@helpers/constants";
import { garantiStrings, commonStrings } from "@helpers/strings";
import { reformatMultiProofAndSignalsForChain } from "@helpers/submitProof";
import useSmartContracts from '@hooks/useSmartContracts';
import useRegistration from '@hooks/garanti/useRegistration';
import useAccount from '@hooks/useAccount';


interface NewRegistrationProps {
  handleBackClick: () => void;
}

export const NewRegistration: React.FC<NewRegistrationProps> = ({
  handleBackClick
}) => {
  /*
   * Context
   */

  const { garantiRampAddress, garantiRampAbi } = useSmartContracts();
  const { refetchRampAccount } = useRegistration();
  const { loginStatus } = useAccount();

  // ----- transaction state -----
  const [proof, setProof] = useState<string>('');
  const [bodyHashProof, setBodyHashProof] = useState<string>('');
  const [submitRegistrationTransactionHash, setSubmitRegistrationTransactionHash] = useState<string | null>(null);
  // const [proof, setProof] = useState<string>(
  //   JSON.stringify()
  // );

  const [publicSignals, setPublicSignals] = useState<string>('');
  const [bodyHashPublicSignals, setBodyHashPublicSignals] = useState<string>('');
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
  const formattedProofAndSignals = reformatMultiProofAndSignalsForChain(
    proof,
    publicSignals,
    bodyHashProof,
    bodyHashPublicSignals
  );
  const {
    config: writeSubmitRegistrationConfig
  } = usePrepareContractWrite({
    address: garantiRampAddress,
    abi: garantiRampAbi,
    functionName: 'register',
    args: [
      formattedProofAndSignals[0],
      formattedProofAndSignals[1]
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
    onSuccess(data: any) {
      console.log('writeSubmitRegistrationAsync successful: ', data);
      
      refetchRampAccount?.();
    },
  });

  /*
   * Hooks
   */

  useEffect(() => {
    console.log("proof and publicSignals updated");
    if (proof && bodyHashProof && publicSignals && bodyHashPublicSignals) {
      // TODO: perform local verification

      setShouldConfigureRegistrationWrite(true);
    } else {
      setShouldConfigureRegistrationWrite(false);
    }
  }, [proof, publicSignals, bodyHashProof, bodyHashPublicSignals]);

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
            {garantiStrings.get('PROOF_FORM_TITLE_REGISTRATION_INSTRUCTIONS')}
            {loginStatus === LoginStatus.EOA && (
              <>
                {commonStrings.get('NEW_REGISTRATION_ETH_REQUIRED')}
                <Link
                  href={"https://bridge.base.org/deposit"}
                  target="_blank">
                    Base Bridge ↗
                </Link>
              </>
            )}
          </NumberedStep>
        </InstructionsAndTogglesContainer>
      </TitleContainer>

      <ProofGenerationForm
        paymentPlatformType={PaymentPlatform.GARANTI}
        circuitType={CircuitType.EMAIL_VENMO_REGISTRATION}
        circuitRemoteFilePath={REGISTRATION_KEY_FILE_NAME}
        circuitInputs={"1"} // Arbitrary value, unused for registration
        remoteProofGenEmailType={RemoteProofGenEmailTypes.REGISTRATION}
        proof={proof}
        publicSignals={publicSignals}
        setProof={setProof}
        setPublicSignals={setPublicSignals}
        bodyHashProof={bodyHashProof}
        bodyHashPublicSignals={bodyHashPublicSignals}
        setBodyHashProof={setBodyHashProof}
        setBodyHashPublicSignals={setBodyHashPublicSignals}
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
