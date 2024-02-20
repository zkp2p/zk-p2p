import React, { ChangeEvent } from "react";
import styled from 'styled-components';

import { TokenSelector } from '@components/Send/TokenSelector';


interface InputProps {
  label: string;
  name: string;
  value?: string;
  type?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  inputLabel?: string;
  readOnly?: boolean;
  accessoryLabel?: string;
  hasSelector?: boolean;
  selectorDisabled?: boolean;
  enableMax?: boolean
  maxButtonOnClick?: () => void;
  fontSize?: number;
}

export const Input: React.FC<InputProps> = ({
  label,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  placeholder,
  inputLabel,
  type = "text",
  readOnly = false,
  accessoryLabel="",
  hasSelector=false,
  selectorDisabled=false,
  enableMax=false,
  maxButtonOnClick=() => {},
  fontSize = 28
}: InputProps) => {
  Input.displayName = "Input";

  /*
   * Helper
   */

  const dynamicFontSize = value && value.length > 0 
      ? Math.max(fontSize - Math.floor(value.length / 18) * 4, 12)
      : fontSize;

  return (
    <Container>
      <LabelAndInputContainer>
        <LabelAndTooltipContainer>
          <Label htmlFor={name}>
              {label}
          </Label>
        </LabelAndTooltipContainer>

        <InputWrapper>
          <StyledInput
            type={type}
            name={name}
            id={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            readOnly={readOnly}
            fontSize={dynamicFontSize}
            spellCheck={false}
            autoComplete={"off"}
          />
        </InputWrapper>
      </LabelAndInputContainer>

      {hasSelector ? (
        <SelectorAccessory>
          <TokenSelector
            disabled={selectorDisabled}
          />
        </SelectorAccessory>
      ) : (
        <AccessoryAndInputLabelWrapper>
          <AccessoryLabelAndMax>
            <AccessoryLabel>
              {accessoryLabel}
            </AccessoryLabel>

            {enableMax && accessoryLabel && (
              <MaxButton onClick={maxButtonOnClick}>
                Max
              </MaxButton>
            )}
          </AccessoryLabelAndMax>

          {inputLabel ? (
            <InputLabel>
              <span>{inputLabel}</span>
            </InputLabel>
          ) : null}
        </AccessoryAndInputLabelWrapper>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #98a1c03d;
  background-color: #131A2A;

  &:focus-within {
    border-color: #CED4DA;
    border-width: 1px;
  }
`;

const LabelAndInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
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

const StyledInput = styled.input<StyledInputProps & { fontSize?: number }>`
  width: 100%;
  height: 27.5px;
  border: 0;
  padding: 0;
  color: #FFFFFF;
  background-color: #131A2A;
  font-size: ${({ fontSize }) => fontSize || '28'}px;


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
      color: #6C757D;
    `
  }
`;

const SelectorAccessory = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #CED4DA;
  padding-top: 8px;
`;

const AccessoryAndInputLabelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #CED4DA;
  margin: 9px 0px 2px 0px;
`;

const AccessoryLabelAndMax = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
`;

const MaxButton = styled.div`
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 600;
  padding-bottom: 1px;
  cursor: pointer;
`;

const AccessoryLabel = styled.div`
  font-size: 14px;
  text-align: right;
  font-weight: 550;
`;

const InputLabel = styled.div`
  pointer-events: none;
  color: #9ca3af;
  font-size: 20px;
  text-align: right;
`;
