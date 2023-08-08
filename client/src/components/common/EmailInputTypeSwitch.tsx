import React from 'react';
import { Switch } from '@mui/material';
import styled from 'styled-components';


interface EmailInputTypeSwitchProps {
  switchChecked: boolean;
  onSwitchChange: (checked: boolean) => void;
}

export const EmailInputTypeSwitch: React.FC<EmailInputTypeSwitchProps> = ({
  switchChecked = true,
  onSwitchChange,
}) => {
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSwitchChange(event.target.checked);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
      <SwitchLabel>
        Input Mode
      </SwitchLabel>
      <Switch
        checked={switchChecked}
        onChange={handleSwitchChange}
        color={switchChecked ? 'primary' : 'secondary'}
      />
    </div>
  )
};

const SwitchLabel = styled.span`
  margin-right: 10px;
  color: '#888888';
`;
