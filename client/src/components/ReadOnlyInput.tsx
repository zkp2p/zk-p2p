import styled from "styled-components";
import { Col } from "./Layout";

export const ReadOnlyInput: React.FC<{
  label: string;
  value: any;
}> = ({ label, value }) => {
  return (
    <InputContainer>
      <label>
        {label}
      </label>
      <Input value={value} placeholder={label} readOnly={true} />
    </InputContainer>
  );
};

const InputContainer = styled(Col)`
  gap: 8px;
`;

const Input = styled.input`
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  padding: 8px 12px;
  height: 32px;
  display: flex;
  align-items: center;
  color: #fff;
  font-size: 16px;
  user-select: none;
  -webkit-user-select: none;
  pointer-events: none;
  opacity: 0.6;
`;
