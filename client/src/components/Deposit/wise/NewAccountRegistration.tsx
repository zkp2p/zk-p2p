import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro'
import { ArrowLeft } from 'react-feather';
import Link from '@mui/material/Link';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';

import { RowBetween } from '@components/layouts/Row';
import { NumberedStep } from '@components/common/NumberedStep';
import { NotaryForm } from '@components/Notary/NotaryForm';
import { wiseStrings } from '@helpers/strings';
import { PaymentPlatform, NotaryVerificationCircuit } from '@helpers/types';
import useSmartContracts from '@hooks/useSmartContracts';
import useRegistration from '@hooks/wise/useRegistration';
import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';


interface NewAccountRegistrationProps {
  handleBackClick: () => void;
};

export const NewAccountRegistration: React.FC<NewAccountRegistrationProps> = ({
  handleBackClick
}) => {
  /*
   * Context
   */

  const { wiseRampAddress, wiseRampAbi } = useSmartContracts();
  const { refetchRampAccount } = useRegistration();

  // ----- transaction state -----
  const [verificationSignature, setVerificationSignature] = useState<string>('');
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
  // registerAsOffRamper(IWiseOffRamperRegistrationProcessor.OffRamperRegistrationProof calldata _proof)
  //
  const {
    config: writeSubmitRegistrationConfig
  } = usePrepareContractWrite({
    address: wiseRampAddress,
    abi: wiseRampAbi,
    functionName: 'registerAsOffRamper',
    args: [
      [
        publicSignals,
        verificationSignature
      ]
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
    if (verificationSignature && publicSignals) {
      // TODO: perform local verification

      setShouldConfigureRegistrationWrite(true);
    } else {
      setShouldConfigureRegistrationWrite(false);
    }
  }, [verificationSignature, publicSignals]);

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
            Multi Currency Id Registration
          </ThemedText.HeadlineSmall>

          <div style={{ flex: 0.5 }}/>
        </RowBetween>

        <InstructionsAndTogglesContainer>
          <NumberedStep>
            { wiseStrings.get('PROOF_FORM_TITLE_REGISTRATION_INSTRUCTIONS') }
            <Link
              href={"https://bridge.base.org/deposit"}
              target="_blank">
                Base Bridge ↗
            </Link>
          </NumberedStep>
        </InstructionsAndTogglesContainer>
      </TitleContainer>

      <NotaryForm
        paymentPlatformType={PaymentPlatform.WISE}
        circuitType={NotaryVerificationCircuit.REGISTRATION_MULTICURRENCY_ID}
        verificationSignature={verificationSignature}
        publicSignals={publicSignals}
        setVerificationSignature={setVerificationSignature}
        setPublicSignals={setPublicSignals}
        submitTransactionStatus={submitRegistrationStatus}
        isSubmitMining={isSubmitRegistrationMining}
        isSubmitSuccessful={isSubmitRegistrationSuccessful}
        handleSubmitVerificationClick={handleRegistrationSubmit}
        onVerifyNotarizationCompletion={handleBackClick}
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
