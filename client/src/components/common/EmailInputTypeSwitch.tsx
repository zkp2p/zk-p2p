import React from 'react';
import { Switch } from '@mui/material';
import styled from 'styled-components';

import QuestionHelper from './QuestionHelper';


interface EmailInputTypeSwitchProps {
  switchChecked: boolean;
  onSwitchChange: (checked: boolean) => void;
  label?: string;
  helperText?: string;
}

export const EmailInputTypeSwitch: React.FC<EmailInputTypeSwitchProps> = ({
  switchChecked = true,
  onSwitchChange,
  label = 'Input Mode',
  helperText = 'Fill me out'
}) => {
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSwitchChange(event.target.checked);
  };

  return (
    <Container>
      <SwitchLabel>
        {label}
      </SwitchLabel>
      
      <QuestionHelper
        text={helperText}
      />

      <Switch
        checked={switchChecked}
        onChange={handleSwitchChange}
        color={switchChecked ? 'primary' : 'secondary'}
      />
    </Container>
  )
};

const Container = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const SwitchLabel = styled.span`
  color: '#888888';
`;
