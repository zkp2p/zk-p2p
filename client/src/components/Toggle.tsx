import React from 'react';
import styled, { css } from 'styled-components';


interface ToggleProps {
  isSwapTab: boolean;
  handleToggle: (target: string) => void;
}

interface ToggleButtonProps {
  isSwapTab: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  handleToggle,
  isSwapTab
}) => {
  return (
    <ToggleContainer>
      <ToggleButton
        onClick={() => handleToggle('Swap')}
        isSwapTab={isSwapTab}
      >
        Swap
      </ToggleButton>
      <ToggleButton
        onClick={() => handleToggle('Pool')}
        isSwapTab={!isSwapTab}
      >
        Pool
      </ToggleButton>
    </ToggleContainer>
  );
};

const ToggleContainer = styled.div`
  width: 229px;
  height: 40px;
  border-radius: 40px;
  background: #0D111C;
`;

const ToggleButton = styled.span<ToggleButtonProps>`
  display: inline-block;
  width: 50%;
  text-align: center;
  font-weight: 700;
  font-size: 16px;
  height: 100%;
  line-height: 40px;
  border-radius: 40px;
  cursor: pointer;

  ${({ isSwapTab }) => isSwapTab && css`
    background: #df2e2d;
    color: #ffffff;
    box-shadow: inset 0px -6px 0px rgba(0, 0, 0, 0.16);
  `}
`;