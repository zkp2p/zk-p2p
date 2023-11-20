import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  CircuitType,
  generate_inputs,
  insert13Before10,
  ICircuitInputs
} from '@zkp2p/circuits-circom/scripts/generate_input';
import { wrap } from 'comlink';
import * as crypto from 'crypto';

import { Col } from "../legacy/Layout";
import { EmailInputStatus, ProofGenerationStatus } from  "./types";
import { Modal } from '@components/modals/Modal';
import { MailTable } from '@components/ProofGen/MailTable';
import { UploadEmail } from '@components/ProofGen/UploadEmail';
import { dkimVerify } from '@helpers/dkim';
import { HOSTED_FILES_PATH } from "@helpers/constants";
import { downloadProofFiles } from "@helpers/zkp";
import useLocalStorage from '@hooks/useLocalStorage';
import useProofGenSettings from '@hooks/useProofGenSettings';
import useRegistration from '@hooks/useRegistration';
import useRemoteProofGen from '@hooks/useRemoteProofGen';


interface ProofGenerationFormProps {
  circuitType: CircuitType;
  circuitRemoteFilePath: string;
  circuitInputs: string;
  remoteProofGenEmailType: string;
  proof: string;
  publicSignals: string;
  setProof: (proof: string) => void;
  setPublicSignals: (publicSignals: string) => void;
  submitTransactionStatus: string;
  isSubmitMining: boolean;
  isSubmitSuccessful: boolean;
  handleSubmitVerificationClick?: () => void;
  onVerifyEmailCompletion?: () => void;
  transactionAddress?: string | null;
}

