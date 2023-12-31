import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Link from '@mui/material/Link';
import { Paperclip } from 'react-feather';

import { Button } from "@components/Button";
import { Col } from "@components/legacy/Layout";
import { LabeledTextArea } from '@components/legacy/LabeledTextArea';
import { DragAndDropTextBox } from "@components/common/DragAndDropTextBox";
import { LabeledSwitch } from "@components/common/LabeledSwitch";
import { NumberedStep } from "@components/common/NumberedStep";
import { TextButton } from '@components/common/TextButton';
import { EmailInputStatus } from  "@helpers/types/proofGeneration";
import { commonStrings } from "@helpers/strings";
import { PLACEHOLDER_EMAIL_BODY } from "@helpers/placeholderEmailBody";
import {
  DOWNLOAD_AND_UPLOAD_EMAIL_INSTRUCTIONS_DOCS_LINK, 
  COPY_AND_PASTE_EMAIL_INSTRUCTIONS_DOCS_LINK 
} from "@helpers/docUrls";
import useProofGenSettings from '@hooks/useProofGenSettings';
import { useFileBrowser } from '@hooks/useFileBrowser';
import { ThemedText } from '@theme/text';


interface UploadEmailProps {
  email: string;
  setEmail: (email: string) => void;
  handleVerifyEmailClicked: () => void;
  emailInputStatus: string;
  isProofModalOpen: boolean;
}

export const UploadEmail: React.FC<UploadEmailProps> = ({
  email,
  setEmail,
  handleVerifyEmailClicked,
  emailInputStatus,
  isProofModalOpen,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  /*
   * Context
   */

  const {
    isInputModeDrag,
    setIsInputModeDrag,
    setIsEmailModeAuth,
  } = useProofGenSettings();

  const { openFileDialog } = useFileBrowser();

  /*
   * State
   */

  const [ctaButtonTitle, setCtaButtonTitle] = useState<string>("");

  /*
   * Handlers
   */

  const handleEmailInputTypeChanged = (checked: boolean) => {
    if (setIsInputModeDrag) {
      setIsInputModeDrag(checked);
    }
  };

  const handleEmailModeChanged = (checked: boolean) => {
    if (setIsEmailModeAuth) {
      setIsEmailModeAuth(checked);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith(".eml")) {
        const content = await file.text();
        
        setEmailAndToggleInputMode(content);
      } else {
        alert("Only .eml files are allowed.");
      }
    }
  };

  /*
   * Hooks
   */

  useEffect(() => {
    switch (emailInputStatus) {
      case EmailInputStatus.DEFAULT:
        setCtaButtonTitle("Input email");
        break;
      
      case EmailInputStatus.INVALID_SIGNATURE:
        setCtaButtonTitle("Invalid email: must be from Venmo");
        break;

      case EmailInputStatus.INVALID_SUBJECT:
        setCtaButtonTitle("Invalid email: must contain 'You Paid'");
        break;

      case EmailInputStatus.INVALID_DOMAIN_KEY:
        setCtaButtonTitle("Invalid email: must be from 2023");
        break;

      case EmailInputStatus.VALID:
      default:
        setCtaButtonTitle("Validate Email");
        break;
    }

  }, [emailInputStatus]);

  /*
   * Helpers
   */

  const onFileDrop = async (file: File) => {
    if (file.name.endsWith(".eml")) {
      const content = await file.text();

      setEmailAndToggleInputMode(content);
    } else {
      alert("Only .eml files are allowed.");
    }
  };

  const setEmailAndToggleInputMode = (email: string) => {
    setEmail(email);

    if (setIsInputModeDrag) {
      setIsInputModeDrag(false);
    }
  };

  /*
   * Components
   */

  return (
    <Container>
      <EmailTitleRowAndTextAreaContainer>
        <TitleAndEmailSwitchRowContainer>
          <ThemedText.SubHeader textAlign="left">
            Upload Email
          </ThemedText.SubHeader>

          <LabeledSwitch
            switchChecked={isInputModeDrag ?? true}
            onSwitchChange={handleEmailInputTypeChanged}
            checkedLabel={"Drag"}
            uncheckedLabel={"Paste"}
            helperText={commonStrings.get('INPUT_MODE_TOOLTIP')}
          />
        </TitleAndEmailSwitchRowContainer>

        <UploadInstructionAndBrowseContainer>
          <UploadInstruction>
            <NumberedStep>
              {isInputModeDrag ?
                commonStrings.get('PROOF_FORM_UPLOAD_EMAIL_INSTRUCTIONS') :
                commonStrings.get('PROOF_FORM_PASTE_EMAIL_INSTRUCTIONS')
              }
              <Link
                href={isInputModeDrag 
                  ? DOWNLOAD_AND_UPLOAD_EMAIL_INSTRUCTIONS_DOCS_LINK
                  : COPY_AND_PASTE_EMAIL_INSTRUCTIONS_DOCS_LINK
                }
                target="_blank">
                  Guide ↗
              </Link>
            </NumberedStep>
          </UploadInstruction>

          <BrowseButton onClick={() => openFileDialog(fileInputRef)}>
            <StyledPaperclick />
          </BrowseButton>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".eml"
          />
        </UploadInstructionAndBrowseContainer>

        {isInputModeDrag ? (
          <DragAndDropTextBox
            onFileDrop={onFileDrop}
          />
        ) : (
          <LabeledTextArea
            label=""
            value={email}
            placeholder={PLACEHOLDER_EMAIL_BODY}
            onChange={(e) => {
              setEmail(e.currentTarget.value);
            }}
            height={"28vh"}
          />
        )}
      </EmailTitleRowAndTextAreaContainer>

      <ButtonContainer>
        <Button
          disabled={emailInputStatus !== EmailInputStatus.VALID}
          loading={isProofModalOpen}
          onClick={handleVerifyEmailClicked}
        >
          {ctaButtonTitle}
        </Button>

      </ButtonContainer>
      <LoginOrUploadButtonContainer>
        <TextButton
          onClick={() => handleEmailModeChanged(true)}
          height={24}
          title={'Or Sign in with Google'}
        />
      </LoginOrUploadButtonContainer>
    </Container>
  );
};

const Container = styled(Col)`
  gap: 1rem;
  padding: 1.5rem;
  background-color: #0D111C;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const EmailTitleRowAndTextAreaContainer = styled(Col)`
  gap: 1.5rem;
`;

const TitleAndEmailSwitchRowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 1rem;
  margin-bottom: -16px;
`;

const UploadInstructionAndBrowseContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
`;

const UploadInstruction = styled.div`
  flex-grow: 1;
`;

const BrowseButton = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: none;
  cursor: pointer;
  border-radius: 12px;
  width: 53px;
  height: 53px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledPaperclick = styled(Paperclip)`
  width: 18px;
  height: 18px;
  color: #FFF;
`;

const ButtonContainer = styled.div`
  display: grid;
  padding-top: 1rem;
`;

const LoginOrUploadButtonContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  margin: auto;
  gap: 1rem;
`;
