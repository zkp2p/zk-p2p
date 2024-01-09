import React, { useEffect, useMemo, useState, ChangeEvent } from "react";
import styled from 'styled-components';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { useNavigate } from 'react-router-dom';

import { Input } from "@components/Swap/Input";
import { OnRamperIntentTable } from '@components/Swap/OnRamperIntentTable';
import { AutoColumn } from '@components/layouts/Column';
import { Button } from '@components/common/Button';
import { CustomConnectButton } from "@components/common/ConnectButton";
import { ThemedText } from '@theme/text';
import { IndicativeQuote } from '@helpers/types';
import { InstructionDrawer } from '@components/Swap/InstructionDrawer';
import { SettingsDropdown } from './SettingsDropdown';
import {
  DEPOSIT_REFETCH_INTERVAL,
  MAX_USDC_TRANSFER_SIZE,
  ZERO
} from "@helpers/constants";
import { toBigInt, toUsdcString, conversionRateToMultiplierString } from '@helpers/units'
import useAccount from '@hooks/useAccount';
import useBalances from '@hooks/useBalance';
import useSmartContracts from '@hooks/useSmartContracts';
import useSwapQuote from '@hooks/useSwapQuote';
import usePlatformSettings from "@hooks/usePlatformSettings";


export type SwapQuote = {
  requestedUSDC: string;
  fiatToSend: string;
  depositId: bigint;
  conversionRate: bigint;
};

const ZERO_QUOTE: SwapQuote = {
  requestedUSDC: '',
  fiatToSend: '',
  depositId: ZERO,
  conversionRate: ZERO
};

const QuoteState = {
  DEFAULT: 'default',
  EXCEEDS_ORDER_COUNT: 'exceeds-order-count',
  EXCEEDS_MAX_SIZE: 'exceeds-max-size',
  INSUFFICIENT_LIQUIDITY: 'insufficient-liquidity',
  INVALID_RECIPIENT_ADDRESS: 'invalid-recipient-address',
  ORDER_COOLDOWN_PERIOD: 'order-cooldown-period',
  BLOCKED_BY_DEPOSITOR: 'blocked-by-depositor',
  SUCCESS: 'success',
}

interface SwapProps {
  onIntentTableRowClick?: () => void;
}

