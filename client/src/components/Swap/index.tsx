import React, { useEffect, useState, ChangeEvent } from "react";
import styled from 'styled-components';
import { useContractWrite, usePrepareContractWrite } from 'wagmi'

import { Input } from "./Input";
import { AutoColumn } from '../layouts/Column'
import { ThemedText } from '../../theme/text'
import { IntentTable } from './OnRamperIntentTable'
import { Button } from '../Button'
import { CustomConnectButton } from "../common/ConnectButton"
import { StoredDeposit } from '../../contexts/Deposits/types'
import { usdc } from '../../helpers/units'
import useAccount from '@hooks/useAccount';
import useOnRamperIntents from '@hooks/useOnRamperIntents';
import useSmartContracts from '@hooks/useSmartContracts';
import useLiquidity from '@hooks/useLiquidity';


export type SwapQuote = {
  requestedUSDC: string;
  fiatToSend: string;
  depositId: number;
};

interface SwapModalProps {
  onIntentTableRowClick?: (rowData: any[]) => void;
}

const SwapModal: React.FC<SwapModalProps> = ({
  onIntentTableRowClick
}: SwapModalProps) => {
  /*
    Contexts
  */
  const { isLoggedIn, loggedInEthereumAddress } = useAccount();
  const { currentIntentHash } = useOnRamperIntents();
  const { getBestDepositForAmount } = useLiquidity();
  const { rampAddress, rampAbi } = useSmartContracts()
  
  /*
    State
  */
  const [currentQuote, setCurrentQuote] = useState<SwapQuote>({ requestedUSDC: '', fiatToSend: '' , depositId: 0 });

  /*
    Event Handlers
  */
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>, field: keyof SwapQuote) => {
    const quoteCopy = {...currentQuote}

    quoteCopy[field] = event.target.value;

    if (field !== 'requestedUSDC') {
      quoteCopy.depositId = 0;
    }

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
    setCurrentQuote({ requestedUSDC: '', fiatToSend: '', depositId: 0 });
  };

  /*
    Contract Writes
  */

  //
  // function signalIntent(uint256 _depositId, uint256 _amount, address _to)
  //
  const { config: writeIntentConfig } = usePrepareContractWrite({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'signalIntent',
    args: [
      currentQuote.depositId,
      usdc(parseFloat(currentQuote.requestedUSDC)),
      loggedInEthereumAddress
    ],
    onError: (error: { message: any }) => {
      console.error(error.message);
    },
  });

  const {
    isLoading: isSubmitIntentLoading,
    write: writeSubmitIntent
  } = useContractWrite(writeIntentConfig);

  /*
    Hooks
  */
  useEffect(() => {
    const fetchBestDepositForAmount = async () => {
      if (currentQuote.requestedUSDC) {
        const amountInNumber = parseFloat(currentQuote.requestedUSDC);

        console.log('amountInNumber: ', amountInNumber);

        if (!isNaN(amountInNumber)) {
          const storedDeposit: StoredDeposit | null = await getBestDepositForAmount(amountInNumber);
          if (storedDeposit) {
            const usdcAmount = amountInNumber * storedDeposit.deposit.conversionRate;
            const fiatToSend = parseFloat(usdcAmount.toFixed(2));
            const depositId = storedDeposit.depositId;
  
            setCurrentQuote(prevState => (
              {
                ...prevState,
                fiatToSend: fiatToSend.toString(),
                depositId,
              })
            );
          } else {
            setCurrentQuote(prevState => ({ ...prevState, fiatToSend: '', depositId: 0 }));
          }
        }
      }
    };
  
    fetchBestDepositForAmount();
  }, [currentQuote.requestedUSDC, getBestDepositForAmount]);

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
            label="Receive"
            name={`requestedUSDC`}
            value={currentQuote.requestedUSDC}
            onChange={event => handleInputChange(event, 'requestedUSDC')}
            type="number"
            inputLabel="USDC"
            placeholder="0"
          />
          <Input
            label="Send (via Venmo)"
            name={`fiatToSend`}
            value={currentQuote.fiatToSend}
            onChange={event => handleInputChange(event, 'fiatToSend')}
            onKeyDown={handleEnterPress}
            type="number"
            inputLabel="$"
            placeholder="0.00"
            readOnly={true}
          />
          {!isLoggedIn ? (
            <CustomConnectButton
              fullWidth={true}
            />
          ) : (
            <CTAButton
              disabled={currentQuote.depositId === 0 && currentQuote.fiatToSend === ''}
              loading={isSubmitIntentLoading}
              onClick={async () => {
                writeSubmitIntent?.();
              }}
            >
              Start Order
            </CTAButton>
          )}
        </MainContentWrapper>
      </SwapModalContainer>

      {
        currentIntentHash && currentIntentHash === '' && (
          <IntentTable
            onRowClick={onIntentTableRowClick}
          />
        )
      }
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

const CTAButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px !important;
  padding: 1rem;
  font-size: 20px;
  font-weight: 550;
  transition: all 75ms;
`;

export default SwapModal;
