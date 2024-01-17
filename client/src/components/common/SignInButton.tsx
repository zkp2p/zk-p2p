import React from "react";
import styled from 'styled-components';
import { ArrowRight } from 'react-feather';

interface SignInButtonProps {
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
  icon?: React.ReactNode;
  onClick?: () => void;
}

export const SignInButton: React.FC<SignInButtonProps> = ({
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
  icon,
  onClick,
}: SignInButtonProps) => {
  SignInButton.displayName = "Input";

  return (
      <Container onClick={onClick}>
        <IconAndLabelContainer>
          {icon && (
            <StyledIconBorder>
              {icon}
            </StyledIconBorder>
          )}
        </IconAndLabelContainer>
        <LabelAndInputContainer>
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
          <LabelContainer>
            <Label htmlFor={name}>
              {label}
            </Label>
          </LabelContainer>
        </LabelAndInputContainer>
        <ArrowRightContainer>
          <StyledArrowRight />
        </ArrowRightContainer>
      </Container>
  );
};

const Container = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #98a1c03d;
  background-color: #131A2A;

  &:hover {
    background-color: #1A2236;
    border-color: #CED4DA;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:focus-within {
    border-color: #CED4DA;
    border-width: 1px;
  }
  font-family: 'Graphik';
  cursor: pointer;
  transition: background 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  position: relative;
  align-items: center;
`;

const LabelAndInputContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const LabelContainer = styled.div`
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
  cursor: pointer;
`;

const InputWrapper = styled.div`
  width: 100%;  
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  margin-top: 6px;
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
  font-size: 20px;

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

const StyledIconBorder = styled.div`
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 10px; 
  box-sizing: border-box;
  border: 1px solid #FFF;
`;

const IconAndLabelContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-right: 1rem;
`;

const StyledArrowRight = styled(ArrowRight)`
  color: #FFF;
`;

const ArrowRightContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
`;