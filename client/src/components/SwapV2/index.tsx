import React, { useEffect, useMemo, useState, ChangeEvent } from "react";
import styled from 'styled-components';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';

import { Input } from "@components/SwapV2/Input";
import { OnRamperIntentTable } from '@components/SwapV2/OnRamperIntentTable';
import { AutoColumn } from '@components/layouts/Column';
import { Button } from '@components/common/Button';
import { CustomConnectButton } from "@components/common/ConnectButton";
import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';
import { paymentPlatformInfo, PaymentPlatformType, ReceiveNetwork, ReceiveToken } from '@helpers/types';
import { InstructionDrawer } from '@components/SwapV2/InstructionDrawer';
import { CurrencySelector } from '@components/SwapV2/CurrencySelector';
import { PlatformSelector } from '@components/modals/PlatformSelector';
import { Integration } from '@components/modals/Integration';
import { SettingsDropdown } from './SettingsDropdown';
import { DEPOSIT_REFETCH_INTERVAL, EMPTY_STRING, ZERO } from "@helpers/constants";
import { toBigInt, toUsdcString, conversionRateToMultiplierString } from '@helpers/units';
import useAccount from '@hooks/useAccount';
import useBalances from '@hooks/useBalance';
import useSmartContracts from '@hooks/useSmartContracts';
import useCurator from '@hooks/useCurator';
import usePlatformSettings from "@hooks/usePlatformSettings";
import useQuery from '@hooks/useQuery';

type SwapQuote = {
  requestedUSDC: string;
  fiatToSend: string;
  depositId: bigint;
  conversionRate: bigint;
  hashedOnchainId: string;
};

const ZERO_QUOTE: SwapQuote = {
  requestedUSDC: '',
  fiatToSend: '',
  depositId: ZERO,
  conversionRate: ZERO,
  hashedOnchainId: ''
};

const QuoteState = {
  DEFAULT: 'default',
  EXCEEDS_ORDER_COUNT: 'exceeds-order-count',
  EXCEEDS_MAX_SIZE: 'exceeds-max-size',
  INSUFFICIENT_LIQUIDITY: 'insufficient-liquidity',
  AMOUNT_BELOW_TRANSFER_MIN: 'insufficient-transfer-amount',
  INVALID_RECIPIENT_ADDRESS: 'invalid-recipient-address',
  ORDER_COOLDOWN_PERIOD: 'order-cooldown-period',
  BLOCKED_BY_DEPOSITOR: 'blocked-by-depositor',
  MAINTENANCE: 'maintenance',
  SUCCESS: 'success',
};

interface SwapFormProps {
  onIntentTableRowClick?: () => void;
}

