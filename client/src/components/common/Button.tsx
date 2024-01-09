import React, { useState } from "react";
import styled, { css } from 'styled-components';

import Spinner from "@components/common/Spinner";


interface ButtonProps {
  fullWidth?: boolean;
  height?: number;
  fontSize?: number;
  disabled?: boolean;
  loading?: boolean;
  svg?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  fullWidth = false,
  height = 48,
  fontSize = 16,
  disabled = false,
  loading = false,
  svg,
  onClick,
  children
}) => {
  const [svgLoaded, setSvgLoaded] = useState(!svg);
  
  return (
    <BaseButton
      fullWidth={fullWidth}
      height={height}
      fontSize={fontSize}
      disabled={disabled}
      $disabled={disabled}
      $loading={loading}
      $svgLoaded={!svg && svgLoaded}
      onClick={onClick}
    >
      {loading ? <Spinner /> : children}

      {svg &&
        <SVGOverlay 
          src={svg} 
          onLoad={() => setSvgLoaded(true)} 
          onError={() => setSvgLoaded(true)}
        />
      }
    </BaseButton>
  );
};

interface BaseButtonProps {
  fullWidth?: boolean;
  height?: number;
  fontSize?: number;
  $disabled?: boolean;
  $loading?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

const BaseButton = styled.button<BaseButtonProps & { $svgLoaded: boolean }>`
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  height: ${({ height }) => height}px;
  background: #df2e2d;
  box-shadow: inset -3px -6px 4px rgba(0, 0, 0, 0.16);
  border-radius: 24px;
  padding: 8px ${({ fullWidth }) => (fullWidth ? '0' : '24px')};
  text-align: center;
  color: white;
  font-weight: 700;
  font-size: ${({ fontSize }) => fontSize}px;
  font-family: 'Graphik';
  cursor: pointer;
  display: inline-block;
  transition: background 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: none;
  position: relative;

  &:hover:not([disabled]) {
    background: #ca2221;
  }

  &:active:not([disabled]) {
    background: #bc3035;
    box-shadow: inset 0px -8px 0px rgba(0, 0, 0, 0.16);
  }

  ${({ $disabled }) => 
    $disabled && css`
      opacity: 0.5;
      cursor: not-allowed;
      color: #6C757D;
      background: #131A2A;
    `
  }

  ${({ $loading }) => 
    $loading && css`
      cursor: wait;
      background: #df2e2d;
    `
  }

  ${({ $svgLoaded }) => 
    !$svgLoaded && css`
      background: transparent;
    `
  }
`;

const SVGOverlay = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 100%;
  pointer-events: none;
`;
