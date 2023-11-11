import React from "react";
import styled, { css } from 'styled-components';
import {
  ChevronRight,
  LogOut,
  Send,
  Trash2,
  UserX,
  RefreshCw
} from 'react-feather';

import Spinner from "@components/common/Spinner";


type iconType = "send" | "chevronRight" | "trash" | "userX" | "logout" | "refresh";

interface TextButtonProps {
  fullWidth?: boolean;
  title?: string;
  height?: number;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  icon?: iconType;
}

export const TextButton: React.FC<TextButtonProps> = ({
  fullWidth = false,
  title = '',
  height = 48,
  disabled = false,
  loading = false,
  onClick,
  children,
  icon
}) => {
  
  /*
   * Component
   */

  return (
    <Container
      fullWidth={fullWidth}
      height={height}
      disabled={disabled || loading}
      onClick={onClick}
    >
      <ButtonAndLabelContainer>
        {loading ? <Spinner /> : (
          <>
            {title && <span>{title}</span>}
            {children}
          </>
        )}
      </ButtonAndLabelContainer>
    </Container>
  );
};

const Container = styled.button<TextButtonProps>`
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  height: ${({ height }) => height}px;
  background: transparent;
  border: none;
  padding: 1px 14px 0px 14px;
  color: white;
  cursor: pointer;
  transition: color 0.2s ease-in-out;

  &:hover:not([disabled]) {
    color: #adb5bd;
  }

  &:active:not([disabled]) {
    color: #343a40; // Active text color
  }

  ${({ disabled }) => 
    disabled && css`
      opacity: 0.5;
      cursor: not-allowed;
      &:hover, &:active {
        color: white; // Reset hover and active text color for disabled
        text-decoration: none; /* No underline for disabled state */
      }
    `
  }

  ${({ loading }) => 
    loading && css`
      cursor: wait;
    `
  }
`;

const ButtonAndLabelContainer = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  font-family: 'Arial', sans-serif;
  font-weight: 400;
  text-align: center;
  color: inherit;
  gap: 8px;
`;