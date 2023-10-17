import React from "react";
import styled, { css } from 'styled-components';
import {
  ChevronRight,
  LogOut,
  Send,
  Trash2,
  UserX
} from 'react-feather';

import Spinner from "@components/common/Spinner";


type iconType = "send" | "chevronRight" | "trash" | "userX" | "logout";

interface AccessoryButtonProps {
  fullWidth?: boolean;
  title?: string;
  height?: number;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  icon?: iconType;
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

  const getIcon = (iconName: iconType) => {
    switch (iconName) {
      case "send":
        return <StyledSend />;

      case "chevronRight":
        return <StyledChevronRight />;

      case "logout":
        return <StyledLogOut />;

      case "trash":
        return <StyledTrash />;

      case "userX":
        return <StyledUserX />;

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
  border: 1px solid #adb5bd;
  padding: 0px 14px;
  color: white;
  cursor: pointer;
  transition: background 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover:not([disabled]) {
    border: 1px solid #495057;
    color: #495057;

    * {
      color: #495057;
    }
  }

  &:active:not([disabled]) {
    background: rgba(206, 212, 218, 0.1);
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
  font-size: 13px;
  font-family: 'Graphik';
  font-weight: 600;
  text-align: center;
  color: #adb5bd;
  gap: 8px;
`;

const StyledSend = styled(Send)`
  width: 12px;
  height: 12px;
  color: #adb5bd;
  margin-left: 2px;
`;

const StyledChevronRight = styled(ChevronRight)`
  width: 18px;
  height: 18px;
  color: #adb5bd;
  margin-right: -4px;
`;

const StyledLogOut = styled(LogOut)`
  width: 15px;
  height: 15px;
  color: #adb5bd;
  margin-left: 2px;
`;

const StyledTrash = styled(Trash2)`
  width: 13px;
  height: 13px;
  color: #adb5bd;
  margin-left: 2px;
`;

const StyledUserX = styled(UserX)`
  width: 15px;
  height: 15px;
  color: #adb5bd;
  margin-left: 2px;
`;
