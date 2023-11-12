import React from "react";
import styled from 'styled-components';

import { Input } from "@components/Swap/Input";
import { AutoColumn } from '@components/layouts/Column';
import { ThemedText } from '../../theme/text';


export type SwapQuote = {
  requestedUSDC: string;
  fiatToSend: string;
  depositId: bigint;
};


const SwapPreview: React.FC = () => {
  /*
   * Component
   */

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
            label="Requesting"
            name={`requestedUSDC`}
            value={undefined}
            onChange={() => {}}
            type="number"
            inputLabel="USDC"
            accessoryLabel={''}
            placeholder="0"
            readOnly
          />
          <Input
            label="You send"
            name={`fiatToSend`}
            value={undefined}
            onChange={() => {}}
            onKeyDown={() => {}}
            type="number"
            inputLabel="$"
            placeholder="0.00"
            accessoryLabel="via Venmo"
            readOnly
          />
        </MainContentWrapper>
      </SwapModalContainer>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  max-width: 484px;
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0), #171717FF);
    pointer-events: none;
  }
`;

const SwapModalContainer = styled(AutoColumn)`
  border-radius: 16px;
  border: 1px solid #DEE2E6;
  padding: 1rem;
  gap: 1rem;
  background-color: #0D111C;
  border: 1px solid #98a1c03d;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.25);

  &:hover {
    border: 1px solid #DF2E2D
  }
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

export default SwapPreview;
