import React, { useState, useEffect } from 'react';
import { Switch } from '@mui/material';
import styled from 'styled-components';


interface EmailInputTypeSwitchProps {
  inputTypeChecked: boolean;
  isLightMode: boolean;
  onSwitchChange: (checked: boolean) => void;
}

export const EmailInputTypeSwitch: React.FC<EmailInputTypeSwitchProps> = ({
  inputTypeChecked = true,
  isLightMode,
  onSwitchChange,
}) => {
  useEffect(() => {
    localStorage.setItem('proofEmailVersion', String(inputTypeChecked));
  }, [inputTypeChecked]);

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSwitchChange(event.target.checked);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
      <SwitchLabel>
        Input Mode
      </SwitchLabel>
      <Switch
        defaultChecked={inputTypeChecked}
        onChange={handleSwitchChange}
        color={inputTypeChecked ? (!isLightMode ? 'primary' : 'secondary') : 'default'}
      />
    </div>
  )
};

const SwitchLabel = styled.span`
  margin-right: 10px;
  color: '#888888';
`;
