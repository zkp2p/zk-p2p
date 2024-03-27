import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import crypto from 'crypto';

import { Col } from "@components/legacy/Layout";
import { VerifyNotarizationModal } from '@components/Notary/VerifyNotarizationModal';
import { NotarizationTable } from '@components/Notary/NotarizationTable';
import {
  PaymentPlatformType,
  PaymentPlatform,
  NotaryProofInputStatus,
  NotaryVerificationStatus,
  NotaryVerificationCircuit,
  NotaryVerificationCircuitType,
} from  "@helpers/types";
import useLocalStorage from '@hooks/useLocalStorage';
import useRegistration from '@hooks/wise/useRegistration';
import useRemoteNotaryVerification from '@hooks/useRemoteNotaryVerification';
import { colors } from '@theme/colors';


interface VerifyNotarizationFormProps {
  paymentPlatformType: PaymentPlatformType;
  circuitType: NotaryVerificationCircuitType;
  verifierProof: string;
  publicSignals: string;
  setVerifierProof: (verifierProof: string) => void;
  setPublicSignals: (publicSignals: string) => void;
  submitTransactionStatus: string;
  isSubmitMining: boolean;
  isSubmitSuccessful: boolean;
  handleSubmitVerificationClick?: () => void;
  onVerifyNotarizationCompletion?: () => void;
  transactionAddress?: string | null;
  selectedUIntIntentHash?: string;
}

export const VerifyNotarizationForm: React.FC<VerifyNotarizationFormProps> = ({
  paymentPlatformType,
  circuitType,
  verifierProof,
  publicSignals,
  setVerifierProof,
  setPublicSignals,
  submitTransactionStatus,
  isSubmitMining,
  isSubmitSuccessful,
  handleSubmitVerificationClick,
  onVerifyNotarizationCompletion,
  transactionAddress,
  selectedUIntIntentHash
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

  const [notaryProofSelectionStatus, setnotaryProofSelectionStatus] = useState<string>(NotaryProofInputStatus.DEFAULT);
  const [proofGenStatus, setProofGenStatus] = useState(NotaryVerificationStatus.NOT_STARTED);

  const [verificationFailureErrorCode, setVerificationFailureErrorCode] = useState<number | null>(null);

  /*
   * Hooks
   */

  const {
    data: remoteNotaryVerificationResponse,
    // loading: isRemoteGenerateProofLoading,
    error: remoteGenerateProofError,
    fetchData: remoteGenerateProof
  } = useRemoteNotaryVerification({
    paymentType: paymentPlatformType,
    circuitType: circuitType,
    notarization: notarization,
    intentHash: selectedUIntIntentHash ?? '',
  });

  useEffect(() => {
    // console.log("remoteNotaryVerificationResponse: ", remoteNotaryVerificationResponse);
    
    if (remoteNotaryVerificationResponse) {
      processRemoteProofGenerationResponse(remoteNotaryVerificationResponse);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteNotaryVerificationResponse]);

  useEffect(() => {
    switch (paymentPlatformType) {
      case PaymentPlatform.WISE:
        if (storedProofValue && storedSignalsValue) {
          setProofGenStatus(NotaryVerificationStatus.TRANSACTION_CONFIGURED);
        }
        break;
      
      default:
        throw new Error('Invalid platform invoking VerifyNotarizationForm');
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

        setnotaryProofSelectionStatus(NotaryProofInputStatus.VALID);
      } else {
        setNotarizationHash("");
        setnotaryProofSelectionStatus(NotaryProofInputStatus.DEFAULT);
      }
    }
  
    locallyVerifyNotarization();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notarization]);

  useEffect(() => {
    if (storedProofValue && storedSignalsValue) {
      setVerifierProof(storedProofValue);
      setPublicSignals(storedSignalsValue);
    }
  }, [storedProofValue, storedSignalsValue, setVerifierProof, setPublicSignals]);

  /*
   * Handlers
   */

  const handleVerifyNotaryProofClicked = async () => {
    setShouldShowVerificationModal(true);

    if (storedProofValue && storedSignalsValue) {
      setVerifierProof(storedProofValue);
      setPublicSignals(storedSignalsValue);

      setProofGenStatus(NotaryVerificationStatus.TRANSACTION_CONFIGURED);
    } else {
      await generateFastProof(remoteGenerateProof);
    }

    const isCircuitTypeRegistration = circuitType === NotaryVerificationCircuit.REGISTRATION_TAG;
    if (isCircuitTypeRegistration) {
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
    if (setExtractedWiseProfileId) {
      setExtractedWiseProfileId("@alexanders6341");
    };
  };

  /*
   * Proof Generation
   */

  const generateFastProof = async (callback: any) => {
    setProofGenStatus(NotaryVerificationStatus.UPLOADING_PROOF_FILES)

    await new Promise(resolve => setTimeout(resolve, 250));

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
    setVerifierProof(proofString);
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
        <VerifyNotarizationModal
          title={"Verify Request"}
          verifierProof={verifierProof}
          publicSignals={publicSignals}
          onBackClick={handleModalBackClicked}
          onVerifyNotarizationCompletion={onVerifyNotarizationCompletion}
          status={proofGenStatus}
          circuitType={circuitType}
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

      <NotarizationTable
        paymentPlatform={paymentPlatformType}
        circuitType={circuitType}
        setNotaryProof={setNotarization}
        handleVerifyNotaryProofClicked={handleVerifyNotaryProofClicked}
        notaryProofSelectionStatus={notaryProofSelectionStatus}
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
