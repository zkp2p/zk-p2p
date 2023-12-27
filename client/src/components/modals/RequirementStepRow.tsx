import styled from "styled-components";

import { CenterAllDiv, Row } from "../legacy/Layout";


export const RequirementStepRow: React.FC<{
  step?: number;
  children: React.ReactNode;
}> = ({ step, children }) => {
  return (
    <Container>
      {step !== undefined && (
        <Label>
          <span>{step}.</span>
        </Label>
      )}
      <RequirementStepText>{children}</RequirementStepText>
    </Container>
  );
};

const Container = styled(Row)`
  gap: 0.75rem;
  border-radius: 12px;
  color: #FFF;
  line-height: 1.35;
  padding: 0rem 0.5rem;
`;

const Label = styled(CenterAllDiv)`
  border-radius: 4px;
  width: 12px;
  height: 12px;
  font-size: 16px;
`;

const RequirementStepText = styled.span`
  font-size: 15px;
`;