const SwapForm: React.FC<SwapFormProps> = ({
  onIntentTableRowClick,
}: SwapFormProps) => {
  const { navigateWithQuery, queryParams } = useQuery();
  const appIdFromQuery = queryParams.APP_ID;
  const recipientAddressFromQuery = queryParams.RECIPIENT_ADDRESS;
  const amountFromQuery = queryParams.AMOUNT_USDC;
  const networkFromQuery = queryParams.NETWORK;
  const tokenFromQuery = queryParams.TO_TOKEN;

  const { isLoggedIn, loggedInEthereumAddress } = useAccount();
  const { usdcBalance } = useBalances();
  const {
    venmoRampAddress,
    venmoRampAbi,
    hdfcRampAddress,
    hdfcRampAbi,
    garantiRampAddress,
    garantiRampAbi,
    revolutRampAddress,
    revolutRampAbi,
    usdcAddress,
    escrowAddress,
    escrowAbi,
    venmoReclaimVerifierAddress
  } = useSmartContracts();
  const { paymentPlatform, PaymentPlatform, currencyIndex } = usePlatformSettings();

  // New backend integration
  const {
    quoteMinFiatForExactToken,
    // quoteMaxTokenForExactFiat, TODO: implement
    signalIntentOnCurator
  } = useCurator();

  /*
   * State
   */
  const [quoteState, setQuoteState] = useState(QuoteState.DEFAULT);
  const [currentQuote, setCurrentQuote] = useState<SwapQuote>(ZERO_QUOTE);
  const [recipientAddress, setRecipientAddress] = useState<string>('');

  const [verifierAddress, setVerifierAddress] = useState<string | null>(null);
  const [fiatCurrencyCode, setFiatCurrencyCode] = useState<string | null>(null);
  const [gatingServiceSignature, setGatingServiceSignature] = useState<string | null>(null);
  const [shouldConfigureSignalIntentWrite, setShouldConfigureSignalIntentWrite] = useState<boolean>(false);

  const [shouldAutoSelectIntent, setShouldAutoSelectIntent] = useState<boolean>(false);
  const [shouldShowIntegrationModal, setShouldShowIntegrationModal] = useState<boolean>(false);

  // We may not have these concepts anymore since we rely entirely on backend quotes
  const currentIntentHash = null; // For simplicity, assume no open intents fetched yet

  /*
   * Event Handlers
   */

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>, field: keyof SwapQuote) => {
    const value = event.target.value;
    const quoteCopy = { ...currentQuote };

    if (field === 'requestedUSDC') {
      setShouldConfigureSignalIntentWrite(false);

      if (value === "" || value === "0" || value === ".") {
        const zeroQuoteCopy = { ...ZERO_QUOTE };
        zeroQuoteCopy[field] = value;
        setCurrentQuote(zeroQuoteCopy);
      } else if (isValidInput(value)) {
        quoteCopy[field] = value;
        setCurrentQuote(quoteCopy);
      }
    } else if (field === 'depositId' || field === 'conversionRate') {
      quoteCopy[field] = BigInt(value);
      setCurrentQuote(quoteCopy);
    } else {
      quoteCopy[field] = value;
      setCurrentQuote(quoteCopy);
    }
  };

  const handleEnterPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAdd(event as any);
    }
  };

  const handleAdd = (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setCurrentQuote(ZERO_QUOTE);
  };

  /*
   * Contract Writes
   */

  const { config: writeIntentConfig } = usePrepareContractWrite({
    address: escrowAddress as `0x${string}`,
    abi: escrowAbi ? JSON.parse(JSON.stringify(escrowAbi)) : [],
    functionName: 'signalIntent',
    args: [
      currentQuote.depositId,
      toBigInt(currentQuote.requestedUSDC),
      recipientAddress,
      verifierAddress,
      fiatCurrencyCode, // TODO
      gatingServiceSignature
    ],
    onError: (error: { message: any }) => {
      console.error(error.message);
    },
    enabled: shouldConfigureSignalIntentWrite && Boolean(escrowAddress) && Boolean(verifierAddress) && Boolean(gatingServiceSignature) && Array.isArray(JSON.parse(JSON.stringify(escrowAbi || "[]")))
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
    onSuccess(data: any) {
      console.log('writeSubmitIntentAsync successful: ', data);
      setShouldConfigureSignalIntentWrite(false);
      setCurrentQuote(ZERO_QUOTE);

      // If you have refetch functions for intent or deposits, call them here
      // refetchIntentHash?.();
      // refetchIntentHashAsUint?.();
      // refetchLastOnRampTimestamp?.();

      setShouldAutoSelectIntent(true);
    },
  });

  /*
   * Hooks
   */

  useEffect(() => {
    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setVerifierAddress(venmoReclaimVerifierAddress);
        setFiatCurrencyCode("0xbba694ae319758680b969f5b850cf8e66124d6c2703374d628a18bd3d4bc75e9");
        break;
      default:
        break;
    }
  }, [escrowAddress, escrowAbi]);

  // Auto-fill recipient address from query or logged-in address
  useEffect(() => {
    if (
      recipientAddressFromQuery &&
      networkFromQuery === ReceiveNetwork.BASE &&
      tokenFromQuery === ReceiveToken.USDC
    ) {
      setRecipientAddress(recipientAddressFromQuery);
    } else if (loggedInEthereumAddress) {
      setRecipientAddress(loggedInEthereumAddress);
    } else {
      setRecipientAddress('');
    }
  }, [loggedInEthereumAddress, recipientAddressFromQuery, networkFromQuery, tokenFromQuery]);

  // Auto-fill requested amount from query
  useEffect(() => {
    if (amountFromQuery && isValidInput(amountFromQuery)) {
      setCurrentQuote(prevQuote => ({
        ...prevQuote,
        requestedUSDC: amountFromQuery
      }));
    }
  }, [amountFromQuery]);

  // Show integration modal if we have appIdFromQuery or recipientAddressFromQuery
  useEffect(() => {
    if (appIdFromQuery || recipientAddressFromQuery) {
      setShouldShowIntegrationModal(true);
    } else {
      setShouldShowIntegrationModal(false);
    }
  }, [appIdFromQuery, recipientAddressFromQuery]);

  // Fetch and verify quote whenever requestedUSDC or recipientAddress changes
  useEffect(() => {
    const fetchQuote = async () => {
      const requestedUsdcAmount = currentQuote.requestedUSDC;
      const isRequestedUsdcAmountPositive = requestedUsdcAmount !== '0' && requestedUsdcAmount !== '';
      const isValidRequestedUsdcAmount = requestedUsdcAmount && isRequestedUsdcAmountPositive;

      if (!isValidRequestedUsdcAmount) {
        updateQuoteErrorState(QuoteState.DEFAULT);
        setCurrentQuote(prevState => ({
          ...prevState,
          conversionRate: ZERO,
          fiatToSend: '',
          hashedOnchainId: ''
        }));
        return;
      }

      // Ensure we have a valid recipient
      const isRecipientValid = isValidAddress(recipientAddress);
      if (!isRecipientValid) {
        updateQuoteErrorState(QuoteState.INVALID_RECIPIENT_ADDRESS);
        return;
      }

      if (!fiatCurrencyCode) {
        updateQuoteErrorState(QuoteState.INSUFFICIENT_LIQUIDITY);
        return;
      }

      try {
        const response = await quoteMinFiatForExactToken({
          processorNames: ["venmo"], // TODO
          receiveToken: usdcAddress || "",
          fiatCurrencyCode,
          exactTokenAmount: toBigInt(currentQuote.requestedUSDC).toString(),
          caller: loggedInEthereumAddress || ""
        });

        const { minFiatAmount, depositId, bestDeposit } = response.responseObject;

        console.log("response: ", response);

        if (!bestDeposit || !depositId || !minFiatAmount) {
          updateQuoteErrorState(QuoteState.INSUFFICIENT_LIQUIDITY);
          setCurrentQuote(prevState => ({
            ...prevState,
            conversionRate: ZERO,
            fiatToSend: '',
            hashedOnchainId: ''
          }));
          return;
        }

        // Extract conversionRate from bestDeposit. Find the currency that matches fiatCurrencyCode
        let foundConversionRate: bigint = ZERO;
        for (const verifier of bestDeposit.verifiers) {
          const matchingCurrency = verifier.currencies.find((c: any) => c.code.toLowerCase() === fiatCurrencyCode.toLowerCase());
          if (matchingCurrency) {
            foundConversionRate = BigInt(matchingCurrency.conversionRate);
            break;
          }
        }

        // Check transfer min. If paymentPlatform is REVOLUT and amount less than $1.00, error.
        if (paymentPlatform === PaymentPlatform.REVOLUT && Number(minFiatAmount) < 1) {
          updateQuoteErrorState(QuoteState.AMOUNT_BELOW_TRANSFER_MIN);
          return;
        }

        // If we have an open intent already (simulate currentIntentHash), block
        if (currentIntentHash) {
          updateQuoteErrorState(QuoteState.EXCEEDS_ORDER_COUNT);
          return;
        }

        // If all checks out:
        const foundVerifier = bestDeposit.verifiers.find((v: any) => v.verifier === verifierAddress);
        console.log("foundVerifier: ", foundVerifier)
        setCurrentQuote(prevState => ({
          ...prevState,
          fiatToSend: toUsdcString(minFiatAmount, true),
          depositId: BigInt(depositId),
          conversionRate: foundConversionRate,
          hashedOnchainId: foundVerifier?.verificationData?.payeeDetailsHash || ""
        }));
        console.log("currentQuote: ", bestDeposit.verifiers);
        setQuoteState(QuoteState.SUCCESS);

      } catch (error) {
        console.error("Failed to fetch quote:", error);
        updateQuoteErrorState(QuoteState.INSUFFICIENT_LIQUIDITY);
      }
    };

    fetchQuote();
  }, [
    currentQuote.requestedUSDC,
    recipientAddress,
    paymentPlatform,
    isLoggedIn,
    loggedInEthereumAddress,
    quoteMinFiatForExactToken,
    currentIntentHash
  ]);

  /*
   * Handlers
   */

  const setInputToMax = () => {
    // Previously we used getDepositForMaxAvailableTransferSize
    // Now we have no local logic. If needed, implement a call to quoteMaxTokenForExactFiat or a known max.
    // For now, we do nothing or set to a placeholder. 
    console.log("Set to max not implemented. Provide logic if needed.");
  };

  /*
   * Helpers
   */

  const updateQuoteErrorState = (error: string) => {
    console.log('updateQuoteErrorState: ', error);
    setQuoteState(error);
    setShouldConfigureSignalIntentWrite(false);
  };

  function isValidInput(value: any) {
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
      case QuoteState.EXCEEDS_ORDER_COUNT:
        return 'Max one open order';
      case QuoteState.INVALID_RECIPIENT_ADDRESS:
        return 'Invalid recipient address';
      case QuoteState.EXCEEDS_MAX_SIZE:
        // If you have a maximum limit logic, implement here. If not, leave as is.
        return 'Exceeded USDC transfer limit';
      case QuoteState.MAINTENANCE:
        return 'Under maintenance';
      case QuoteState.INSUFFICIENT_LIQUIDITY:
        return 'Insufficient liquidity';
      case QuoteState.AMOUNT_BELOW_TRANSFER_MIN:
        return `Send amount less than minimum: 1.00 ${paymentPlatformInfo[paymentPlatform as PaymentPlatformType].platformCurrencies[currencyIndex]}`;
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
      <SwapFormContainer>
        <TitleContainer>
          <ThemedText.HeadlineMedium>
            Ramp
          </ThemedText.HeadlineMedium>

          {isLoggedIn && (
            <SettingsDropdown
              recipientAddress={recipientAddress}
              setRecipientAddress={setRecipientAddress}
              isLoggedIn={isLoggedIn}
            />
          )}
        </TitleContainer>

        <MainContentWrapper>
          <PlatformCurrencyContainer>
            <PlatformSelector usePillSelector={false} />
            <CurrencySelector />
          </PlatformCurrencyContainer>

          <Input
            label="Requesting"
            name={`requestedUSDC`}
            value={currentQuote.requestedUSDC}
            onChange={event => handleInputChange(event, 'requestedUSDC')}
            type="number"
            inputLabel="USDC"
            accessoryLabel={usdcBalanceLabel}
            enableMax={true}
            maxButtonOnClick={setInputToMax}
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
            inputLabel={paymentPlatformInfo[paymentPlatform as PaymentPlatformType].platformCurrencies[currencyIndex]}
            placeholder="0.00"
            readOnly={true}
          />

          {!isLoggedIn ? (
            <CustomConnectButton fullWidth={true} />
          ) : (
            <CTAButton
              disabled={quoteState !== 'success'}
              loading={isSubmitIntentLoading || isSubmitIntentMining}
              onClick={async () => {
                try {
                  const result = await signalIntentOnCurator({
                    processorName: "venmo",
                    depositId: currentQuote.depositId.toString(),
                    amount: currentQuote.requestedUSDC,
                    hashedOnchainId: currentQuote.hashedOnchainId,
                    toAddress: recipientAddress,
                    processorIntentData: {
                      venmoUsername: "ethereum", // TODO
                    }
                  });
                  console.log("result: ", result);
                  setGatingServiceSignature(result.responseObject.signedIntent);
                  setShouldConfigureSignalIntentWrite(true);
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
      </SwapFormContainer>

      <>
        <VerticalDivider />

        <InstructionDrawer
          paymentPlatform={paymentPlatform || PaymentPlatform.VENMO}
          recipientAddress={recipientAddress}
          setRecipientAddress={setRecipientAddress}
          isLoggedIn={isLoggedIn}
        />
      </>

      {currentIntentHash && (
        <>
          <VerticalDivider />
          <OnRamperIntentTable
            onIntentRowClick={onIntentTableRowClick}
            shouldAutoSelectIntent={shouldAutoSelectIntent}
            resetShouldAutoSelectIntent={() => setShouldAutoSelectIntent(false)}
          />
        </>
      )}

      { shouldShowIntegrationModal && (
        <Integration
          onBackClick={() => setShouldShowIntegrationModal(false)}
        />
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  max-width: 484px;
  display: flex;
  flex-direction: column;

  @media (min-width: 600px) {
    padding-top: 32px;
  }
`;

const SwapFormContainer = styled(AutoColumn)`
  padding: 1rem;
  gap: 1rem;
  background-color: ${colors.container};
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.25);

  @media (min-width: 600px) {
    border-radius: 16px;
    border: 1px solid ${colors.defaultBorderColor};
  }
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

const PlatformCurrencyContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;

  @media (min-width: 600px) {
    flex-direction: row;
  }
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
  border-left: 1px solid ${colors.defaultBorderColor};
  margin: 0 auto;
`;

export default SwapForm;
