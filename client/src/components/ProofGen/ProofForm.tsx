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

import { Button } from "../Button";
import { Col } from "../legacy/Layout";
import { LabeledTextArea } from '../legacy/LabeledTextArea';
import { NumberedStep } from "../common/NumberedStep";
import { DragAndDropTextBox } from "../common/DragAndDropTextBox";
import { LabeledSwitch } from "../common/LabeledSwitch";
import { ProofGenerationStatus } from  "./types";
import { Modal } from '@components/modals/Modal';

import { PLACEHOLDER_EMAIL_BODY, HOSTED_FILES_PATH } from "@helpers/constants";
import { INPUT_MODE_TOOLTIP } from "@helpers/tooltips";
import { downloadProofFiles } from "@helpers/zkp";
import useProofGenSettings from '@hooks/useProofGenSettings';
import useRemoteProofGen from '@hooks/useRemoteProofGen';
import useLocalStorage from '@hooks/useLocalStorage';


interface ProofGenerationFormProps {
  instructions: string;
  circuitType: CircuitType;
  circuitRemoteFilePath: string;
  circuitInputs: string;
  remoteProofGenEmailType: string;
  proof: string;
  publicSignals: string;
  setProof: (proof: string) => void;
  setPublicSignals: (publicSignals: string) => void;
  isSubmitProcessing: boolean;
  handleSubmitVerificationClick?: () => void;
}
 
