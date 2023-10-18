import React, { useEffect, useMemo, useState, ChangeEvent } from "react";
import styled from 'styled-components';
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from 'wagmi'
import { useNavigate } from 'react-router-dom';

import { Input } from "@components/Swap/Input";
import { OnRamperIntentTable } from '@components/Swap/OnRamperIntentTable'
import { AutoColumn } from '@components/layouts/Column'
import { Button } from '@components/Button'
import { CustomConnectButton } from "@components/common/ConnectButton"
import { ThemedText } from '../../theme/text'
import { IndicativeQuote } from '../../contexts/Deposits/types'
import { DEPOSIT_REFETCH_INTERVAL, VENMO_MAX_TRANSFER_SIZE, ZERO } from "@helpers/constants";
import { toBigInt, toUsdcString } from '@helpers/units'
import useAccount from '@hooks/useAccount';
import useBalances from '@hooks/useBalance';
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

type QuoteStatus =
  | 'default'
  | 'exceeds-order-count'
  | 'exceeds-max-size'
  | 'insufficient-liquidity'
  | 'blocked-by-depositor'
  | 'success';

interface SwapModalProps {
  onIntentTableRowClick?: () => void;
}

const SwapModal: React.FC<SwapModalProps> = ({
  onIntentTableRowClick
}: SwapModalProps) => {
  const navigate = useNavigate();

  /*
   * Contexts
   */

  const { isLoggedIn, loggedInEthereumAddress } = useAccount();
  const { usdcBalance } = useBalances();
  const { isRegistered } = useRegistration();
  const { currentIntentHash, refetchIntentHash, shouldFetchIntentHash } = useOnRamperIntents();
  const { refetchDeposits, getBestDepositForAmount, shouldFetchDeposits } = useLiquidity();
  const { rampAddress, rampAbi } = useSmartContracts();
  const { refetchDepositCounter, shouldFetchRampState } = useRampState();
  
  /*
   * State
   */

  const [quoteStatus, setQuoteStatus] = useState<QuoteStatus>('default');
  const [currentQuote, setCurrentQuote] = useState<SwapQuote>({ requestedUSDC: '', fiatToSend: '' , depositId: ZERO });

  const [shouldConfigureSignalIntentWrite, setShouldConfigureSignalIntentWrite] = useState<boolean>(false);

  /*
   * Event Handlers
   */

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>, field: keyof SwapQuote) => {
    if (field === 'requestedUSDC') {
      const value = event.target.value;
      const quoteCopy = {...currentQuote}
      setShouldConfigureSignalIntentWrite(false);

      if (value === "") {
        quoteCopy[field] = '';
        quoteCopy.depositId = ZERO;

        setCurrentQuote(quoteCopy);
      } else if (value === ".") {
        quoteCopy[field] = "0.";
        quoteCopy.depositId = ZERO;

        setCurrentQuote(quoteCopy);
      }
      else if (isValidInput(value)) {
        quoteCopy[field] = event.target.value;

        setCurrentQuote(quoteCopy);
      }
    } else {
      const quoteCopy = {...currentQuote}
      quoteCopy[field] = event.target.value;

      setCurrentQuote(quoteCopy);
    }
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
      toBigInt(currentQuote.requestedUSDC),
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
    writeAsync: writeSubmitIntentAsync
  } = useContractWrite(writeIntentConfig);

  const {
    isLoading: isSubmitIntentMining
  } = useWaitForTransaction({
    hash: submitIntentResult ? submitIntentResult.hash : undefined,
    onSuccess(data) {
      console.log('writeSubmitIntentAsync successful: ', data);
      
      refetchIntentHash?.();
    },
  });

  /*
   * Hooks
   */

  useEffect(() => {
    if (shouldFetchIntentHash) {
      const intervalId = setInterval(() => {
        refetchIntentHash?.();
      }, DEPOSIT_REFETCH_INTERVAL);
  
      return () => clearInterval(intervalId);
    }
  }, [shouldFetchIntentHash, refetchIntentHash]);
  
  useEffect(() => {
    if (shouldFetchDeposits) {
      const intervalId = setInterval(() => {
        refetchDeposits?.();
      }, DEPOSIT_REFETCH_INTERVAL);
  
      return () => clearInterval(intervalId);
    }
  }, [shouldFetchDeposits, refetchDeposits]);

  useEffect(() => {
    if (shouldFetchRampState) {
      const intervalId = setInterval(() => {
        refetchDepositCounter?.();
      }, DEPOSIT_REFETCH_INTERVAL);
  
      return () => clearInterval(intervalId);
    }
  }, [shouldFetchRampState, refetchDepositCounter]);

  useEffect(() => {
    const fetchBestDepositForAmount = async () => {
      const requestedUsdcAmount = currentQuote.requestedUSDC;
      const isValidRequestedUsdcAmount = requestedUsdcAmount && requestedUsdcAmount !== '0';

      if (getBestDepositForAmount && isValidRequestedUsdcAmount) {
        const indicativeQuote: IndicativeQuote = await getBestDepositForAmount(currentQuote.requestedUSDC);
        const usdAmountToSend = indicativeQuote.usdAmountToSend;
        const depositId = indicativeQuote.depositId;

        const isAmountToSendValid = usdAmountToSend !== undefined;
        const isDepositIdValid = depositId !== undefined;

        if (isAmountToSendValid && isDepositIdValid) {
          setCurrentQuote(prevState => ({
            ...prevState,
            fiatToSend: usdAmountToSend,
            depositId: depositId
          }));

          const doesNotHaveOpenIntent = currentIntentHash === null;
          if (doesNotHaveOpenIntent) {
            if (parseFloat(usdAmountToSend) > VENMO_MAX_TRANSFER_SIZE) {
              setQuoteStatus('exceeds-max-size');

              setShouldConfigureSignalIntentWrite(false);
            } else {
              setQuoteStatus('success');

              setShouldConfigureSignalIntentWrite(true);
            }
          } else {
            setQuoteStatus('exceeds-order-count');

            setShouldConfigureSignalIntentWrite(false);
          }
        } else {
          setQuoteStatus('insufficient-liquidity');

          setShouldConfigureSignalIntentWrite(false);

          setCurrentQuote(prevState => ({
            ...prevState,
            fiatToSend: '',
            depositId: ZERO
          }));
        }
      } else {
        setQuoteStatus('default');

        setShouldConfigureSignalIntentWrite(false);

        setCurrentQuote(prevState => ({
          ...prevState,
          fiatToSend: '',
          depositId: ZERO
        }));
      }
    };
  
    fetchBestDepositForAmount();
  }, [currentQuote.requestedUSDC, getBestDepositForAmount, currentIntentHash]);

  /* 
   * Handlers
   */ 

  const navigateToRegistrationHandler = () => {
    navigate('/register');
  };

  /*
   * Helpers
   */

  function isValidInput(value) {
    const isValid = /^-?\d*(\.\d{0,6})?$/.test(value);
    return !isNaN(value) && parseFloat(value) >= 0 && isValid;
  }

  const usdcBalanceLabel = useMemo(() => {
    if (isLoggedIn && usdcBalance !== null) {
      return `Balance: ${toUsdcString(usdcBalance)}`
    } else {
      return '';
    }
  }, [usdcBalance, isLoggedIn]);

  const getButtonText = () => {
    switch (quoteStatus) {
      case 'exceeds-order-count':
        return 'One open order allowed';

      case 'exceeds-max-size':
        return 'Max transfer exceeded (2000)';

      case 'insufficient-liquidity':
        return 'Insufficient liquidity';

      case 'default':
        return 'Input USDC amount'

      case 'success':
      default:
        return 'Start Order';
    }
  }

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
            value={currentQuote.requestedUSDC}
            onChange={event => handleInputChange(event, 'requestedUSDC')}
            type="number"
            inputLabel="USDC"
            accessoryLabel={usdcBalanceLabel}
            placeholder="0"
          />
          <Input
            label="You send"
            name={`fiatToSend`}
            value={currentQuote.fiatToSend}
            onChange={event => handleInputChange(event, 'fiatToSend')}
            onKeyDown={handleEnterPress}
            type="number"
            inputLabel="$"
            placeholder="0.00"
            accessoryLabel="via Venmo"
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
              disabled={quoteStatus !== 'success'}
              loading={isSubmitIntentLoading || isSubmitIntentMining}
              onClick={async () => {
                try {
                  await writeSubmitIntentAsync?.();
                } catch (error) {
                  console.log('writeSubmitIntentAsync failed: ', error);
                }
              }}
            >
              {getButtonText()}
            </CTAButton>
          )}
        </MainContentWrapper>
      </SwapModalContainer>

      {
        currentIntentHash && (
          <>
            <VerticalDivider />
            <OnRamperIntentTable
              onIntentRowClick={onIntentTableRowClick}
            />
          </>
        )
      }
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

const VerticalDivider = styled.div`
  height: 32px;
  border-left: 1px solid #98a1c03d;
  margin: 0 auto;
`;

export default SwapModal;
