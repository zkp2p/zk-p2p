import React from "react";
import styled, { css } from 'styled-components';

import Spinner from "./common/Spinner";


interface ButtonProps {
  height?: number;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  height = 48,
  disabled = false,
  loading = false,
  onClick,
  children
}) => (
  <BaseButton
    height={height}
    disabled={disabled || loading}
    onClick={onClick}
  >
    {loading ? <Spinner /> : children}
  </BaseButton>
);

const BaseButton = styled.button<ButtonProps>`
  height: ${({ height }) => height}px;
  background: #df2e2d;
  box-shadow: inset 0px -6px 0px rgba(0, 0, 0, 0.16);
  border-radius: 24px;
  padding: 8px 24px;
  text-align: center;
  color: white;
  font-weight: 700;
  font-size: 16px;
  font-family: 'Graphik';
  cursor: pointer;
  display: inline-block;
  transition: background 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: none;

  &:hover:not([disabled]) {
    background: #ca2221;
  }

  &:active:not([disabled]) {
    background: #bc3035;
    box-shadow: inset 0px -8px 0px rgba(0, 0, 0, 0.16);
  }

  ${({ disabled }) => 
    disabled && css`
      opacity: 0.5;
      cursor: not-allowed;
      &:hover, &:active {
        background: #df2e2d; // Reset hover and active states for disabled buttons
        box-shadow: inset 0px -6px 0px rgba(0, 0, 0, 0.16);
      }
    `
  }

  ${({ loading }) => 
    loading && css`
      cursor: wait;
      background: #dedede;
    `
  }
`;
