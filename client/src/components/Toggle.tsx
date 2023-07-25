import React, { useState } from 'react';
import styled, { css } from 'styled-components';


interface ToggleButtonProps {
  selected: boolean;
}

export const Toggle: React.FC = () => {
  const [isSwapTab, setIsSwapTab] = useState(true);

  const toggleTab = (target: string) => {
    const tab = (typeof target === 'string' && target) || 'Swap';
    setIsSwapTab(tab === 'Swap');
  };

  return (
    <ToggleContainer>
      <ToggleButton
        onClick={() => toggleTab('Swap')}
        selected={isSwapTab}
      >
        Swap
      </ToggleButton>
      <ToggleButton
        onClick={() => toggleTab('Pool')}
        selected={!isSwapTab}
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

  ${({ selected }) => selected && css`
    background: #df2e2d;
    color: #ffffff;
    box-shadow: inset 0px -6px 0px rgba(0, 0, 0, 0.16);
  `}
`;