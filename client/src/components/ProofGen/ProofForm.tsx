import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  CircuitType,
  generate_inputs,
  insert13Before10,
  ICircuitInputs
} from '@zkp2p/circuits-circom/scripts/generate_input';
import { wrap } from 'comlink';

import { Button } from "../Button";
import { Col } from "../legacy/Layout";
import { LabeledTextArea } from '../legacy/LabeledTextArea';
// import { ProgressBar } from "../legacy/ProgressBar";
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


interface ProofGenerationFormProps {
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

  // const [downloadProgress, setDownloadProgress] = useState<number>(0);

  const [status, setStatus] = useState<ProofGenerationStatus>("not-started");

  const [shouldShowVerificationModal, setShouldShowVerificationModal] = useState<boolean>(false);

  // const [stopwatch, setStopwatch] = useState<Record<string, number>>({
  //   startedDownloading: 0,
  //   finishedDownloading: 0,
  //   startedProving: 0,
  //   finishedProving: 0,
  // });

  // const recordTimeForActivity = (activity: string) => {
  //   setStopwatch((prev) => ({
  //     ...prev,
  //     [activity]: Date.now(),
  //   }));
  // };

  var Buffer = require("buffer/").Buffer; // note: the trailing slash is important!

  // const isProofGenerationStarted = () => {
  //   return status !== "not-started";
  // };

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
      console.log('Data:', remoteGenerateProofResponse);
      setStatus("verifying-proof");

      setProof(remoteGenerateProofResponse.proof);
      setPublicSignals(remoteGenerateProofResponse.public_values);

      setStatus("done");
    }
  }, [remoteGenerateProofResponse, setProof, setPublicSignals]);

  /*
   * Handlers
   */

  const handleVerifyEmailClicked = () => {
    // TODO: perform local verification of emails, everything before downloading files

    setShouldShowVerificationModal(true);

    if (isProvingTypeFast) {
      console.log('Generating fast proof...');
      remoteGenerateProof()
      setStatus("generating-proof");
    } else {
      console.log('Generating private proof...');
      handleGenerateProofClick();
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

  const handleGenerateProofClick = async () => {
    console.log("Generating proof...");
    setStatus("generating-input");

    // console.log("emailFull at handleGenerateProofClick", emailFull);
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
      setStatus("error-bad-input");
      return;
    }

    console.log("Generated input:", JSON.stringify(input));

    /*
     * Download proving files
     */
    console.time("zk-dl");
    // recordTimeForActivity("startedDownloading");
    setStatus("downloading-proof-files");
    await downloadProofFiles(HOSTED_FILES_PATH, circuitRemoteFilePath, () => {
      // no-op

      // setDownloadProgress((p) => p + 1);
    });
    console.timeEnd("zk-dl");
    // recordTimeForActivity("finishedDownloading");

    /*
     * Generate proof
     */
    console.time("zk-gen");
    // recordTimeForActivity("startedProving");
    setStatus("generating-proof");
    console.log("Starting proof generation");

    const worker = new Worker('./ProvingWorker', { name: 'runGenerateProofWorker', type: 'module' })
    const { generateProof } = wrap<import('./ProvingWorker').RunGenerateProofWorker>(worker)
    const { proof, publicSignals } = await generateProof(input, circuitRemoteFilePath);

    console.log("Finished proof generation");
    console.timeEnd("zk-gen");
    // recordTimeForActivity("finishedProving");

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
    setStatus("done");
    try {
      (window as any).cJson = JSON.stringify(input);
      console.log("wrote circuit input to window.cJson. Run copy(cJson)");
    } catch (e) {
      console.error(e);
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

  /*
   * Components
   */

  // function ProofGenerationStatus() {
  //   return (
  //     <>
  //       {displayMessage === "Downloading compressed proving files... (this may take a few minutes)" && (
  //         <ProgressBar
  //           width={downloadProgress * 10}
  //           label={`${downloadProgress} / 10 items`}
  //         />
  //       )}

  //       <ProcessStatus status={status}>
  //         {status !== "not-started" ? (
  //           <div>
  //             Status:
  //             <span data-testid={"status-" + status}>{status}</span>
  //           </div>
  //         ) : (
  //           <div data-testid={"status-" + status}></div>
  //         )}
  //         <TimerDisplay timers={stopwatch} />
  //       </ProcessStatus>
  //     </>
  //   );
  // }

  return (
    <Container>
      {
        shouldShowVerificationModal && (
          <Modal
            title={"Verify Email"}
            proof={proof}
            publicSignals={publicSignals}
            status={status}
            onBackClick={handleModalBackClicked}
            isSubmitProcessing={isSubmitProcessing}
            handleSubmitVerificationClick={handleSubmitVerificationClick} />
        ) 
      }

      <NumberedStep>
        Open any Venmo transaction email and select 'Show original' to view the full contents. Download and drag
        the .eml file into the box below or paste the contents directly.
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
      
      {/* { isProofGenerationStarted() && <ProofGenerationStatus />} */}
    </Container>
  );
};

const Container = styled(Col)`
  gap: 1rem;
`;

const EmailTitleRowAndTextAreaContainer = styled(Col)`
  gap: 0.25rem;
`;

// const ProcessStatus = styled.div<{ status: string }>`
//   font-size: 8px;
//   padding: 8px;
//   border-radius: 16px;
// `;

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

// const TimerDisplayContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   font-size: 8px;
// `;

// const TimerDisplay = ({ timers }: { timers: Record<string, number> }) => {
//   return (
//     <TimerDisplayContainer>
//       {timers["startedDownloading"] && timers["finishedDownloading"] ? (
//         <div>
//           Zkey Download time:&nbsp;
//           <span data-testid="download-time">{timers["finishedDownloading"] - timers["startedDownloading"]}</span>ms
//         </div>
//       ) : (
//         <div></div>
//       )}
//       {timers["startedProving"] && timers["finishedProving"] ? (
//         <div>
//           Proof generation time:&nbsp;
//           <span data-testid="proof-time">{timers["finishedProving"] - timers["startedProving"]}</span>ms
//         </div>
//       ) : (
//         <div></div>
//       )}
//     </TimerDisplayContainer>
//   );
// };
