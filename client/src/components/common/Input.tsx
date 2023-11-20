import React, { ChangeEvent } from "react";
import styled from 'styled-components';


interface InputProps {
  label: string;
  name: string;
  value?: string;
  type?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  name,
  value,
  onChange,
  onFocus,
  onKeyDown,
  placeholder,
  type = "text",
  readOnly = false,
}: InputProps) => {
  Input.displayName = "Input";

  return (
    <Container>
      <LabelAndInputContainer>
        <InputWrapper>
          <StyledInput
            type={type}
            id={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            readOnly={readOnly}
          />
        </InputWrapper>
      </LabelAndInputContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #98a1c03d;
  background-color: #131A2A;
  gap: 8px;

  &:focus-within {
    border-color: #CED4DA;
    border-width: 1px;
  }
`;

const LabelAndInputContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
`;

interface StyledInputProps {
  readOnly?: boolean;
}

const StyledInput = styled.input<StyledInputProps>`
  width: 100%;
  flex-grow: 1;
  border: 0;
  padding: 0;
  color: #FFFFFF;
  background-color: #131A2A;
  font-size: 14px;
  text-align: left;

  &:focus {
    box-shadow: none;
    outline: none;
  }

  &:placeholder {
    color: #6C757D;
  }

  &[type='number'] {
    -moz-appearance: textfield;
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  ${({ readOnly }) => 
    readOnly && `
      pointer-events: none;
    `
  }
`;