export const ProofGenerationForm: React.FC<ProofGenerationFormProps> = ({
  instructions,
  circuitType,
  circuitRemoteFilePath,
  circuitInputs,
  remoteProofGenEmailType,
  proof,
  publicSignals,
  setProof,
  setPublicSignals,
  isSubmitProcessing,
  handleSubmitVerificationClick
}) => {
  var Buffer = require("buffer/").Buffer; // note: the trailing slash is important!

  /*
   * Context
   */
  const {
    isProvingTypeFast,
    isInputModeDrag,
    setIsInputModeDrag,
  } = useProofGenSettings();
  
  /*
   * State
   */

  const [emailFull, setEmailFull] = useState<string>("");
  const [emailHash, setEmailHash] = useState<string>("");
  const [storedProofValue, setStoredProofValue] = useLocalStorage<string>(`${emailHash}_PROOF`, "");
  const [storedSignalsValue, setStoredSignalsValue] = useLocalStorage<string>(`${emailHash}_SIGNALS`, "");

  const [status, setStatus] = useState<ProofGenerationStatus>("not-started");

  const [shouldShowVerificationModal, setShouldShowVerificationModal] = useState<boolean>(false);

  const [stopwatch, setStopwatch] = useState<Record<string, number>>({
    startedDownloading: 0,
    finishedDownloading: 0,
    startedProving: 0,
    finishedProving: 0,
  });

  const recordTimeForActivity = (activity: string) => {
    setStopwatch((prev) => ({
      ...prev,
      [activity]: Date.now(),
    }));
  };

  /*
   * Hooks
   */

  const {
    data: remoteGenerateProofResponse,
    loading: isRemoteGenerateProofLoading,
    // error: remoteGenerateProofError,
    fetchData: remoteGenerateProof
  } = useRemoteProofGen({
    emailType: remoteProofGenEmailType,
    emailBody: emailFull,
    orderId: circuitInputs,
  });

  useEffect(() => {
    if (remoteGenerateProofResponse) {
      processRemoteProofGenerationResponse(remoteGenerateProofResponse);
    }
  }, [remoteGenerateProofResponse]);

  useEffect(() => {
    if (emailFull) {
      performLocalDKIMVerification()

      const hash = crypto.createHash('sha256');
      hash.update(emailFull);
      const hashedEmail = hash.digest('hex');
      setEmailHash(hashedEmail);
    }
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
      setStatus("done");
    } else {
      if (isProvingTypeFast) {
        await generateFastProof();
      } else {
        await generatePrivateProof();
      }
    }
  };

  const handleModalBackClicked = () => {
    setShouldShowVerificationModal(false);
  };

  const handleEmailInputTypeChanged = (checked: boolean) => {
    if (setIsInputModeDrag) {
      setIsInputModeDrag(checked);
    }
  };

  /*
   * Helpers
   */

  const onFileDrop = async (file: File) => {
    if (file.name.endsWith(".eml")) {
      const content = await file.text();
      setEmailFull(content);

      if (setIsInputModeDrag) {
        setIsInputModeDrag(false);
      }
    } else {
      alert("Only .eml files are allowed.");
    }
  };

  const getModalCtaTitle = () => {
    switch (circuitType) {
      case (CircuitType.EMAIL_VENMO_REGISTRATION):
        return 'Complete Registration';
      
      case (CircuitType.EMAIL_VENMO_RECEIVE):
      case (CircuitType.EMAIL_VENMO_SEND):
      default:
        return 'Complete Ramp';
    }
  };

  /*
   * Proof Generation
   */

  const performLocalDKIMVerification = () => {
    // TODO: perform local verification of emails, everything before downloading files

    // no-op
  }

  const generateFastProof = async () => {
    setStatus("generating-proof");

    console.time("zk-gen");
    recordTimeForActivity("startedProving");

    await remoteGenerateProof();  
    
    console.timeEnd("zk-gen");
    recordTimeForActivity("finishedProving");
  }

  const processRemoteProofGenerationResponse = (response: any) => {
    setStatus("verifying-proof");

    setAndStoreProvingState(response.proof, response.public_values)

    setStatus("done");
    console.log(stopwatch);
  }

  const generatePrivateProof = async () => {
    setStatus("generating-input");

    let input: ICircuitInputs | undefined;
    input = await generateCircuitInputs();
    if (!input) {
      setStatus("error-bad-input");
      return;
    }

    setStatus("downloading-proof-files");
    await downloadingProvingKeys();

    setStatus("generating-proof");
    const { proof, publicSignals } = await generateProofWithInputs(input);
    if (!proof || !publicSignals) {
      setStatus("error-failed-to-prove");
      return;
    }

    const stringifiedProof = JSON.stringify(proof);
    const stringifiedSignals = JSON.stringify(publicSignals);
    setAndStoreProvingState(stringifiedProof, stringifiedSignals);

    setStatus("done");
    console.log(stopwatch);
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

  const downloadingProvingKeys = async () => {
    console.time("zk-dl");

    recordTimeForActivity("startedDownloading");

    await downloadProofFiles(HOSTED_FILES_PATH, circuitRemoteFilePath, () => {});

    console.timeEnd("zk-dl");
    recordTimeForActivity("finishedDownloading");
  }

  const generateProofWithInputs = async (input: ICircuitInputs) => {
    console.time("zk-gen");
    recordTimeForActivity("startedProving");

    // Create worker and run async
    const worker = new Worker('./ProvingWorker', { name: 'runGenerateProofWorker', type: 'module' })
    const { generateProof } = wrap<import('./ProvingWorker').RunGenerateProofWorker>(worker)
    const { proof, publicSignals } = await generateProof(input, circuitRemoteFilePath);

    console.timeEnd("zk-gen");
    recordTimeForActivity("finishedProving");

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
            status={status}
            buttonTitle={getModalCtaTitle()}
            isSubmitProcessing={isSubmitProcessing}
            handleSubmitVerificationClick={handleSubmitVerificationClick} />
        ) 
      }

      <NumberedStep>
        {instructions}
      </NumberedStep>

      <EmailTitleRowAndTextAreaContainer>
        <TitleAndEmailSwitchRowContainer>
          Email
          <LabeledSwitch
            switchChecked={isInputModeDrag ?? true}
            onSwitchChange={handleEmailInputTypeChanged}
            checkedLabel={"Drag"}
            uncheckedLabel={"Paste"}
            helperText={INPUT_MODE_TOOLTIP}
          />
        </TitleAndEmailSwitchRowContainer>

        {isInputModeDrag ? (
          <DragAndDropTextBox
            onFileDrop={onFileDrop}
          />
        ) : (
          <LabeledTextArea
            label=""
            value={emailFull}
            placeholder={PLACEHOLDER_EMAIL_BODY}
            onChange={(e) => {
              setEmailFull(e.currentTarget.value);
            }}
            height={"28vh"}
          />
        )}
      </EmailTitleRowAndTextAreaContainer>
      
      <ButtonContainer>
        <Button
          disabled={emailFull.length === 0}
          loading={isRemoteGenerateProofLoading}
          onClick={handleVerifyEmailClicked}
        >
          Verify Email
        </Button>
      </ButtonContainer>
    </Container>
  );
};

const Container = styled(Col)`
  gap: 1rem;
`;

const EmailTitleRowAndTextAreaContainer = styled(Col)`
  gap: 0.25rem;
`;

const ButtonContainer = styled.div`
  display: grid;
  padding-top: 1rem;
`;

const TitleAndEmailSwitchRowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 8px;
`;