const Swap: React.FC<SwapProps> = ({
  onIntentTableRowClick
}: SwapProps) => {
  const navigate = useNavigate();

  /*
   * Contexts
   */

  const { isLoggedIn, loggedInEthereumAddress } = useAccount();
  const { usdcBalance } = useBalances();
  const {
    venmoRampAddress,
    venmoRampAbi,
    hdfcRampAddress,
    hdfcRampAbi
  } = useSmartContracts();
  const { paymentPlatform, PaymentPlatform } = usePlatformSettings();
  
  const { 
    isRegistered,
    refetchDeposits,
    getBestDepositForAmount,
    shouldFetchDeposits,
    refetchDepositCounter,
    shouldFetchRampState,
    onRampCooldownPeriod,
    currentIntentHash,
    refetchIntentHash,
    shouldFetchIntentHash,
    lastOnRampTimestamp,
    refetchLastOnRampTimestamp
  } = useSwapQuote();

  /*
   * State
   */

  const [quoteState, setQuoteState] = useState(QuoteState.DEFAULT);
  const [currentQuote, setCurrentQuote] = useState<SwapQuote>(ZERO_QUOTE);

  const [recipientAddress, setRecipientAddress] = useState<string>('');

  const [rampAddress, setRampAddress] = useState<string | null>(null);
  const [rampAbi, setRampAbi] = useState<string | null>(null);
  const [shouldConfigureSignalIntentWrite, setShouldConfigureSignalIntentWrite] = useState<boolean>(false);

  const [onRampTimeRemainingLabel, setOnRampTimeRemainingLabel] = useState('');

  /*
   * Event Handlers
   */

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>, field: keyof SwapQuote) => {
    if (field === 'requestedUSDC') {
      const value = event.target.value;
      const quoteCopy = {...currentQuote}
      setShouldConfigureSignalIntentWrite(false);

      if (value === "" || value === "0" || value === ".") {
        setCurrentQuote(ZERO_QUOTE);
      } else if (isValidInput(value)) {
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
    setCurrentQuote(ZERO_QUOTE);
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
      recipientAddress
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
      refetchLastOnRampTimestamp?.();
    },
  });

  /*
   * Hooks
   */

  useEffect(() => {
    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setRampAddress(venmoRampAddress);
        setRampAbi(venmoRampAbi);
        break;

      case PaymentPlatform.HDFC:
        setRampAddress(hdfcRampAddress);
        setRampAbi(hdfcRampAbi);
        break;

      default:
        break;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, venmoRampAddress, hdfcRampAddress]);

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
    const fetchUsdAmountToSendAndVerifyOrder = async () => {
      const requestedUsdcAmount = currentQuote.requestedUSDC;
      const isValidRequestedUsdcAmount = requestedUsdcAmount && requestedUsdcAmount !== '0';

      if (getBestDepositForAmount && isValidRequestedUsdcAmount) {
        const indicativeQuote: IndicativeQuote = await getBestDepositForAmount(currentQuote.requestedUSDC, loggedInEthereumAddress);
        const usdAmountToSend = indicativeQuote.usdAmountToSend;
        const depositId = indicativeQuote.depositId;
        const conversionRate = indicativeQuote.conversionRate;

        const isAmountToSendValid = usdAmountToSend !== undefined;
        const isDepositIdValid = depositId !== undefined;
        const isConversionRateValid = conversionRate !== undefined;

        if (isAmountToSendValid && isDepositIdValid && isConversionRateValid) {
          setCurrentQuote(prevState => ({
            ...prevState,
            fiatToSend: usdAmountToSend,
            depositId,
            conversionRate,
          }));

          const doesNotHaveOpenIntent = currentIntentHash === null;
          if (doesNotHaveOpenIntent) {

            const lastOnRampTimestampLoaded = lastOnRampTimestamp !== null;
            const onRampCooldownPeriodLoaded = onRampCooldownPeriod !== null;
            if (lastOnRampTimestampLoaded && onRampCooldownPeriodLoaded) {
              const onRampCooldownEnd = (lastOnRampTimestamp + onRampCooldownPeriod) * 1000n;
              const onRampCooldownElapsed = Date.now() >= onRampCooldownEnd;

              if (!onRampCooldownElapsed) {
                updateQuoteErrorState(QuoteState.ORDER_COOLDOWN_PERIOD);
              } else if (toBigInt(requestedUsdcAmount) > MAX_USDC_TRANSFER_SIZE) {
                updateQuoteErrorState(QuoteState.EXCEEDS_MAX_SIZE);
              } else {
                const isValidRecipientAddress = isValidAddress(recipientAddress);
                if (isValidRecipientAddress) {
                  setQuoteState(QuoteState.SUCCESS);

                  setShouldConfigureSignalIntentWrite(true);
                } else {
                  updateQuoteErrorState(QuoteState.INVALID_RECIPIENT_ADDRESS);
                }
              }
            }
          } else {
            updateQuoteErrorState(QuoteState.EXCEEDS_ORDER_COUNT);
          }
        } else {
          updateQuoteErrorState(QuoteState.INSUFFICIENT_LIQUIDITY);
          setCurrentQuote(prevState => ({
            ...prevState,
            conversionRate: ZERO,
            fiatToSend: '',
          }));
        }
      } else {
        updateQuoteErrorState(QuoteState.DEFAULT);
        setCurrentQuote(prevState => ({
          ...prevState,
          conversionRate: ZERO,
          fiatToSend: '',
        }));
      }
    };

    fetchUsdAmountToSendAndVerifyOrder();
  }, [
      currentQuote.requestedUSDC,
      getBestDepositForAmount,
      currentIntentHash,
      lastOnRampTimestamp,
      onRampCooldownPeriod,
      recipientAddress,
      loggedInEthereumAddress
    ]
  );

  useEffect(() => {
    const updateCooldownTime = () => {
      if (lastOnRampTimestamp && onRampCooldownPeriod) {
        const cooldownEnd = (lastOnRampTimestamp + onRampCooldownPeriod) * 1000n;
        const now = BigInt(Date.now());
        const timeRemaining = cooldownEnd - now;

        if (timeRemaining > 0) {
          const timeRemainingInMinutes = Number(timeRemaining / 60000n);
          const hours = Math.floor(timeRemainingInMinutes / 60);
          const minutes = timeRemainingInMinutes % 60;

          setOnRampTimeRemainingLabel(`${hours}h ${minutes}m`);
        } else {
          setOnRampTimeRemainingLabel('Cooldown complete');
        }
      } else {
        setOnRampTimeRemainingLabel('Calculating...');
      }
    };

    updateCooldownTime();

    const intervalId = setInterval(updateCooldownTime, 60000);

    return () => clearInterval(intervalId);
  }, [lastOnRampTimestamp, onRampCooldownPeriod]);

  useEffect(() => {
    if (loggedInEthereumAddress) {
      setRecipientAddress(loggedInEthereumAddress);
    } else {
      setRecipientAddress('');
    }
  }, [loggedInEthereumAddress]);

  /*
   * Handlers
   */

  const navigateToRegistrationHandler = () => {
    navigate('/register');
  };

  /*
   * Helpers
   */

  const updateQuoteErrorState = (error: any) => {
    console.log('updateQuoteErrorState: ', error)

    setQuoteState(error);

    setShouldConfigureSignalIntentWrite(false);
  }

  function isValidInput(value) {
    const isValid = /^-?\d*(\.\d{0,6})?$/.test(value);
    return !isNaN(value) && parseFloat(value) >= 0 && isValid;
  }

  function isValidAddress(address: string) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  const usdcBalanceLabel = useMemo(() => {
    if (isLoggedIn && usdcBalance !== null) {
      return `Balance: ${toUsdcString(usdcBalance, true)}`
    } else {
      return '';
    }
  }, [usdcBalance, isLoggedIn]);

  const bestAvailableRateLabel = useMemo(() => {
    if (currentQuote.conversionRate !== ZERO) {
      const conversionRate = conversionRateToMultiplierString(currentQuote.conversionRate);
      return `Best available rate: ${conversionRate}`
    } else {
      return '';
    }
  }, [currentQuote.conversionRate]);

  const getButtonText = () => {
    switch (quoteState) {
      case QuoteState.ORDER_COOLDOWN_PERIOD:
        return 'Order cooldown not elapsed: ' + onRampTimeRemainingLabel;

      case QuoteState.EXCEEDS_ORDER_COUNT:
        return 'Max one open order';

      case QuoteState.INVALID_RECIPIENT_ADDRESS:
        return 'Invalid recipient address';
      
      case QuoteState.EXCEEDS_MAX_SIZE:
        return 'Exceeded USD transfer limit of 250';

      case QuoteState.INSUFFICIENT_LIQUIDITY:
        return 'Insufficient liquidity';

      case QuoteState.DEFAULT:
        return 'Input USDC amount'

      case QuoteState.SUCCESS:
      default:
        return 'Start Order';
    }
  };

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

          {isLoggedIn && (
            <SettingsDropdown
              recipientAddress={recipientAddress}
              setRecipientAddress={setRecipientAddress}
              isLoggedIn={isLoggedIn}
            />
          )}
        </TitleContainer>

        <MainContentWrapper>
          <Input
            label="Requesting"
            name={`requestedUSDC`}
            value={currentQuote.requestedUSDC}
            onChange={event => handleInputChange(event, 'requestedUSDC')}
            type="number"
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
            accessoryLabel={bestAvailableRateLabel}
            accessoryLabelAlignment="left"
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
              disabled={quoteState !== 'success'}
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

      <>
        <VerticalDivider />
        <InstructionDrawer
          paymentPlatform={paymentPlatform || PaymentPlatform.VENMO}
          recipientAddress={recipientAddress}
          setRecipientAddress={setRecipientAddress}
          isLoggedIn={isLoggedIn}
        />
      </>

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
  padding-top: 32px;
  display: flex;
  flex-direction: column;
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
  margin: 0rem 0.75rem;
  justify-content: space-between;
  align-items: center;
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
  height: 24px;
  border-left: 1px solid #98a1c03d;
  margin: 0 auto;
`;

export default Swap;
