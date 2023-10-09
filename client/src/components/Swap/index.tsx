import React, { useEffect, useState, ChangeEvent } from "react";
import styled from 'styled-components';
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from 'wagmi'
import { useNavigate } from 'react-router-dom';

import { Input } from "./Input";
import { AutoColumn } from '../layouts/Column'
import { ThemedText } from '../../theme/text'
import { IntentTable } from './OnRamperIntentTable'
import { Button } from '../Button'
import { CustomConnectButton } from "../common/ConnectButton"
import { StoredDeposit } from '../../contexts/Deposits/types'
import { DEPOSIT_REFETCH_INTERVAL, ZERO } from "@helpers/constants";
import { fromUsdcToNaturalBigInt, usdc } from '@helpers/units'
import useAccount from '@hooks/useAccount';
import useOnRamperIntents from '@hooks/useOnRamperIntents';
import useRampState from "@hooks/useRampState";
import useSmartContracts from '@hooks/useSmartContracts';
import useLiquidity from '@hooks/useLiquidity';
import useRegistration from "@hooks/useRegistration";


export type SwapQuote = {
  requestedUSDC: string;
  fiatToSend: string;
  depositId: bigint;
};

interface SwapModalProps {
  onIntentTableRowClick?: (rowData: any[]) => void;
}

const SwapModal: React.FC<SwapModalProps> = ({
  onIntentTableRowClick
}: SwapModalProps) => {
  const navigate = useNavigate();

  /*
   * Contexts
   */
  const { isLoggedIn, loggedInEthereumAddress } = useAccount();
  const { isRegistered } = useRegistration();
  const { currentIntentHash, refetchIntentHash } = useOnRamperIntents();
  const { refetchDeposits, getBestDepositForAmount, shouldFetchDeposits } = useLiquidity();
  const { rampAddress, rampAbi } = useSmartContracts();
  const { refetchDepositCounter, shouldFetchRampState } = useRampState();
  
  /*
   * State
   */
  const [currentQuote, setCurrentQuote] = useState<SwapQuote>({ requestedUSDC: '', fiatToSend: '' , depositId: ZERO });

  const [shouldConfigureSignalIntentWrite, setShouldConfigureSignalIntentWrite] = useState<boolean>(false);

  /*
   * Event Handlers
   */
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>, field: keyof SwapQuote) => {
    const quoteCopy = {...currentQuote}

    quoteCopy[field] = event.target.value;

    if (field !== 'requestedUSDC') {
      quoteCopy.depositId = ZERO;
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
    setCurrentQuote({ requestedUSDC: '', fiatToSend: '', depositId: ZERO });
  };

  /*
   * Contract Writes
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
      usdc(currentQuote.requestedUSDC),
      loggedInEthereumAddress
    ],
    onError: (error: { message: any }) => {
      console.error(error.message);
    },
    enabled: shouldConfigureSignalIntentWrite
  });

  const {
    data: submitIntentResult,
    isLoading: isSubmitIntentLoading,
    writeAsync: writeSubmitIntent
  } = useContractWrite(writeIntentConfig);

  const {
    isLoading: isSubmitIntentMining
  } = useWaitForTransaction({
    hash: submitIntentResult ? submitIntentResult.hash : undefined,
    onSuccess(data) {
      console.log('writeSubmitIntent successful: ', data);
      
      refetchIntentHash?.();
    },
  });

  /*
   * Hooks
   */

  useEffect(() => {
    if (shouldFetchDeposits) {
      const intervalId = setInterval(() => {
        refetchDeposits?.();
      }, DEPOSIT_REFETCH_INTERVAL);
  
      return () => clearInterval(intervalId);
    }
  }, [shouldFetchDeposits]);

  useEffect(() => {
    if (shouldFetchRampState) {
      const intervalId = setInterval(() => {
        refetchDepositCounter?.();
      }, DEPOSIT_REFETCH_INTERVAL);
  
      return () => clearInterval(intervalId);
    }
  }, [shouldFetchRampState]);

  useEffect(() => {
    const fetchBestDepositForAmount = async () => {
      if (currentQuote.requestedUSDC) {
        const requestedUsdcInNativeUnits = usdc(currentQuote.requestedUSDC);
        if (requestedUsdcInNativeUnits !== ZERO) {
          const storedDeposit: StoredDeposit | null = await getBestDepositForAmount(requestedUsdcInNativeUnits);
          console.log('Selected storedDeposit: ', storedDeposit);

          if (storedDeposit) {
            // Assume conversionRate is a number with up to 18 decimal places
            const conversionRate = storedDeposit.deposit.conversionRate;
            const precision = BigInt(10 ** 18);
            
            // Multiply requestedUsdcInNativeUnits by conversionRate, assuming requestedUsdcInNativeUnits is a BigInt
            const usdcAmount = requestedUsdcInNativeUnits * precision / conversionRate;
            
            // Convert usdcAmount to a string, then to a number for use with toFixed
            const usdcAmountNumber = Number(fromUsdcToNaturalBigInt(usdcAmount));
            const fiatToSend = (usdcAmountNumber % 1 === 0)
              ? usdcAmountNumber.toString()
              : usdcAmountNumber.toFixed(2);
            const depositId = storedDeposit.depositId;
  
            setCurrentQuote(prevState => ({ ...prevState, fiatToSend: fiatToSend.toString(), depositId }));
            setShouldConfigureSignalIntentWrite(true);
          } else {
            // TODO: Show error message, with max available liquidity
            setCurrentQuote(prevState => ({ ...prevState, fiatToSend: '', depositId: ZERO }));
            setShouldConfigureSignalIntentWrite(false);
          }
        }
      }
    };
  
    fetchBestDepositForAmount();
  }, [currentQuote.requestedUSDC, getBestDepositForAmount]);

  /* 
   * Handlers
   */ 

  const navigateToRegistrationHandler = () => {
    navigate('/register');
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
          ) : (!isRegistered && currentQuote.requestedUSDC) ? (
            <Button
              onClick={navigateToRegistrationHandler}
            >
              Complete Registration
            </Button>
          ) : (
            <CTAButton
              disabled={currentQuote.depositId === ZERO && currentQuote.fiatToSend === ''}
              loading={isSubmitIntentLoading || isSubmitIntentMining}
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
        currentIntentHash && (
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
