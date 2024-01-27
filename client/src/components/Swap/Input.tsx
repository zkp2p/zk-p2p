import React, { ChangeEvent } from "react";
import styled from 'styled-components';

import { TokenSelector } from '@components/Swap/TokenSelector';
import { PlatformSelector } from '@components/modals/PlatformSelector';


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
  accessoryButtonLabel?: string;
  onAccessoryButtonClick?: () => void;
  accessoryLabel?: string;
  accessoryLabelAlignment?: 'left' | 'right';
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
  accessoryButtonLabel = "",
  onAccessoryButtonClick = () => {},
  accessoryLabel="",
  accessoryLabelAlignment = "right",
}: InputProps) => {
  Input.displayName = "Input";

  return (
    <Container>
      <LabelInputAndAccessoryContainer>
        <LabelAndInputContainer>
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
          </InputWrapper>
        </LabelAndInputContainer>

        <SelectorAccessory hasAccessoryLabel={accessoryLabel !== ""}>
          {inputLabel ? (
            <PlatformSelector/>
          ) : (
            <TokenSelector/>
          )}
        </SelectorAccessory>
      </LabelInputAndAccessoryContainer>
      
      <AccessoryContainer alignment={accessoryLabelAlignment}>
        <AccessoryTextButton onClick={onAccessoryButtonClick}>
          {accessoryButtonLabel}
        </AccessoryTextButton>

        <AccessoryLabel>
          {accessoryLabel}
        </AccessoryLabel>
      </AccessoryContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #98a1c03d;
  background-color: #131A2A;
  gap: 8px;

  &:focus-within {
    border-color: #CED4DA;
    border-width: 1px;
  }
`;

const LabelInputAndAccessoryContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const LabelAndInputContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  display: flex;
  font-size: 14px;
  font-weight: 550;
  color: #CED4DA;
`;

const InputWrapper = styled.div`
  width: 100%;  
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  padding-top: 8px;
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

interface SelectorAccessoryProps {
  hasAccessoryLabel: boolean;
}

const SelectorAccessory = styled.div<SelectorAccessoryProps>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #CED4DA;
  padding-top: 8px;
`;

const AccessoryContainer = styled.div<{ alignment?: string, accessoryButtonLabel?: string, onAccessoryButtonClick?: () => void }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 14px;
  justify-content: ${({ alignment }) => alignment === 'right' ? 'space-between' : 'flex-start'};
`;

const AccessoryLabel = styled.div`
  font-weight: 500;
  color: #6C757D;
`;

const AccessoryTextButton = styled.div`
  cursor: pointer;
  font-weight: 600;
  color: #FFFFFF;
`;
