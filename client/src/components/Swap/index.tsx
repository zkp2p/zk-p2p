import React, { useEffect, useState, ChangeEvent } from "react";
import styled from 'styled-components';
import { useAccount } from "wagmi";

import { Input } from "./Input";
import { AutoColumn } from '../layouts/Column'
import { ThemedText } from '../../theme/text'
import { IntentTable } from './IntentContainer'


export type SwapQuote = {
  fiatIn: string;
  tokenOut: string;
};

interface SwapModalProps {
}

const SwapModal: React.FC<SwapModalProps> = ({
}: SwapModalProps) => {
  const { address } = useAccount();

  const [ethereumAddress, setEthereumAddress] = useState<string>(address ?? "");
  const [currentQuote, setCurrentQuote] = useState<SwapQuote>({ fiatIn: '', tokenOut: '' });

  /*
    Hooks
  */

  useEffect(() => {
    if (address) {
      setEthereumAddress(address);
    } else {
      setEthereumAddress("");
    }
  }, [address]);

  /*
    Event Handlers
  */

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>, field: keyof SwapQuote) => {
    const quoteCopy = {...currentQuote}
    quoteCopy[field] = event.target.value;
    setCurrentQuote(quoteCopy);
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

    // Reset form fields
    setCurrentQuote({ fiatIn: '', tokenOut: ''});
  };

  const isFormComplete = () => {
    const formComplete = currentQuote.fiatIn !== ''
    
    return formComplete;
  };

  return (
    <Wrapper>
      <SwapModalContainer>
        <TitleContainer>
          <ThemedText.HeadlineSmall>
            Swap
          </ThemedText.HeadlineSmall>
        </TitleContainer>
  
        <MainContentWrapper>
          <Input
            label="U.S. Dollars"
            name={`amountIn`}
            value={currentQuote.fiatIn}
            onChange={event => handleInputChange(event, 'fiatIn')}
            type="number"
            inputLabel="$"
            placeholder="0.00"
          />
          <Input
            label="USDC"
            name={`amountOut`}
            value={currentQuote.tokenOut}
            onChange={event => handleInputChange(event, 'tokenOut')}
            onKeyDown={handleEnterPress}
            type="number"
            inputLabel="USDC"
            placeholder="0"
            readOnly={true}
          />
          <ButtonContainer>
            <MainButton
              type="button"
              onClick={(event) => handleAdd(event)}
              disabled={!isFormComplete()}
            >
              Connect Wallet
            </MainButton>
          </ButtonContainer>
        </MainContentWrapper>
      </SwapModalContainer>
  
      <IntentTable
        loggedInWalletAddress={ethereumAddress}
        handleNewPositionClick={() => {}}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  max-width: 464px;
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SwapModalContainer = styled(AutoColumn)`
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
  gap: 0.5rem;
  align-self: center;
  border-radius: 4px;
  justify-content: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const MainButton = styled.button`
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