export const ProofGenerationForm: React.FC<ProofGenerationFormProps> = ({
  circuitType,
  circuitRemoteFilePath,
  circuitInputs,
  remoteProofGenEmailType,
  proof,
  publicSignals,
  setProof,
  setPublicSignals,
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
  const [storedProofValue, setStoredProofValue] = useLocalStorage<string>(`${emailHash}_PROOF`, "");
  const [storedSignalsValue, setStoredSignalsValue] = useLocalStorage<string>(`${emailHash}_SIGNALS`, "");

  const [shouldShowVerificationModal, setShouldShowVerificationModal] = useState<boolean>(false);

  const [emailInputStatus, setEmailInputStatus] = useState<string>(EmailInputStatus.DEFAULT);
  const [proofGenStatus, setProofGenStatus] = useState(ProofGenerationStatus.NOT_STARTED);

  const [provingFailureErrorCode, setProvingFailureErrorCode] = useState<number | null>(null);
  /*
   * Hooks
   */

  const {
    data: remoteGenerateProofResponse,
    loading: isRemoteGenerateProofLoading,
    error: remoteGenerateProofError,
    fetchData: remoteGenerateProof
  } = useRemoteProofGen({
    emailType: remoteProofGenEmailType,
    emailBody: emailFull,
    intentHash: circuitInputs,
  });

  useEffect(() => {
    if (remoteGenerateProofResponse) {
      processRemoteProofGenerationResponse(remoteGenerateProofResponse);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteGenerateProofResponse]);

  useEffect(() => {
    if (remoteGenerateProofError) {
      setProvingFailureErrorCode(remoteGenerateProofError.code);

      setProofGenStatus(ProofGenerationStatus.ERROR_FAILED_TO_PROVE);
    }
  }, [remoteGenerateProofError]);

  useEffect(() => {
    async function verifyEmail() {
      if (emailFull) {
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

        try {
          await validateDKIMSignature(emailFull);
        } catch (e) {
          setEmailInputStatus(EmailInputStatus.INVALID_SIGNATURE);
          return;
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

    if (storedProofValue && storedSignalsValue) {
      setProof(storedProofValue);
      setPublicSignals(storedSignalsValue);

      setProofGenStatus(ProofGenerationStatus.TRANSACTION_CONFIGURED);
    } else {
      if (isProvingTypeFast) {
        await generateFastProof();
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

  const validateDKIMSignature = async (raw_email: string) => {
    var result, email: Buffer;
    if (typeof raw_email === "string") {
      email = Buffer.from(raw_email);
    } else email = raw_email;

    result = await dkimVerify(email);

    if (!result.results[0]) {
      throw new Error(`No result found on dkim output ${result}`);
    } else {
      if (!result.results[0].publicKey) {
        if (result.results[0].status.message) {
          throw new Error(result.results[0].status.message);
        } else {
          throw new Error(`No public key found on generate_inputs result ${JSON.stringify(result)}`);
        }
      }
    }

    const { status } = result.results[0];
    if (status.result !== "pass") {
      throw new Error(`DKIM verification failed with message: ${status.comment}`);
    }

    return result;
  }

  function validateAndSanitizeEmailSubject(emailContent: string): { sanitizedEmail: string, didSanitize: boolean } {
    const subjectLinePattern = /^Subject:.*$/m;
    const subjectLineMatch = emailContent.match(subjectLinePattern);
    if (!subjectLineMatch) {
      throw new Error('No subject line found in the email content.');
    }
    const subjectLine = subjectLineMatch[0];
  
    const validationPattern = /^Subject:\s*You paid.*\$\d{1,3}(,\d{3})*(\.\d{0,2})?$/;
    const sanitizePattern = /^(Subject:)\s*(.*?)(You paid.*\$\d{1,3}(,\d{3})*(\.\d{0,2})?)$/;
    const needsSanitization = !validationPattern.test(subjectLine);
  
    let sanitizedEmail = emailContent;
    if (needsSanitization) {
      sanitizedEmail = emailContent.replace(subjectLinePattern, subjectLine.replace(sanitizePattern, '$1 $3'));
    }
  
    const didSanitize = sanitizedEmail !== emailContent;
  
    return {
      sanitizedEmail,
      didSanitize
    };
  }

  /*
   * Proof Generation
   */

  const generateFastProof = async () => {
    setProofGenStatus(ProofGenerationStatus.UPLOADING_PROOF_FILES)

    await new Promise(resolve => setTimeout(resolve, 1000))

    setProofGenStatus(ProofGenerationStatus.GENERATING_PROOF);

    console.time("remote-proof-gen");
    await remoteGenerateProof();
    console.timeEnd("remote-proof-gen");
  }

  const processRemoteProofGenerationResponse = (response: any) => {
    setAndStoreProvingState(response.proof, response.public_values)

    setProofGenStatus(ProofGenerationStatus.TRANSACTION_CONFIGURED);
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
    await downloadProofFiles(HOSTED_FILES_PATH, circuitRemoteFilePath, () => {});
    console.timeEnd("download-keys");
  }

  const generateProofWithInputs = async (input: ICircuitInputs) => {
    console.time("client-proof-gen");

    // Create worker and run async
    const worker = new Worker('./ProvingWorker', { name: 'runGenerateProofWorker', type: 'module' })
    const { generateProof } = wrap<import('./ProvingWorker').RunGenerateProofWorker>(worker)
    const { proof, publicSignals } = await generateProof(input, circuitRemoteFilePath);

    console.timeEnd("client-proof-gen");

    return { proof, publicSignals }
  }

  const setAndStoreProvingState = (proof: string, publicSignals: string) => {
    // Generate email hash to cache proof and signals
    const hash = crypto.createHash('sha256');
    hash.update(emailFull);
    const hashedEmail = hash.digest('hex');
    setEmailHash(hashedEmail);

    // Set proof and public signals
    setProof(proof);
    setStoredProofValue(proof);
    setPublicSignals(publicSignals);
    setStoredSignalsValue(publicSignals);
  }

  /*
   * Components
   */

  return (
    <Container>
      {
        shouldShowVerificationModal && (
          <Modal
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
        )
      }

      <VerticalDivider/>

      {
        isEmailModeAuth ? (
          <MailTable
            setEmailFull={setEmailAndToggleInputMode}
            handleVerifyEmailClicked={handleVerifyEmailClicked}
            emailInputStatus={emailInputStatus}
            isProofModalOpen={isRemoteGenerateProofLoading}
          />
        ) : (
          <UploadEmail
            email={emailFull}
            setEmail={setEmailFull}
            handleVerifyEmailClicked={handleVerifyEmailClicked}
            emailInputStatus={emailInputStatus}
            isProofModalOpen={isRemoteGenerateProofLoading}
          />
        )
      }
    </Container>
  );
};

const Container = styled(Col)`
  gap: 1rem;
`;

const VerticalDivider = styled.div`
  height: 24px;
  border-left: 1px solid #98a1c03d;
  margin: 0 auto;
`;
