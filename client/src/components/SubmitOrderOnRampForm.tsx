import React from 'react';
import styled from 'styled-components';

import { Button } from "./Button";
import { Col, SubHeader } from "./Layout";
import { LabeledTextArea } from './LabeledTextArea';
import { NumberedStep } from "../components/NumberedStep";


interface SubmitOrderOnRampFormProps {
  proof: string;
  publicSignals: string;
  setSubmitOrderProof: (proof: string) => void;
  setSubmitOrderPublicSignals: (publicSignals: string) => void;
  writeCompleteOrder?: () => void;
  isWriteCompleteOrderLoading: boolean;
}
 
export const SubmitOrderOnRampForm: React.FC<SubmitOrderOnRampFormProps> = ({
  proof,
  publicSignals,
  setSubmitOrderPublicSignals,
  setSubmitOrderProof,
  writeCompleteOrder,
  isWriteCompleteOrderLoading
}) => {
  return (
    <SubmitOrderOnRampFormHeaderContainer>
      <SubHeader>Submit Proof</SubHeader>
      <SubmitOrderOnRampFormBodyContainer>
          <NumberedStep>
            Upon successful proof generation above, both the proof and public inputs will be
            populated automatically. Prior to submission, select the correct order claim for
            the Venmo payment you completed from table of claims above.
          </NumberedStep>
        <LabeledTextArea
          label="Proof Output"
          value={proof}
          disabled={true}
          onChange={(e) => {
            setSubmitOrderProof(e.currentTarget.value);
          }}
        />
        <LabeledTextArea
          label="Public Signals"
          value={publicSignals}
          disabled={true}
          secret
          onChange={(e) => {
            setSubmitOrderPublicSignals(e.currentTarget.value);
          }}
        />
        <Button
          disabled={proof.length === 0 || publicSignals.length === 0 || isWriteCompleteOrderLoading}
          onClick={async () => {
            writeCompleteOrder?.();
          }}
        >
          Submit and Retrieve USDC
        </Button>
      </SubmitOrderOnRampFormBodyContainer>
    </SubmitOrderOnRampFormHeaderContainer>
  );
};

const SubmitOrderOnRampFormHeaderContainer = styled.div`
  width: 100%;
  gap: 1rem;
`;

const SubmitOrderOnRampFormBodyContainer = styled(Col)`
  gap: 2rem;
`;
