import React from "react";
import styled, { css } from 'styled-components';
import { ChevronRight, Send } from 'react-feather';

import Spinner from "@components/common/Spinner";

interface AccessoryButtonProps {
  fullWidth?: boolean;
  title?: string;
  height?: number;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  icon?: "send" | "chevronRight";
}

export const AccessoryButton: React.FC<AccessoryButtonProps> = ({
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
   * Helpers
   */

  const getIcon = (iconName: "send" | "chevronRight") => {
    switch (iconName) {
      case "send":
        return <StyledSend />;
      case "chevronRight":
        return <StyledChevronRight />;
      default:
        return null;
    }
  };
  
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
            {icon && getIcon(icon)}
            {children}
          </>
        )}
      </ButtonAndLabelContainer>
    </Container>
  );
};

const Container = styled.button<AccessoryButtonProps>`
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  height: ${({ height }) => height}px;
  border-radius: 18px;
  background: transparent;
  border: 1px solid #6C757D;
  padding: 8px 16px;
  color: white;
  cursor: pointer;
  transition: background 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover:not([disabled]) {
    background: rgba(206, 212, 218, 0.1);
    color: #FFF;
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

const ButtonAndLabelContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  font-weight: 700;
  font-size: 14px;
  font-family: 'Graphik';
  text-align: center;
  color: #6C757D;
  gap: 8px;
`;

const StyledSend = styled(Send)`
  width: 12px;
  height: 12px;
  color: #6C757D;
`;

const StyledChevronRight = styled(ChevronRight)`
  width: 18px;
  height: 18px;
  color: #6C757D;
  margin-right: -4px;
`;
