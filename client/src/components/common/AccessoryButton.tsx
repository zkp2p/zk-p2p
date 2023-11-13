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

interface AccessoryButtonProps {
  fullWidth?: boolean;
  title?: string;
  height?: number;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  icon?: iconType;
  borderColor?: string;
  backgroundColor?: string;
  hoverColor?: string;
  borderHoverColor?: string;
}

const primaryColors = {
  backgroundColor: '#DF2E2D',
  borderColor: '#DF2E2D',
  borderHoverColor: '#DF2E2D',
  hoverColor: 'white',
  textColor: 'white',
}

const secondaryColors = {
  backgroundColor: 'transparent',
  borderColor: '#adb5bd',
  borderHoverColor: '#adb5bd',
  hoverColor: '#495057',
  textColor: '#adb5bd',
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

      case "refresh":
        return <StyledRefresh />;

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
      backgroundColor={icon === 'send' ? primaryColors.backgroundColor : secondaryColors.backgroundColor}
      borderColor={icon === 'send' ? primaryColors.borderColor : secondaryColors.borderColor}
      hoverColor={icon === 'send' ? primaryColors.hoverColor : secondaryColors.hoverColor}
      borderHoverColor={icon === 'send' ? primaryColors.borderHoverColor : secondaryColors.borderHoverColor}
      onClick={onClick}
    >
      <ButtonAndLabelContainer color={icon === 'send' ? primaryColors.textColor : secondaryColors.textColor}>
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
  background: ${({ backgroundColor }) => backgroundColor || 'transparent'};
  border: 1px solid ${({ borderColor }) => borderColor};
  padding: 1px 14px 0px 14px;
  color: white;
  cursor: pointer;
  transition: background 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover:not([disabled]) {
    border: 1px solid ${({ borderHoverColor }) => borderHoverColor};
    color: ${({ hoverColor }) => hoverColor};

    * {
      color: ${({ hoverColor }) => hoverColor};
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

const ButtonAndLabelContainer = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  font-size: 13px;
  font-family: 'Graphik';
  font-weight: 600;
  text-align: center;
  color: ${({ color }) => color}};
  gap: 8px;
`;

const StyledSend = styled(Send)`
  width: 12px;
  height: 12px;
  color: white;
  margin-left: 2px;
  border: 1px solid #DF2E2D;
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

const StyledRefresh = styled(RefreshCw)`
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
