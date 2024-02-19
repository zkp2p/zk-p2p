import styled from "styled-components";

import { Row } from "@components/legacy/Layout";


interface QuoteStepProps {
  label: string;
  value: string;
};

export const QuoteStep: React.FC<QuoteStepProps> = ({
  label,
  value,
}) => {
  return (
    <Container>
      <Label>{label}</Label>
      <Value>{value}</Value>
    </Container>
  );
};

const Container = styled(Row)`
  border-radius: 12px;
  font-size: 14px;
  justify-content: space-between;
`;

const Label = styled.div`
  color: #CED4DA;
`;

const Value = styled.div`
  color: #FFF;
`;
