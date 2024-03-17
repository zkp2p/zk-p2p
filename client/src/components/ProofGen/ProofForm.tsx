import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  CircuitType,
  generate_inputs,
  insert13Before10,
  ICircuitInputs
} from '@zkp2p/circuits-circom-helpers/generate_input';
// import { wrap } from 'comlink';
import crypto from 'crypto';

import { Col } from "@components/legacy/Layout";
import { EmailInputStatus, ProofGenerationStatus } from  "@helpers/types";
import { ValidateEmail } from '@components/modals/ValidateEmail';
import { MailTable } from '@components/ProofGen/MailTable';
import { UploadEmail } from '@components/ProofGen/UploadEmail';
// import { HOSTED_FILES_PATH } from "@helpers/constants";
// import { downloadProofFiles } from "@helpers/zkp";
import { PaymentPlatformType, PaymentPlatform } from '@helpers/types';
import {
  validateAndSanitizeEmailSubject,
  validateEmailDomainKey,
  validateDKIMSignature as validateVenmoDKIMSignature
} from '@components/ProofGen/validation/venmo';
import {
  validateDKIMSignature as validateHdfcDKIMSignature,
  sanitizeAndProcessHdfcEmailSubject
} from '@components/ProofGen/validation/hdfc';
import {
  validateDKIMSignature as validateGarantiDKIMSignature,
  sanitizeAndProcessGarantiEmailSubject
} from '@components/ProofGen/validation/garanti';
import useLocalStorage from '@hooks/useLocalStorage';
import useProofGenSettings from '@hooks/useProofGenSettings';
import useRegistration from '@hooks/venmo/useRegistration';
import useRemoteProofGen from '@hooks/useRemoteProofGen';
import { colors } from '@theme/colors';


interface ProofGenerationFormProps {
  paymentPlatformType: PaymentPlatformType;
  circuitType: CircuitType;
  circuitRemoteFilePath: string;
  circuitInputs: string;
  remoteProofGenEmailType: string;
  proof: string;
  publicSignals: string;
  setProof: (proof: string) => void;
  setPublicSignals: (publicSignals: string) => void;
  bodyHashProof: string;
  bodyHashPublicSignals: string;
  setBodyHashProof: (proof: string) => void;
  setBodyHashPublicSignals: (publicSignals: string) => void;
  submitTransactionStatus: string;
  isSubmitMining: boolean;
  isSubmitSuccessful: boolean;
  handleSubmitVerificationClick?: () => void;
  onVerifyEmailCompletion?: () => void;
  transactionAddress?: string | null;
}

