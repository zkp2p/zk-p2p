import styled from "styled-components";
import { Col } from "./Layout";


export const SingleLineInput: React.FC<{
  label: string;
  value: any;
  placeholder: string;
  onChange: (e: any) => void;
  readOnly?: boolean;
}> = ({ label, value, placeholder, onChange, readOnly = false }) => {
  return (
    <InputContainer>
      <label
        style={{
          color: "rgba(255, 255, 255, 0.8)",
        }}
      >
        {label}
      </label>
      <Input
        onChange={onChange}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
      />
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
  transition: all 0.2s ease-in-out;
  &:hover {
    border: 1px solid rgba(255, 255, 255, 0.8);
  }
`;
