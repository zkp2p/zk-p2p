import React, { ChangeEvent } from "react";
import styled from 'styled-components';

import QuestionHelper from '@components/common/QuestionHelper';


interface ReadOnlyInputProps {
  label: string;
  name: string;
  value?: string;
  type?: string;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  inputLabel?: string;
  accessoryLabel?: string;
  helperText?: string;
}

export const ReadOnlyInput: React.FC<ReadOnlyInputProps> = ({
  label,
  name,
  value,
  onFocus,
  onKeyDown,
  placeholder,
  inputLabel,
  type = "text",
  accessoryLabel="",
  helperText="",
}: ReadOnlyInputProps) => {
  ReadOnlyInput.displayName = "Input";

  return (
      <Container>
        <LabelAndInputContainer>
          <LabelAndTooltipContainer>
            <Label htmlFor={name}>
                {label}
            </Label>

            { 
              helperText && (
                <QuestionHelper
                  text={helperText}
                />
              )
            }
          </LabelAndTooltipContainer>

          <InputWrapper>
            <StyledInput
              type={type}
              name={name}
              id={name}
              placeholder={placeholder}
              value={value}
              onChange={() => {}}
              onFocus={onFocus}
              onKeyDown={onKeyDown}
              readOnly={true}
            />
          </InputWrapper>
        </LabelAndInputContainer>
      </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 16px;
  border-radius: 16px;
  border: 1.5px solid #98a1c03d;
  background-color: #131A2A;

  &:focus-within {
    border-color: #CED4DA;
    border-width: 1px;
  }
`;

const LabelAndInputContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const LabelAndTooltipContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 0.25rem;
  margin-top: 4px;
  align-items: center;
  color: #CED4DA;
`;

const Label = styled.label`
  display: flex;
  font-size: 14px;
  font-weight: 550;
`;

const InputWrapper = styled.div`
  width: 100%;  
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  margin-top: 8px;
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
  font-size: 16px;

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