export const ProofGenerationForm: React.FC<ProofGenerationFormProps> = ({
  paymentPlatformType,
  circuitType,
  circuitRemoteFilePath,
  circuitInputs,
  remoteProofGenEmailType,
  proof,
  publicSignals,
  setProof,
  setPublicSignals,
  bodyHashProof,
  bodyHashPublicSignals,
  setBodyHashProof,
  setBodyHashPublicSignals,
  submitTransactionStatus,
  isSubmitMining,
  isSubmitSuccessful,
  handleSubmitVerificationClick,
  onVerifyEmailCompletion,
  transactionAddress,
}) => {
  var Buffer = require("buffer/").Buffer; // note: the trailing slash is important!

  /*
   * Context
   */
  const {
    isProvingTypeFast,
    setIsInputModeDrag,
    isEmailModeAuth,
  } = useProofGenSettings();
  const { setExtractedVenmoId } = useRegistration();

  /*
   * State
   */

  const [emailFull, setEmailFull] = useState<string>("");

  const [emailHash, setEmailHash] = useState<string>("");
  const [storedProofValue, setStoredProofValue] = useLocalStorage<string>(`${emailHash}_PROOF`, '');
  const [storedSignalsValue, setStoredSignalsValue] = useLocalStorage<string>(`${emailHash}_SIGNALS`, '');
  const [storedBodyHashProofValue, setStoredBodyHashProofValue] = useLocalStorage<string>(`${emailHash}_BODY_PROOF`, '');
  const [storedBodyHashSignalsValue, setStoredBodyHashSignalsValue] = useLocalStorage<string>(`${emailHash}_BODY_SIGNALS`, '');

  const [shouldShowVerificationModal, setShouldShowVerificationModal] = useState<boolean>(false);

  const [emailInputStatus, setEmailInputStatus] = useState<string>(EmailInputStatus.DEFAULT);
  const [proofGenStatus, setProofGenStatus] = useState(ProofGenerationStatus.NOT_STARTED);

  const [provingFailureErrorCode, setProvingFailureErrorCode] = useState<number | null>(null);

  /*
   * Hooks
   */

  const {
    data: remoteGenerateProofResponse,
    // loading: isRemoteGenerateProofLoading,
    error: remoteGenerateProofError,
    fetchData: remoteGenerateProof
  } = useRemoteProofGen({
    paymentType: paymentPlatformType,
    circuitType: remoteProofGenEmailType,
    emailBody: emailFull,
    intentHash: circuitInputs,
  });

  const {
    data: remoteBodyHashProofResponse,
    // loading: isRemoteGenerateBodyHashProofLoading,
    error: remoteBodyHashProofError,
    fetchData: remoteGenerateBodyHashProof
  } = useRemoteProofGen({
    paymentType: paymentPlatformType,
    circuitType: "body_suffix_hasher",
    emailBody: emailFull,
    intentHash: circuitInputs,
  });

  useEffect(() => {
    console.log("remoteGenerateProofResponse", remoteGenerateProofResponse);
    if (remoteGenerateProofResponse) {
      processRemoteProofGenerationResponse(remoteGenerateProofResponse);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteGenerateProofResponse]);

  useEffect(() => {
    console.log("remoteBodyHashProofResponse", remoteBodyHashProofResponse);
    if (remoteBodyHashProofResponse) {
      processRemoteProofGenerationResponse(remoteBodyHashProofResponse, true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteBodyHashProofResponse]);

  useEffect(() => {
    console.log("Status Check", storedBodyHashProofValue, storedBodyHashSignalsValue, storedProofValue, storedSignalsValue);
    switch (paymentPlatformType) {
      case PaymentPlatform.VENMO:
        if (storedProofValue && storedSignalsValue) {
          console.log("Update Proof Gen Status");
          setProofGenStatus(ProofGenerationStatus.TRANSACTION_CONFIGURED);
        }
        break;

      case PaymentPlatform.HDFC:
        if (storedProofValue && storedSignalsValue) {
          console.log("Update Proof Gen Status");
          setProofGenStatus(ProofGenerationStatus.TRANSACTION_CONFIGURED);
        }
        break;

      case PaymentPlatform.GARANTI:
        if (storedBodyHashProofValue && storedBodyHashSignalsValue && storedProofValue && storedSignalsValue) {
          console.log("Update Proof Gen Status");
          setProofGenStatus(ProofGenerationStatus.TRANSACTION_CONFIGURED);
        }
        break;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedBodyHashProofValue, storedBodyHashSignalsValue, storedProofValue, storedSignalsValue]);

  useEffect(() => {
    if (remoteGenerateProofError) {
      setProvingFailureErrorCode(remoteGenerateProofError.code);

      setProofGenStatus(ProofGenerationStatus.ERROR_FAILED_TO_PROVE);
    }
  }, [remoteGenerateProofError, remoteBodyHashProofError]);

  useEffect(() => {
    async function verifyEmail() {
      if (emailFull) {
        switch (paymentPlatformType) {
          case PaymentPlatform.VENMO:
            // validateAndSanitizeEmailSubject
            try {
              const { sanitizedEmail, didSanitize } = validateAndSanitizeEmailSubject(emailFull);
    
              if (didSanitize) {
                setEmailFull(sanitizedEmail);
                return;
              };
            } catch (e) {
              setEmailInputStatus(EmailInputStatus.INVALID_SUBJECT);
              return;
            }
    
            // validateEmailDomainKey
            try {
              const emailReceivedYear = validateEmailDomainKey(emailFull);
    
              if (emailReceivedYear.emailRaw !== "2024" && emailReceivedYear.emailRaw !== "2023") {
                setEmailInputStatus(EmailInputStatus.INVALID_DOMAIN_KEY);
                return;
              }
            } catch (e) {
              setEmailInputStatus(EmailInputStatus.INVALID_SIGNATURE);
              return;
            }
    
            // validateVenmoDKIMSignature
            try {
              await validateVenmoDKIMSignature(emailFull);
            } catch (e) {
              setEmailInputStatus(EmailInputStatus.INVALID_SIGNATURE);
              return;
            }
            break;

          case PaymentPlatform.HDFC:
            // sanitizeAndProcessHdfcEmailSubject
            try {
              const { processedEmail, didSanitize } = sanitizeAndProcessHdfcEmailSubject(emailFull);
    
              if (didSanitize) {
                setEmailFull(processedEmail);
                return;
              };
            } catch (e) {
              setEmailInputStatus(EmailInputStatus.INVALID_SUBJECT);
              return;
            }

            // validateHdfcDKIMSignature
            try {
              await validateHdfcDKIMSignature(emailFull);
            } catch (e) {
              setEmailInputStatus(EmailInputStatus.INVALID_SIGNATURE);
              return;
            }
            break;

          case PaymentPlatform.GARANTI:
            try {
              const { processedEmail, didSanitize } = sanitizeAndProcessGarantiEmailSubject(emailFull);
              if (didSanitize) {
                setEmailFull(processedEmail);
                return;
              };
            } catch (e) {
              setEmailInputStatus(EmailInputStatus.INVALID_SUBJECT);
              return;
            }

            try {
              await validateGarantiDKIMSignature(emailFull);
            } catch (e) {
              console.log(e);
              setEmailInputStatus(EmailInputStatus.INVALID_SIGNATURE);
              return;
            }
            break;
        }
  
        const hash = crypto.createHash('sha256');
        hash.update(emailFull);
        const hashedEmail = hash.digest('hex');
        setEmailHash(hashedEmail);

        setEmailInputStatus(EmailInputStatus.VALID);
      } else {
        setEmailHash("");
        setEmailInputStatus(EmailInputStatus.DEFAULT);
      }
    }
  
    verifyEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailFull]);

  useEffect(() => {
    if (storedProofValue && storedSignalsValue) {
      setProof(storedProofValue);
      setPublicSignals(storedSignalsValue);
    }
  }, [storedProofValue, storedSignalsValue, setProof, setPublicSignals]);

  /*
   * Handlers
   */

  const handleVerifyEmailClicked = async () => {
    setShouldShowVerificationModal(true);

    if (storedProofValue && storedSignalsValue && storedBodyHashProofValue && storedBodyHashSignalsValue) {
      setProof(storedProofValue);
      setPublicSignals(storedSignalsValue);
      setBodyHashProof(storedBodyHashProofValue);
      setBodyHashPublicSignals(storedBodyHashSignalsValue);

      setProofGenStatus(ProofGenerationStatus.TRANSACTION_CONFIGURED);
    } else {
      if (isProvingTypeFast) {
        if (paymentPlatformType === PaymentPlatform.GARANTI) {
          await Promise.all([
            generateFastProof(remoteGenerateProof),
            generateFastProof(remoteGenerateBodyHashProof),
          ]);
        } else {
          await generateFastProof(remoteGenerateProof);
        }
      } else {
        await generatePrivateProof();
      }
    }

    const successfulRegistration = circuitType === CircuitType.EMAIL_VENMO_REGISTRATION;
    if (successfulRegistration) {
      extractAndRecordVenmoId(emailFull);
    }
  };

  const handleModalBackClicked = () => {
    setShouldShowVerificationModal(false);
  };

  /*
   * Helpers
   */

  const getModalCtaTitle = () => {
    switch (circuitType) {
      case (CircuitType.EMAIL_VENMO_REGISTRATION):
        return 'Complete Registration';

      case (CircuitType.EMAIL_VENMO_SEND):
      default:
        return 'Complete Order';
    }
  };

  const extractAndRecordVenmoId = (email: string) => {
    let actorId: string | null = null;

    const regex = /actor_id=3D(\d{17,})/;
    const match = email.match(regex);

    if (setExtractedVenmoId && match && match[1]) {
        actorId = match[1];

        setExtractedVenmoId(actorId);
    } else {
        console.log("No actor ID found.");
    }
  };

  const setEmailAndToggleInputMode = (email: string) => {
    setEmailFull(email);

    if (setIsInputModeDrag) {
      setIsInputModeDrag(false);
    }
  };

  /*
   * Proof Generation
   */

  const generateFastProof = async (callback: any) => {
    setProofGenStatus(ProofGenerationStatus.UPLOADING_PROOF_FILES)

    await new Promise(resolve => setTimeout(resolve, 1000))

    setProofGenStatus(ProofGenerationStatus.GENERATING_PROOF);

    console.time("remote-proof-gen");
    await callback();
    console.timeEnd("remote-proof-gen");
  }

  const processRemoteProofGenerationResponse = (response: any, isBodyHashProof: boolean = false) => {
    setAndStoreProvingState(response.proof, response.public_values, isBodyHashProof)
  }

  const generatePrivateProof = async () => {
    setProofGenStatus(ProofGenerationStatus.GENERATING_INPUT);

    let input: ICircuitInputs | undefined;
    input = await generateCircuitInputs();
    if (!input) {
      setProofGenStatus(ProofGenerationStatus.ERROR_BAD_INPUT);
      return;
    }

    setProofGenStatus(ProofGenerationStatus.DOWNLOADING_PROOF_FILES);
    await downloadProvingKeys();

    setProofGenStatus(ProofGenerationStatus.GENERATING_PROOF);
    const { proof, publicSignals } = await generateProofWithInputs(input);
    if (!proof || !publicSignals) {
      setProofGenStatus(ProofGenerationStatus.ERROR_FAILED_TO_PROVE);
      return;
    }

    const stringifiedProof = JSON.stringify(proof);
    const stringifiedSignals = JSON.stringify(publicSignals);
    setAndStoreProvingState(stringifiedProof, stringifiedSignals);

    setProofGenStatus(ProofGenerationStatus.TRANSACTION_CONFIGURED);
  }

  const generateCircuitInputs = async () => {
    const formattedArray = await insert13Before10(Uint8Array.from(Buffer.from(emailFull)));

    // Due to a quirk in carriage return parsing in JS, we need to manually edit carriage returns to match DKIM parsing
    // console.log("formattedArray", formattedArray)
    // console.log("circuitType", circuitType)
    // console.log("circuitInputs", circuitInputs)

    let input: ICircuitInputs;
    try {
      input = await generate_inputs(
        Buffer.from(formattedArray.buffer),
        circuitType,
        circuitInputs,
        "1", // Nonce, used for server side proving
      );
    } catch (e) {
      console.log("Error generating input", e);
      return undefined;
    }

    console.log("Generated input:", JSON.stringify(input));

    return input;
  }

  const downloadProvingKeys = async () => {
    console.time("download-keys");
    // await downloadProofFiles(HOSTED_FILES_PATH, circuitRemoteFilePath, () => {});
    console.timeEnd("download-keys");
  }

  const generateProofWithInputs = async (input: ICircuitInputs) => {
    console.time("client-proof-gen");

    // Create worker and run async
    // const worker = new Worker('./ProvingWorker', { name: 'runGenerateProofWorker', type: 'module' })
    // const { generateProof } = wrap<import('./ProvingWorker').RunGenerateProofWorker>(worker)
    // const { proof, publicSignals } = await generateProof(input, circuitRemoteFilePath);

    console.timeEnd("client-proof-gen");

    return { proof, publicSignals }
  }

  const setAndStoreProvingState = (
    proofString: string,
    publicSignalsString: string,
    isBodyHashProof: boolean = false
  ) => {
    // Generate email hash to cache proof and signals
    const hash = crypto.createHash('sha256');
    hash.update(emailFull);
    const hashedEmail = hash.digest('hex');
    setEmailHash(hashedEmail);

    // Set proof and public signals
    if (isBodyHashProof) {
      setBodyHashProof(proofString);
      setStoredBodyHashProofValue(proofString);

      setBodyHashPublicSignals(publicSignalsString);
      setStoredBodyHashSignalsValue(publicSignalsString);
    } else {
      setProof(proofString);
      setStoredProofValue(proofString);

      setPublicSignals(publicSignalsString);
      setStoredSignalsValue(publicSignalsString);
    }
  }

  /*
   * Components
   */

  return (
    <Container>
      {shouldShowVerificationModal && (
        <ValidateEmail
          title={"Verify Email"}
          proof={proof}
          publicSignals={publicSignals}
          onBackClick={handleModalBackClicked}
          onVerifyEmailCompletion={onVerifyEmailCompletion}
          status={proofGenStatus}
          circuitType={circuitType}
          buttonTitle={getModalCtaTitle()}
          submitTransactionStatus={submitTransactionStatus}
          isSubmitMining={isSubmitMining}
          isSubmitSuccessful={isSubmitSuccessful}
          setProofGenStatus={setProofGenStatus}
          handleSubmitVerificationClick={handleSubmitVerificationClick}
          transactionAddress={transactionAddress}
          provingFailureErrorCode={provingFailureErrorCode}
        />
      )}

      <VerticalDivider/>

      {isEmailModeAuth ? (
        <MailTable
          paymentPlatform={paymentPlatformType}
          setEmailFull={setEmailAndToggleInputMode}
          handleVerifyEmailClicked={handleVerifyEmailClicked}
          emailInputStatus={emailInputStatus}
          isProofModalOpen={shouldShowVerificationModal}
        />
      ) : (
        <UploadEmail
          paymentPlatform={paymentPlatformType}
          email={emailFull}
          setEmail={setEmailFull}
          handleVerifyEmailClicked={handleVerifyEmailClicked}
          emailInputStatus={emailInputStatus}
          isProofModalOpen={shouldShowVerificationModal}
        />
      )}
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
