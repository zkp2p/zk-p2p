import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { Button } from "../Button";
import { Col } from "../legacy/Layout";
import { LabeledTextArea } from '../legacy/LabeledTextArea';
import { DragAndDropTextBox } from "../common/DragAndDropTextBox";
import { LabeledSwitch } from "../common/LabeledSwitch";
import { ThemedText } from '../../theme/text';
import { NumberedStep } from "../common/NumberedStep";

import { INPUT_MODE_TOOLTIP, PROOF_FORM_UPLOAD_EMAIL_INSTRUCTIONS } from "@helpers/tooltips";
import { PLACEHOLDER_EMAIL_BODY } from "@helpers/constants";
import useProofGenSettings from '@hooks/useProofGenSettings';


interface UploadEmailProps {
  email: string;
  setEmail: (email: string) => void;
  handleVerifyEmailClicked: () => void;
  isProofModalOpen: boolean;
}
 
export const UploadEmail: React.FC<UploadEmailProps> = ({
  email,
  setEmail,
  handleVerifyEmailClicked,
  isProofModalOpen,
}) => {

  /*
   * Context
   */

  const {
    isInputModeDrag,
    setIsInputModeDrag,

  } = useProofGenSettings();

  /*
   * State
   */

  const [emailInput, setEmailInput] = useState<string>("");

  /*
   * Handlers
   */

  const handleEmailInputTypeChanged = (checked: boolean) => {
    if (setIsInputModeDrag) {
      setIsInputModeDrag(checked);
    }
  };

  /*
   * Hooks
   */

  useEffect(() => {
    if (emailInput && setEmail) {
      setEmail(emailInput);
    }
  }, [emailInput, setEmail]);

  useEffect(() => {
    if (email) {
      setEmailInput(email);
    }
  }, [email]);

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
    setEmailInput(email);

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
            helperText={INPUT_MODE_TOOLTIP}
          />
        </TitleAndEmailSwitchRowContainer>

        <NumberedStep>
          {PROOF_FORM_UPLOAD_EMAIL_INSTRUCTIONS}
        </NumberedStep>

        {isInputModeDrag ? (
          <DragAndDropTextBox
            onFileDrop={onFileDrop}
          />
        ) : (
          <LabeledTextArea
            label=""
            value={emailInput}
            placeholder={PLACEHOLDER_EMAIL_BODY}
            onChange={(e) => {
              setEmailInput(e.currentTarget.value);
            }}
            height={"28vh"}
          />
        )}
      </EmailTitleRowAndTextAreaContainer>
      
      <ButtonContainer>
        <Button
          disabled={emailInput.length === 0}
          loading={isProofModalOpen}
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

const ButtonContainer = styled.div`
  display: grid;
  padding-top: 1rem;
`;
