import styled from "styled-components";
import { CenterAllDiv, Row } from "../legacy/Layout";


export const NumberedStep: React.FC<{
  step?: number;
  children: React.ReactNode;
}> = ({ step, children }) => {
  return (
    <Container>
      {step !== undefined && (
        <Label>
          <span>{step}</span>
        </Label>
      )}
      <NumberedStepText>{children}</NumberedStepText>
    </Container>
  );
};

const Container = styled(Row)`
  background: rgba(255, 255, 255, 0.05);
  gap: 1rem;
  border-radius: 12px;
  padding: 12px 16px;
  color: #fff;
  line-height: 1.4;
  font-size: 15px;
`;

const Label = styled(CenterAllDiv)`
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  width: 24px;
  height: 24px;
  min-width: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const NumberedStepText = styled.span`
  margin: 4px;
`;
