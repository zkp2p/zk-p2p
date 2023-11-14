import React, { useState, useRef, useEffect } from 'react';
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
  backgroundHoverColor?: string;
  activeBackgroundColor?: string;
  hoverColor?: string;
  borderHoverColor?: string;
  spinnerColor?: string;
}

const primaryColors = {
  backgroundColor: '#DF2E2D',
  borderColor: '#DF2E2D',
  borderHoverColor: '#DF2E2D',
  backgroundHoverColor: '#ca2221',
  activeBackgroundColor: '#bc3035',
  hoverColor: 'white',
  textColor: 'white',
  spinnerColor: '#DF2E2D'

}

const secondaryColors = {
  backgroundColor: 'transparent',
  borderColor: '#adb5bd',
  borderHoverColor: '#495057',
  backgroundHoverColor: 'transparent',
  activeBackgroundColor: 'background: rgba(206, 212, 218, 0.1);',
  hoverColor: '#495057',
  textColor: '#adb5bd',
  spinnerColor: '#adb5bd'
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
  const buttonRef = useRef<HTMLButtonElement>(null);

  /*
   * State
   */

  const [buttonWidth, setButtonWidth] = useState<number | null>(null);

  /*
   * Hooks
   */

  useEffect(() => {
    if (buttonRef.current && !loading) {
      setButtonWidth(buttonRef.current.offsetWidth);
    }
  }, [loading, children, title]);

  const containerStyle: React.CSSProperties = {};
  if (loading && buttonWidth) {
    containerStyle.width = `${buttonWidth}px`;
  }

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

  const shouldUsePrimaryColors = icon === 'send';

  /*
   * Component
   */

  return (
    <Container
      ref={buttonRef}
      style={containerStyle}
      fullWidth={fullWidth}
      height={height}
      disabled={disabled || loading}
      backgroundColor={shouldUsePrimaryColors ? primaryColors.backgroundColor : secondaryColors.backgroundColor}
      borderColor={shouldUsePrimaryColors ? primaryColors.borderColor : secondaryColors.borderColor}
      hoverColor={shouldUsePrimaryColors ? primaryColors.hoverColor : secondaryColors.hoverColor}
      borderHoverColor={shouldUsePrimaryColors ? primaryColors.borderHoverColor : secondaryColors.borderHoverColor}
      backgroundHoverColor={shouldUsePrimaryColors ? primaryColors.backgroundHoverColor : secondaryColors.backgroundHoverColor}
      activeBackgroundColor={shouldUsePrimaryColors ? primaryColors.activeBackgroundColor : secondaryColors.activeBackgroundColor}
      spinnerColor={shouldUsePrimaryColors ? primaryColors.spinnerColor : secondaryColors.spinnerColor}
      onClick={onClick}
    >
      <ButtonAndLabelContainer color={shouldUsePrimaryColors ? primaryColors.textColor : secondaryColors.textColor} loading={loading}>
        {
          loading ? (
            <Spinner color={shouldUsePrimaryColors ? primaryColors.spinnerColor : secondaryColors.spinnerColor}/>
          ) : (
            <>
              {title && <span>{title}</span>}
              {icon && getIcon(icon)}
              {children}
            </>
          )
        }
      </ButtonAndLabelContainer>
    </Container>
  );
};

const Container = styled.button<AccessoryButtonProps>`
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  height: ${({ height }) => height}px;
  border-radius: 18px;
  background: ${({ backgroundColor }) => backgroundColor || 'transparent'};
  box-shadow: inset -3px -6px 4px rgba(0, 0, 0, 0.16);
  border: 1px solid ${({ borderColor }) => borderColor};
  padding: 1px 14px 0px 14px;
  color: white;
  cursor: pointer;
  transition: background 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover:not([disabled]) {
    border: 1px solid ${({ borderHoverColor }) => borderHoverColor};
    color: ${({ hoverColor }) => hoverColor};
    background: ${({ backgroundHoverColor }) => backgroundHoverColor};

    * {
      color: ${({ hoverColor }) => hoverColor};
    }
  }

  &:active:not([disabled]) {
    background: ${({ activeBackgroundColor }) => activeBackgroundColor};
    box-shadow: inset 0px -8px 0px rgba(0, 0, 0, 0.16);
  }

  ${({ loading }) =>
    loading && css`
      cursor: wait;
      background: #dedede;
    `
  }
`;

const ButtonAndLabelContainer = styled.div<{ color: string, loading?: boolean  }>`
  width: 100%;  
  display: flex;
  align-items: center;
  justify-content: ${({ loading }) => loading ? 'center' : 'flex-start'};
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
