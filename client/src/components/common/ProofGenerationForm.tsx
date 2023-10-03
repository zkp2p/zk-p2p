import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import {
  CircuitType,
  generate_inputs,
  insert13Before10,
  ICircuitInputs
} from '@zkp2p/circuits-circom/scripts/generate_input';

import { Button } from "../Button";
import { Col } from "../legacy/Layout";
import { LabeledTextArea } from '../legacy/LabeledTextArea';
import { ProgressBar } from "../legacy/ProgressBar";
import { NumberedStep } from "./NumberedStep";
import { DragAndDropTextBox } from "./DragAndDropTextBox";
import { LabeledSwitch } from "./LabeledSwitch";

import { downloadProofFiles, generateProof } from "@helpers/zkp";
import useProofGenSettings from '@hooks/useProofGenSettings';
import { processEMLContent } from "@hooks/useDragAndDrop";
import { PLACEHOLDER_EMAIL_BODY, HOSTED_FILES_PATH } from "@helpers/constants";
import { INPUT_MODE_TOOLTIP } from "@helpers/tooltips";


interface ProofGenerationFormProps {
  circuitType: CircuitType;
  circuitRemoteFilePath: string;
  circuitInputs: string;
  setProof: (proof: string) => void;
  setPublicSignals: (publicSignals: string) => void;
}
 
