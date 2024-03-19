import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import crypto from 'crypto';

import { Col } from "@components/legacy/Layout";
import { ValidateNotarization } from '@components/Notary/ValidateNotarization';
import { RequestTable } from '@components/Notary/RequestTable';
import { PaymentPlatformType, PaymentPlatform, NotaryProofInputStatus, NotaryVerificationStatus, NotaryVerificationCircuitTypes } from  "@helpers/types";
import useLocalStorage from '@hooks/useLocalStorage';
import useRegistration from '@hooks/wise/useRegistration';
import useRemoteNotaryVerification from '@hooks/useRemoteNotaryVerification';
import { colors } from '@theme/colors';


interface NotaryFormProps {
  paymentPlatformType: PaymentPlatformType;
  verificationSignature: string;
  publicSignals: string;
  setVerificationSignature: (verificationSignature: string) => void;
  setPublicSignals: (publicSignals: string) => void;
  submitTransactionStatus: string;
  isSubmitMining: boolean;
  isSubmitSuccessful: boolean;
  handleSubmitVerificationClick?: () => void;
  onVerifyNotarizationCompletion?: () => void;
  transactionAddress?: string | null;
}

export const NotaryForm: React.FC<NotaryFormProps> = ({
  paymentPlatformType,
  verificationSignature,
  publicSignals,
  setVerificationSignature,
  setPublicSignals,
  submitTransactionStatus,
  isSubmitMining,
  isSubmitSuccessful,
  handleSubmitVerificationClick,
  onVerifyNotarizationCompletion,
  transactionAddress,
}) => {

  /*
   * Context
   */
  const { setExtractedWiseProfileId } = useRegistration();

  /*
   * State
   */

  const [notarization, setNotarization] = useState<string>("");
  const [notarizationHash, setNotarizationHash] = useState<string>("");

  const [storedProofValue, setStoredProofValue] = useLocalStorage<string>(`${notarizationHash}_PROOF`, '');
  const [storedSignalsValue, setStoredSignalsValue] = useLocalStorage<string>(`${notarizationHash}_SIGNALS`, '');

  const [shouldShowVerificationModal, setShouldShowVerificationModal] = useState<boolean>(false);

  const [notarizationSelectionStatus, setNotarizationSelectionStatus] = useState<string>(NotaryProofInputStatus.DEFAULT);
  const [proofGenStatus, setProofGenStatus] = useState(NotaryVerificationStatus.NOT_STARTED);

  const [verificationFailureErrorCode, setVerificationFailureErrorCode] = useState<number | null>(null);

  /*
   * Hooks
   */

  const {
    data: remoteGenerateProofResponse,
    // loading: isRemoteGenerateProofLoading,
    error: remoteGenerateProofError,
    fetchData: remoteGenerateProof
  } = useRemoteNotaryVerification({
    paymentType: paymentPlatformType,
    circuitType: 'registration_profile_id',
    notarization: notarization,
    intentHash: '0x123',
  });

  useEffect(() => {
    console.log("remoteGenerateProofResponse", remoteGenerateProofResponse);
    
    if (remoteGenerateProofResponse) {
      processRemoteProofGenerationResponse(remoteGenerateProofResponse);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteGenerateProofResponse]);

  useEffect(() => {
    console.log("Status Check", storedProofValue, storedSignalsValue);

    switch (paymentPlatformType) {
      case PaymentPlatform.WISE:
        if (storedProofValue && storedSignalsValue) {
          console.log("Update Proof Gen Status");
          setProofGenStatus(NotaryVerificationStatus.TRANSACTION_CONFIGURED);
        }
        break;
      
      default:
        throw new Error('Invalid platform invoking NotaryForm');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedProofValue, storedSignalsValue]);

  useEffect(() => {
    if (remoteGenerateProofError) {
      setVerificationFailureErrorCode(remoteGenerateProofError.code);

      setProofGenStatus(NotaryVerificationStatus.ERROR_FAILED_TO_PROVE);
    }
  }, [remoteGenerateProofError]);

  useEffect(() => {
    async function locallyVerifyNotarization() {
      if (notarization) {
        const hash = crypto.createHash('sha256');
        hash.update(notarization);
        const hashedNotarization = hash.digest('hex');
        setNotarizationHash(hashedNotarization);

        setNotarizationSelectionStatus(NotaryProofInputStatus.VALID);
      } else {
        setNotarizationHash("");
        setNotarizationSelectionStatus(NotaryProofInputStatus.DEFAULT);
      }
    }
  
    locallyVerifyNotarization();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notarization]);

  useEffect(() => {
    if (storedProofValue && storedSignalsValue) {
      setVerificationSignature(storedProofValue);
      setPublicSignals(storedSignalsValue);
    }
  }, [storedProofValue, storedSignalsValue, setVerificationSignature, setPublicSignals]);

  /*
   * Handlers
   */

  const handleVerifyNotarizationClicked = async () => {
    setShouldShowVerificationModal(true);

    if (storedProofValue && storedSignalsValue) {
      setVerificationSignature(storedProofValue);
      setPublicSignals(storedSignalsValue);

      setProofGenStatus(NotaryVerificationStatus.TRANSACTION_CONFIGURED);
    } else {
      await generateFastProof(remoteGenerateProof);
    }

    const successfulRegistration = false; // circuitType === CircuitType.EMAIL_VENMO_REGISTRATION;
    if (successfulRegistration) {
      cacheWiseTagFromNotarization(notarization);
    }
  };

  const handleModalBackClicked = () => {
    setShouldShowVerificationModal(false);
  };

  /*
   * Helpers
   */

  const getModalCtaTitle = () => {
    return 'Complete Order';
  };

  const cacheWiseTagFromNotarization = (notarization: string) => {
    // no-op: this needs to be injected by extension
  };

  /*
   * Proof Generation
   */

  const generateFastProof = async (callback: any) => {
    setProofGenStatus(NotaryVerificationStatus.UPLOADING_PROOF_FILES)

    await new Promise(resolve => setTimeout(resolve, 1000));

    setProofGenStatus(NotaryVerificationStatus.GENERATING_PROOF);

    console.time("remote-proof-gen");
    await callback();
    console.timeEnd("remote-proof-gen");
  };

  const processRemoteProofGenerationResponse = (response: any, isBodyHashProof: boolean = false) => {
    setAndStoreProvingState(response.proof, response.public_values)
  };

  const setAndStoreProvingState = (
    proofString: string,
    publicSignalsString: string,
  ) => {
    // Generate notarization hash to cache proof and signals
    const hash = crypto.createHash('sha256');
    hash.update(notarization);
    const hashedNotarization = hash.digest('hex');
    setNotarizationHash(hashedNotarization);

    // Set proof and public signals
    setVerificationSignature(proofString);
    setStoredProofValue(proofString);

    setPublicSignals(publicSignalsString);
    setStoredSignalsValue(publicSignalsString);
  };

  /*
   * Components
   */

  return (
    <Container>
      {shouldShowVerificationModal && (
        <ValidateNotarization
          title={"Verify Request"}
          verificationSignature={verificationSignature}
          publicSignals={publicSignals}
          onBackClick={handleModalBackClicked}
          onVerifyNotarizationCompletion={onVerifyNotarizationCompletion}
          status={proofGenStatus}
          circuitType={NotaryVerificationCircuitTypes.REGISTRATION_TAG}
          buttonTitle={getModalCtaTitle()}
          submitTransactionStatus={submitTransactionStatus}
          isSubmitMining={isSubmitMining}
          isSubmitSuccessful={isSubmitSuccessful}
          setProofGenStatus={setProofGenStatus}
          handleSubmitVerificationClick={handleSubmitVerificationClick}
          transactionAddress={transactionAddress}
          verificationFailureErrorCode={verificationFailureErrorCode}
        />
      )}

      <VerticalDivider/>

      <RequestTable
        paymentPlatform={paymentPlatformType}
        setTagNotarization={setNotarization}
        handleVerifyNotarizationClicked={handleVerifyNotarizationClicked}
        notarizationSelectionStatus={notarizationSelectionStatus}
        isProofModalOpen={shouldShowVerificationModal}
      />
    </Container>
  );
};

const Container = styled(Col)`
`;

const VerticalDivider = styled.div`
  height: 24px;
  border-left: 1px solid ${colors.defaultBorderColor};
  margin: 0 auto;
`;
