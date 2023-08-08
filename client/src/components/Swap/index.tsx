import React, { useState, ChangeEvent, useEffect } from "react";
import styled from 'styled-components';

import { Input } from "./Input";
import { AutoColumn } from '../layouts/Column'
import { ThemedText } from '../../theme/text'


export interface Player {
  name: string;
  cashInAmount: number;
  cashOutAmount: number;
}

export type FormPlayer = {
  name: string;
  amountIn: string;
  amountOut: string;
};

interface FormProps {
}

const SwapModal: React.FC<FormProps> = ({
}: FormProps) => {
  const [currentFormPlayer, setCurrentFormPlayer] = useState<FormPlayer>({ name: '', amountIn: '', amountOut: '' });

  /*
    Event Handlers
  */

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>, field: keyof FormPlayer) => {
    const playerCopy = {...currentFormPlayer}
    playerCopy[field] = event.target.value;
    setCurrentFormPlayer(playerCopy);
  };

  const handleEnterPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      // Prevent the default action
      event.preventDefault();

      // Call the handleAdd function
      handleAdd(event as any);
    }
  };

  const handleAdd = (event: React.FormEvent<HTMLButtonElement>) => {
    // Prevent the default form submit action
    event.preventDefault();
    
    // Sanitize the inputs in the row
    if (!currentFormPlayer.name || !currentFormPlayer.amountIn || !currentFormPlayer.amountOut) {
      alert('Please complete the row before adding a new one.');
      return;
    }

    const playerToAdd = {
      name: currentFormPlayer.name,
      cashInAmount: parseFloat(currentFormPlayer.amountIn),
      cashOutAmount: parseFloat(currentFormPlayer.amountOut)
    };

    // Reset form fields
    setCurrentFormPlayer({ name: '', amountIn: '', amountOut: '' });
  };

  const isFormComplete = () => {
    const formComplete = currentFormPlayer.name !== '' &&
                         currentFormPlayer.amountIn !== '' &&
                         currentFormPlayer.amountOut !== '';
    
    return formComplete;
  };

  return (
    <Wrapper>
      <TitleContainer>
        <ThemedText.HeadlineSmall>
          Swap
        </ThemedText.HeadlineSmall>
      </TitleContainer>

      <MainContentWrapper>
        <Input
          label="U.S. Dollar"
          name={`amountIn`}
          value={currentFormPlayer.amountIn}
          onChange={event => handleInputChange(event, 'amountIn')}
          type="number"
          inputLabel="$"
          placeholder="0.00"
        />
        <Input
          label="USDC"
          name={`amountOut`}
          value={currentFormPlayer.amountOut}
          onChange={event => handleInputChange(event, 'amountOut')}
          onKeyDown={handleEnterPress}
          type="number"
          inputLabel="USDC"
          placeholder="0.00"
        />
        <ButtonContainer>
          <AddPlayerButton
            type="button"
            onClick={(event) => handleAdd(event)}
            disabled={!isFormComplete()}
          >
            Connect Wallet
          </AddPlayerButton>
        </ButtonContainer>
      </MainContentWrapper>
    </Wrapper>
  );
};

const Wrapper = styled(AutoColumn)`
  max-width: 464px;
  width: 100%;
  border-radius: 16px;
  border: 1px solid #DEE2E6;
  padding: 1rem;
  gap: 1rem;
  background-color: #0D111C;
  border: 1px solid #98a1c03d;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.25);
`;

const TitleContainer = styled.div`
  display: flex;
  margin-left: 0.75rem;
`;

const MainContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-self: center;
  border-radius: 4px;
  justify-content: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const AddPlayerButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  padding: 1rem;
  width: 100%;
  font-size: 20px;
  font-weight: 550;
  transition: all 75ms;

  background-color: #212529;
  color: #F8F9FA;
  
  &:hover {
    background-color: #343A40;
    color: #E9ECEF;
  }

  &:disabled {
    background-color: #df2e2d;
    color: #F8F9FA;
  }
`;

export default SwapModal;