export const ProofGenerationForm: React.FC<ProofGenerationFormProps> = ({
  circuitType,
  circuitRemoteFilePath,
  circuitInputs,
  setProof,
  setPublicSignals,
}) => {
  /*
   * Context
   */
  const { isProvingTypeFast, setIsProvingTypeFast } = useProofGenSettings();
  
  /*
   * State
   */
  const [emailFull, setEmailFull] = useState<string>("");

  const [displayMessage, setDisplayMessage] = useState<string>("Generate Proof");
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  const [status, setStatus] = useState<
    | "not-started"
    | "generating-input"
    | "downloading-proof-files"
    | "generating-proof"
    | "error-bad-input"
    | "error-failed-to-download"
    | "error-failed-to-prove"
    | "done"
    | "sending-on-chain"
    | "sent"
  >("not-started");

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

  var Buffer = require("buffer/").Buffer; // note: the trailing slash is important!

  const isProofGenerationStarted = () => {
    return status !== "not-started";
  };

  /*
   * Handlers
   */
  const handleEmailInputTypeChanged = (checked: boolean) => {
    if (setIsInputModeDrag) {
      setIsInputModeDrag(checked);
    }
  };

  const handleGenerateProofClick = async () => {
    console.log("Generating proof...");
    setDisplayMessage("Generating proof...");
    setStatus("generating-input");

    // console.log("emailFull at handleGenerateProofClick", emailFull);
    const formattedArray = await insert13Before10(Uint8Array.from(Buffer.from(emailFull)));
    // console.log('formattedArray', formattedArray);

    // Due to a quirk in carriage return parsing in JS, we need to manually edit carriage returns to match DKIM parsing
    // console.log("formattedArray", formattedArray);
    // console.log("buffFormArray", Buffer.from(formattedArray.buffer));
    // console.log("buffFormArray", formattedArray.toString());

    console.log("formattedArray", formattedArray)
    console.log("circuitType", circuitType)
    console.log("circuitInputs", circuitInputs)

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
      setDisplayMessage("Prove");
      setStatus("error-bad-input");
      return;
    }

    console.log("Generated input:", JSON.stringify(input));

    /*
      Download proving files
    */
    console.time("zk-dl");
    recordTimeForActivity("startedDownloading");
    setDisplayMessage("Downloading compressed proving files... (this may take a few minutes)");
    setStatus("downloading-proof-files");
    await downloadProofFiles(HOSTED_FILES_PATH, circuitRemoteFilePath, () => {
      setDownloadProgress((p) => p + 1);
    });
    console.timeEnd("zk-dl");
    recordTimeForActivity("finishedDownloading");

    /*
      Generate proof
    */
    console.time("zk-gen");
    recordTimeForActivity("startedProving");
    setDisplayMessage("Generating Proof (this will take 6-10 minutes. Don't close this window)");
    setStatus("generating-proof");
    console.log("Starting proof generation");

    const { proof, publicSignals } = await generateProof(input, circuitRemoteFilePath, HOSTED_FILES_PATH);
    console.log("Finished proof generation");
    console.timeEnd("zk-gen");
    recordTimeForActivity("finishedProving");

    /*
      Set proof
    */
    setProof(JSON.stringify(proof));
    
    /*
      Set public signals
    */
    setPublicSignals(JSON.stringify(publicSignals));

    /*
      Update status and rendering
    */
    if (!input) {
      setStatus("error-failed-to-prove");
      return;
    }
    setDisplayMessage("Finished computing ZK proof");
    setStatus("done");
    try {
      (window as any).cJson = JSON.stringify(input);
      console.log("wrote circuit input to window.cJson. Run copy(cJson)");
    } catch (e) {
      console.error(e);
    }
  };

  /*
    Components
  */
  function ProofGenerationStatus() {
    return (
      <>
        {displayMessage === "Downloading compressed proving files... (this may take a few minutes)" && (
          <ProgressBar
            width={downloadProgress * 10}
            label={`${downloadProgress} / 10 items`}
          />
        )}

        <ProcessStatus status={status}>
          {status !== "not-started" ? (
            <div>
              Status:
              <span data-testid={"status-" + status}>{status}</span>
            </div>
          ) : (
            <div data-testid={"status-" + status}></div>
          )}
          <TimerDisplay timers={stopwatch} />
        </ProcessStatus>
      </>
    );
  }

  return (
    <Container>
      <Body>
        <NumberedStep>
          Open any Venmo transaction email and select 'Show original' to view the full contents. Download and drag
          the .eml file into the box below or paste the contents directly.
        </NumberedStep>

        <TitleRowAndTextAreaContainer>
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
              onFileDrop={(file: File) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  if (e.target) {
                    const rawContent = e.target.result as string;
                    const processedContent = processEMLContent(rawContent);
                    
                    setEmailFull(processedContent);

                    if (setIsInputModeDrag) {
                      setIsInputModeDrag(false);
                    }
                  }
                };
                reader.readAsText(file);
              }}
            />
          ) : (
            <LabeledTextArea
              label=""
              value={emailFull}
              placeholder={PLACEHOLDER_EMAIL_BODY}
              onChange={(e) => {
                setEmailFull(e.currentTarget.value);
              }}
            />
          )}
        </TitleRowAndTextAreaContainer>
        
        <ButtonContainer>
          <Button
            disabled={emailFull.length === 0}
            onClick={handleGenerateProofClick}
          >
            {displayMessage}
          </Button>
        </ButtonContainer>
        
        { isProofGenerationStarted() && <ProofGenerationStatus />}
      </Body>
    </Container>
  );
};

const Container = styled.div`
`;

const Body = styled(Col)`
  gap: 1rem;
`;

const TitleRowAndTextAreaContainer = styled(Col)`
  gap: 0rem;
`;

const ProcessStatus = styled.div<{ status: string }>`
  font-size: 8px;
  padding: 8px;
  border-radius: 16px;
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

const TimerDisplayContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 8px;
`;

const TimerDisplay = ({ timers }: { timers: Record<string, number> }) => {
  return (
    <TimerDisplayContainer>
      {timers["startedDownloading"] && timers["finishedDownloading"] ? (
        <div>
          Zkey Download time:&nbsp;
          <span data-testid="download-time">{timers["finishedDownloading"] - timers["startedDownloading"]}</span>ms
        </div>
      ) : (
        <div></div>
      )}
      {timers["startedProving"] && timers["finishedProving"] ? (
        <div>
          Proof generation time:&nbsp;
          <span data-testid="proof-time">{timers["finishedProving"] - timers["startedProving"]}</span>ms
        </div>
      ) : (
        <div></div>
      )}
    </TimerDisplayContainer>
  );
};
