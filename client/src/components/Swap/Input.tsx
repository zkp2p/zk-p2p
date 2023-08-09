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
  inputLabel?: string;
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
  inputLabel,
  type = "text",
  readOnly = false,
}: InputProps) => {
  Input.displayName = "Input";

  return (
      <Container>
        <Label htmlFor={name}>
            {label}
        </Label>
        <InputWrapper>
          <StyledInput
            type={type}
            name={name}
            id={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            readOnly={readOnly}
          />
          {inputLabel ? (
            <InputLabel>
                <span>{inputLabel}</span>
            </InputLabel>
            ) : null
          }
        </InputWrapper>
      </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px;
  border-radius: 16px;
  border: 1.5px solid #98a1c03d;
  background-color: #131A2A;

  &:focus-within {
    border-color: #CED4DA;
    border-width: 1px;
  }
`;

const Label = styled.label`
  display: flex;
  font-size: 14px;
  font-weight: 550;
  margin-top: 8px;
  color: #CED4DA;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  width: 100%; 
  margin-top: 8px;
`;

interface StyledInputProps {
  readOnly?: boolean;
}

const StyledInput = styled.input<StyledInputProps>`
  display: flex;
  width: 100%;
  border: 0;
  padding: 0;
  color: #FFFFFF;
  background-color: #131A2A;
  font-size: 28px;

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

const InputLabel = styled.div`
  display: flex;
  position: absolute;
  right: 2px;
  pointer-events: none;
  color: #9ca3af;
  font-size: 20px;
`;
