import React from "react";
import styled, { css } from 'styled-components';


interface ButtonProps {
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  disabled = false,
  onClick,
  children
}) => (
  <BaseButton
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </BaseButton>
);

const BaseButton = styled.button<ButtonProps>`
  height: 48px;
  background: #df2e2d;
  box-shadow: inset 0px -6px 0px rgba(0, 0, 0, 0.16);
  border-radius: 24px;
  padding: 8px 24px;
  text-align: center;
  color: white;
  font-weight: 700;
  font-size: 16px;
  font-family: 'Graphik';
  line-height: 24px;
  cursor: pointer;
  display: inline-block;
  transition: all 0.2s ease-in-out;
  border: none;

  &:hover {
    background: linear-gradient(90.46deg, #eb382d 4.07%, #bc3035 98.55%);
  }

  &:active {
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
        linear-gradient(90.46deg, #eb382d 4.07%, #bc3035 98.55%);
    box-shadow: inset 0px -8px 0px rgba(0, 0, 0, 0.16);
  }

  ${({ disabled }) => 
    disabled 
    ? css`
        opacity: 0.5;
        cursor: not-allowed;
      `
    : css`
      &:not(:disabled):hover {
        background: #ca2221;
      }
    `
  }
`;