import React, { Suspense, useCallback, useEffect, useMemo, useState, ChangeEvent } from 'react';
import styled from 'styled-components/macro';
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  usePrepareSendTransaction,
  useSendTransaction
} from 'wagmi';
import debounce from 'lodash/debounce';

import { Button } from "@components/common/Button";
import { CustomConnectButton } from "@components/common/ConnectButton";
import { AutoColumn } from '@components/layouts/Column';
import { NetworkSelector } from '@components/Send/NetworkSelector';
import { QuoteDrawer } from '@components/Send/QuoteDrawer';
import { Input } from '@components/Send/Input';
import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';
import { ZERO } from '@helpers/constants';
import { toBigInt, toUsdcString, toTokenString } from '@helpers/units';
import {
  LoginStatus,
  ReceiveNetwork,
  SendTransactionStatus,
  FetchQuoteStatus,
  ReceiveToken,
  receiveTokenData,
  networksInfo,
  baseUSDCTokenData
} from '@helpers/types';
import { resolveEnsName } from '@helpers/ens';
import useAccount from '@hooks/useAccount';
import useBalances from '@hooks/useBalance';
import useSmartContracts from '@hooks/useSmartContracts';
import useSocketBridge from '@hooks/useSocketBridge';
import useSendSettings from '@hooks/useSendSettings';

import baseSvg from '../../assets/images/base.svg';
import sepoliaSvg from '../../assets/images/sepolia.svg';


type RecipientAddress = {
  input: string;
  ensName: string;
  rawAddress: string;
  displayAddress: string;
};

const EMPTY_RECIPIENT_ADDRESS: RecipientAddress = {
  input: '',
  ensName: '',
  rawAddress: '',
  displayAddress: '',
};

export type SendQuote = {
  sendAmountInput: string;
  receiveAmountQuote: SocketReceiveQuote | null;
};

const ZERO_QUOTE: SendQuote = {
  sendAmountInput: '',
  receiveAmountQuote: null
};

export type SocketReceiveQuote = {
  fromAmount?: bigint;
  toAmount: bigint;
  totalGasFeesInUsd?: string;
  serviceTimeSeconds?: number;
  decimals?: number;
  routeData?: any;
};

export default function SendForm() {
  /*
   * Contexts
   */

  const { isLoggedIn, network, loginStatus, loggedInEthereumAddress } = useAccount();
  const { usdcBalance, refetchUsdcBalance, usdcApprovalToSocketBridge, refetchUsdcApprovalToSocketBridge } = useBalances();
  const { blockscanUrl, usdcAddress, usdcAbi, socketBridgeAddress } = useSmartContracts();
  const { getSocketQuote, getSocketTransactionData } = useSocketBridge();
  const { receiveNetwork, receiveToken } = useSendSettings();

  /*
   * State
   */

  const [transactionHash, setTransactionHash] = useState<string>('');

  const [sendState, setSendState] = useState(SendTransactionStatus.DEFAULT);
  const [currentQuote, setCurrentQuote] = useState<SendQuote>(ZERO_QUOTE);

  const [quoteFetchingStatus, setQuoteFetchingStatus] = useState<string>(FetchQuoteStatus.DEFAULT);

  const [recipientAddressInput, setRecipientAddressInput] = useState<RecipientAddress>(EMPTY_RECIPIENT_ADDRESS);

  const [isRecipientInputFocused, setIsRecipientInputFocused] = useState(false);

  const [isValidRecipientAddress, setIsValidRecipientAddress] = useState<boolean>(false);
  const [amountToApprove, setAmountToApprove] = useState<bigint>(ZERO);

  const [socketSendTransactionData, setSocketSendTransactionData] = useState<string>('');

  const [shouldConfigureTransferWrite, setShouldConfigureTransferWrite] = useState<boolean>(false);
  const [shouldConfigureApprovalWrite, setShouldConfigureApprovalWrite] = useState<boolean>(false);
  const [shouldConfigureBridgeWrite, setShouldConfigureBridgeWrite] = useState<boolean>(false);

  /*
   * Contract Writes
   */

  //
  // transfer(address spender, uint256 value)
  //
  const { config: writeTransferConfig } = usePrepareContractWrite({
    address: usdcAddress,
    abi: usdcAbi,
    functionName: "transfer",
    args: [
      recipientAddressInput.rawAddress,
      toBigInt(currentQuote.sendAmountInput.toString()),
    ],
    enabled: shouldConfigureTransferWrite
  });

  const {
    data: submitTransferResult,
    status: signTransferTransactionStatus,
    writeAsync: writeSubmitTransferAsync
  } = useContractWrite(writeTransferConfig);

  const {
    status: mineTransferTransactionStatus,
  } = useWaitForTransaction({
    hash: submitTransferResult ? submitTransferResult.hash : undefined,
    onSuccess(data: any) {
      console.log('writeSubmitTransferAsync successful: ', data);

      setCurrentQuote(ZERO_QUOTE);
      setRecipientAddressInput(EMPTY_RECIPIENT_ADDRESS);

      refetchUsdcBalance?.();

      refetchUsdcApprovalToSocketBridge?.();
    },
  });

  //
  // approve(address spender, uint256 value)
  //
  const { config: writeApproveConfig } = usePrepareContractWrite({
    address: usdcAddress,
    abi: usdcAbi,
    functionName: "approve",
    args: [
      socketBridgeAddress,
      amountToApprove
    ],
    enabled: shouldConfigureApprovalWrite
  });

  const {
    data: submitApproveResult,
    status: signApproveTransactionStatus,
    writeAsync: writeSubmitApproveAsync
  } = useContractWrite(writeApproveConfig);

  const {
    status: mineApproveTransactionStatus
  } = useWaitForTransaction({
    hash: submitApproveResult ? submitApproveResult.hash : undefined,
    onSuccess(data: any) {
      console.log('writeSubmitApproveAsync successful: ', data);
      
      refetchUsdcApprovalToSocketBridge?.();

      refetchUsdcBalance?.();
    },
  });

  //
  // Bridge useContractWrite non-4337
  //

  const { config: writeBridgeConfig } = usePrepareSendTransaction({
    to: socketBridgeAddress,
    data: socketSendTransactionData,
    value: ZERO,
    onError: (error: { message: any }) => {
      console.error(error.message);
    },
    enabled: shouldConfigureBridgeWrite
  });

  const {
    data: submitBridgeResult,
    status: signBridgeTransactionStatus,
    sendTransactionAsync: writeSubmitBridgeAsync
  } = useSendTransaction(writeBridgeConfig);

  const {
    status: mineBridgeTransactionStatus
  } = useWaitForTransaction({
    hash: submitBridgeResult ? submitBridgeResult.hash : undefined,
    onSuccess(data: any) {
      console.log('writeSubmitBridgeAsync successful: ', data);
      
      setCurrentQuote(ZERO_QUOTE);
      setRecipientAddressInput(EMPTY_RECIPIENT_ADDRESS);

      refetchUsdcBalance?.();

      refetchUsdcApprovalToSocketBridge?.();
    },
  });

  /*
   * Handlers
   */

  const handleSendAmountInputChange = async (event: ChangeEvent<HTMLInputElement>, field: keyof SendQuote) => {
    resetSendStateOnInputChangeAfterSuccessfulSend();
    
    const value = event.target.value;
    if (value === "") {
      cancelDebounce();

      setCurrentQuote(ZERO_QUOTE);
    } else if (value === "0") {
      setCurrentQuote({
        ...ZERO_QUOTE,
        [field]: "0"
      });
    } else if (value === ".") {
      setCurrentQuote({
        ...ZERO_QUOTE,
        [field]: "0."
      });
    } else if (isValidSendAmountInput(value)) {
      setCurrentQuote({
        ...ZERO_QUOTE,
        [field]: value
      });

      console.log('event: ', event);

      const baseUsdcToBaseUsdcQuote = await fetchReceiveAmountQuote(value);
      if (baseUsdcToBaseUsdcQuote) {
        setCurrentQuote({
          sendAmountInput: value,
          receiveAmountQuote: baseUsdcToBaseUsdcQuote
        });
      };
    } else {
      cancelDebounce();

      setCurrentQuote({
        sendAmountInput: value,
        receiveAmountQuote: {
          toAmount: ZERO,
          decimals: 6
        }
      });
    }
  };

  const handleRecipientInputChange = async (value: string) => {
    resetSendStateOnInputChangeAfterSuccessfulSend();

    let rawAddress = '';
    let ensName = '';
    let displayAddress = '';
    let isValidAddress = false;

    setRecipientAddressInput({
      input: value,
      ensName,
      rawAddress,
      displayAddress,
    });
  
    if (value.endsWith('.eth') || value.endsWith('.xyz')) {
      ensName = value;
      const resolvedAddress = await resolveEnsName(value);
      if (resolvedAddress) {
        rawAddress = resolvedAddress;
        displayAddress = resolvedAddress;

        const bridgeTransactionData = await updateQuoteAndReturnTxnData(currentQuote.sendAmountInput, resolvedAddress);
        if (bridgeTransactionData) {
          setSocketSendTransactionData(bridgeTransactionData);
        }
        
        isValidAddress = true;
      }
    } else if (value.length === 42 && value.startsWith('0x')) {
      rawAddress = value;
      displayAddress = value;

      const bridgeTransactionData = await updateQuoteAndReturnTxnData(currentQuote.sendAmountInput, value);
      if (bridgeTransactionData) {
        setSocketSendTransactionData(bridgeTransactionData);
      }

      isValidAddress = true;
    };

    setRecipientAddressInput(prevState => ({
      ...prevState,
      ensName: ensName,
      rawAddress: rawAddress,
      displayAddress: displayAddress,
    }));

    setIsValidRecipientAddress(isValidAddress);
  };

  /*
   * Hooks
   */

  useEffect(() => {
    if (socketSendTransactionData) {
      setShouldConfigureBridgeWrite(true);
    } else {
      setShouldConfigureBridgeWrite(false);
    }

  }, [socketSendTransactionData]);

  const debouncedFetchSocketQuote = useCallback(
    debounce(async (sendAmount, recipient?) => {
      // console.log('debouncedFetchSocketQuote called');

      const receiveAmountQuote = await fetchSocketQuote(sendAmount, recipient);
      
      // console.log('receiveAmountQuote:', receiveAmountQuote);

      if (receiveAmountQuote) {
        setCurrentQuote({
          sendAmountInput: sendAmount,
          receiveAmountQuote
        });
      }
    }, 750 // 750ms
  ), [receiveNetwork, receiveToken] );

  const cancelDebounce = () => {
    setQuoteFetchingStatus(FetchQuoteStatus.DEFAULT);

    debouncedFetchSocketQuote.cancel();
  };

  const fetchSocketQuote = async (sendAmount: string, recipient?: string): Promise<SocketReceiveQuote | null> => {
    // console.log('fetchSocketQuote called');

    // console.log("receiveNetwork: ", receiveNetwork);
    // console.log("receiveToken: ", receiveToken);
    // console.log("loggedInEthereumAddress: ", loggedInEthereumAddress);
    // console.log("receiveToken: ", receiveToken);
    // console.log("receiveTokenData: ", receiveTokenData);

    if (!loggedInEthereumAddress || !receiveNetwork || !receiveToken || !receiveTokenData) {
      return null;
    };

    let selectedReceiveTokenData = receiveTokenData[receiveNetwork][receiveToken];
    if (!selectedReceiveTokenData) {
      selectedReceiveTokenData = baseUSDCTokenData;
    };

    setQuoteFetchingStatus(FetchQuoteStatus.LOADING);

    const getSocketQuoteParams = {
      fromAmount: toBigInt(sendAmount).toString(),
      userAddress: loggedInEthereumAddress,
      toChainId: networksInfo[receiveNetwork].networkChainId,
      toTokenAddress: selectedReceiveTokenData.address,
      recipient
    };

    // console.log('getSocketQuote called: ', getSocketQuoteParams);

    const quote = await getSocketQuote(getSocketQuoteParams);
    if (!quote.success || quote.result?.routes?.length === 0) {
      setQuoteFetchingStatus(FetchQuoteStatus.DEFAULT);

      return null;
    };

    // console.log('fetchSocketQuote quote:', quote);

    const bestRoute = quote.result.routes[0];
    const fromAmount = BigInt(bestRoute.fromAmount);
    const toAmount = BigInt(bestRoute.toAmount);
    const totalGasFeesInUsd = bestRoute.totalGasFeesInUsd;
    const serviceTimeSeconds = bestRoute.serviceTime as number;

    setQuoteFetchingStatus(FetchQuoteStatus.LOADED);

    return {
      fromAmount: fromAmount,
      toAmount: toAmount,
      totalGasFeesInUsd: totalGasFeesInUsd,
      serviceTimeSeconds,
      decimals: selectedReceiveTokenData.decimals,
      routeData: bestRoute
    } as SocketReceiveQuote;
  };

  useEffect(() => {
    const updateSendState = async () => {
      const sendAmountInput = currentQuote.sendAmountInput;
      
      // Send Amount Input
      if (!sendAmountInput) { 
        // console.log('MISSING_AMOUNTS');

        setSendState(SendTransactionStatus.MISSING_AMOUNTS);
      } else {
        const usdcBalanceLoaded = usdcBalance !== null;

        if (sendAmountInput && usdcBalanceLoaded) {
          const sendAmountBI = toBigInt(sendAmountInput);
          const isSendAmountGreaterThanBalance = sendAmountBI > usdcBalance;

          if (isSendAmountGreaterThanBalance) {
            // console.log('INSUFFICIENT_BALANCE');

            setSendState(SendTransactionStatus.INSUFFICIENT_BALANCE);
          } else {
            // Receive Quote
            const receiveAmount = currentQuote.receiveAmountQuote;
            const isReceiveAmountZero = receiveAmount?.fromAmount === ZERO;

            if (isReceiveAmountZero) {
              // console.log('INVALID_ROUTES');

              setSendState(SendTransactionStatus.INVALID_ROUTES);
            } else {
              const isNetworkNative = receiveNetwork === ReceiveNetwork.BASE;
              const isTokenUsdc = receiveToken === ReceiveToken.USDC;
              const isNativeTransferTransaction = isNetworkNative && isTokenUsdc;
              
              // Native Base USDC Transfer
              if (isNativeTransferTransaction) {
                if (!recipientAddressInput.input) {
                  // console.log('DEFAULT');

                  setSendState(SendTransactionStatus.DEFAULT);
                } else if (!isValidRecipientAddress) {
                  // console.log('INVALID_RECIPIENT_ADDRESS');

                  setSendState(SendTransactionStatus.INVALID_RECIPIENT_ADDRESS);
                } else {
                  const signingSendTransaction = signTransferTransactionStatus === 'loading';
                  const miningSendTransaction = mineTransferTransactionStatus === 'loading';
    
                  if (signingSendTransaction) {
                    // console.log('TRANSACTION_SIGNING');

                    setSendState(SendTransactionStatus.TRANSACTION_SIGNING);
                  } else if (miningSendTransaction) {
                    // console.log('TRANSACTION_MINING');

                    setSendState(SendTransactionStatus.TRANSACTION_MINING);
                  } else {
                    // console.log('VALID_FOR_NATIVE_TRANSFER');

                    setSendState(SendTransactionStatus.VALID_FOR_NATIVE_TRANSFER);
                  }
                }
              } else {
                // Approval Potentially Required
                const usdcApprovalToSocketBridgeLoaded = usdcApprovalToSocketBridge !== null;

                if (usdcApprovalToSocketBridgeLoaded) {
                  const sendAmountBi = toBigInt(currentQuote.sendAmountInput);
                  const isSendAmountGreaterThanApprovedBalance = sendAmountBi > usdcApprovalToSocketBridge;

                  const signingApproveTransaction = signApproveTransactionStatus === 'loading';
                  const miningApproveTransaction = mineApproveTransactionStatus === 'loading';
                  const successfulApproveTransaction = mineApproveTransactionStatus === 'success';

                  // Approval Required
                  if (isSendAmountGreaterThanApprovedBalance && !successfulApproveTransaction) {
                    if (signingApproveTransaction) {
                      // console.log('TRANSACTION_SIGNING');

                      setSendState(SendTransactionStatus.TRANSACTION_SIGNING);
                    } else if (miningApproveTransaction) {
                      // console.log('TRANSACTION_MINING');

                      setSendState(SendTransactionStatus.TRANSACTION_MINING);
                    } else {
                      // console.log('APPROVAL_REQUIRED');

                      setSendState(SendTransactionStatus.APPROVAL_REQUIRED);
                    }
                  } else {
                    // Approval Not Required, Recipient Address Fork (see below)
                    if (!recipientAddressInput.input) {
                      // console.log('DEFAULT');

                      setSendState(SendTransactionStatus.DEFAULT);
                    } else if (!isValidRecipientAddress) {
                      // console.log('INVALID_RECIPIENT_ADDRESS');

                      setSendState(SendTransactionStatus.INVALID_RECIPIENT_ADDRESS);
                    } else {
                      const signingBridgeTransaction = signBridgeTransactionStatus === 'loading';
                      const miningBridgeTransaction = mineBridgeTransactionStatus === 'loading';
        
                      if (signingBridgeTransaction) {
                        // console.log('TRANSACTION_SIGNING');

                        setSendState(SendTransactionStatus.TRANSACTION_SIGNING);
                      } else if (miningBridgeTransaction) {
                        // console.log('TRANSACTION_MINING');

                        setSendState(SendTransactionStatus.TRANSACTION_MINING);
                      } else {
                        if (shouldConfigureBridgeWrite) {
                          // console.log('VALID_FOR_BRIDGE');

                          setSendState(SendTransactionStatus.VALID_FOR_BRIDGE);
                        } else {
                          // todo: bridge transaction has not been configured yet
                          // console.log('INVALID_FOR_BRIDGE')
                        }
                      }
                    }
                  }
                } else {
                  // console.log('MISSING_AMOUNTS');

                  setSendState(SendTransactionStatus.MISSING_AMOUNTS);
                }
              }
            }
          }
        } else {
          // console.log('MISSING_AMOUNTS');

          setSendState(SendTransactionStatus.MISSING_AMOUNTS);
        }
      }
    }

    updateSendState();
  }, [
      recipientAddressInput.input,
      currentQuote,
      receiveToken,
      receiveNetwork,
      usdcBalance,
      isValidRecipientAddress,
      signApproveTransactionStatus,
      mineApproveTransactionStatus,
      signTransferTransactionStatus,
      mineTransferTransactionStatus,
      usdcApprovalToSocketBridge,
      signBridgeTransactionStatus,
      mineBridgeTransactionStatus,
      shouldConfigureBridgeWrite
    ]
  );

  useEffect(() => {
    // todo: for 4337 wallets, skip approval check because we are batching approve + bridge + revoke approval

    const isApprovalRequired = sendState === SendTransactionStatus.APPROVAL_REQUIRED;
    setShouldConfigureApprovalWrite(isApprovalRequired);
    
    setShouldConfigureTransferWrite(sendState === SendTransactionStatus.VALID_FOR_NATIVE_TRANSFER);
  }, [sendState]);

  useEffect(() => {
    if (submitTransferResult?.hash) {
      setTransactionHash(submitTransferResult.hash);
    }
  }, [submitTransferResult])


  useEffect(() => {
    // todo: skip approval if 4337 wallet

    const usdcApprovalToSocketBridgeLoaded = usdcApprovalToSocketBridge !== null && usdcApprovalToSocketBridge !== undefined;
    const sendAmountInput = currentQuote.sendAmountInput;

    if (!sendAmountInput || !usdcApprovalToSocketBridgeLoaded) {
      setAmountToApprove(ZERO);
    } else {
      // todo: Check if USDC on Base transfer vs. bridge transaction to skip approval

      const sendAmountBI = toBigInt(sendAmountInput.toString());
      const approvalDifference = sendAmountBI - usdcApprovalToSocketBridge;

      if (approvalDifference > ZERO) {
        setAmountToApprove(sendAmountBI);
      } else {
        setAmountToApprove(ZERO);
      }
    }
  }, [currentQuote.sendAmountInput, usdcApprovalToSocketBridge]
  );

  useEffect(() => {
    setQuoteFetchingStatus(FetchQuoteStatus.DEFAULT);

    if (currentQuote.sendAmountInput) {

      const simulatedEvent = {
        target: {
          value: currentQuote.sendAmountInput,
          name: 'sendAmountInput'
        }
      } as ChangeEvent<HTMLInputElement>;
  
      handleSendAmountInputChange(simulatedEvent, 'sendAmountInput');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiveNetwork, receiveToken, currentQuote.sendAmountInput]);
  
  /*
   * Helpers
   */

  const fetchReceiveAmountQuote = async (inputAmount: string): Promise<SocketReceiveQuote | null> => {
    const isReceiveNetworkBase = receiveNetwork === ReceiveNetwork.BASE;
    const isReceiveTokenUsdc = receiveToken === ReceiveToken.USDC;

    if (isReceiveNetworkBase && isReceiveTokenUsdc) {
      return {
        toAmount: toBigInt(inputAmount),
        decimals: 6
      } as SocketReceiveQuote;
    } else {
      await debouncedFetchSocketQuote(inputAmount);

      return null;
    }
  };

  const updateQuoteAndReturnTxnData = async (inputAmount: string, recipientAddress: string): Promise<string | null> => {
    const isReceiveNetworkBase = receiveNetwork === ReceiveNetwork.BASE;
    const isReceiveTokenUsdc = receiveToken === ReceiveToken.USDC;

    if (isReceiveNetworkBase && isReceiveTokenUsdc) {
      return null;
    } else {
      return await fetchFinalReceiveAmountAndTransactionData(inputAmount, recipientAddress);
    };
  };

  const fetchFinalReceiveAmountAndTransactionData = async (inputAmount: string, recipientAddress: string): Promise<string | null> => {
    const updatedQuote = await fetchSocketQuote(inputAmount, recipientAddress);

    // todo: perform check if updated quote price range moved too much
    // console.log('updatedQuote:', updatedQuote);

    if (!updatedQuote) {
      return null;
    };

    const socketTransactionData = await getSocketTransactionData(updatedQuote.routeData);

    if (!socketTransactionData) {
      return null;
    };

    // console.log('socketTransactionData:', socketTransactionData);

    return socketTransactionData.result.txData;
  };

  function resetSendStateOnInputChangeAfterSuccessfulSend() {
    if (sendState === SendTransactionStatus.TRANSACTION_SUCCEEDED) {
      setSendState(SendTransactionStatus.DEFAULT);
    }
  };

  function isValidSendAmountInput(value: string) {
    const isValid = /^-?\d*(\.\d{0,6})?$/.test(value);
    
    return parseFloat(value) >= 0 && isValid;
  };

  const usdcBalanceLabel = useMemo(() => {
    if (isLoggedIn && usdcBalance !== null) {
      return `Balance: ${toUsdcString(usdcBalance, true)}`
    } else {
      return '';
    }
  }, [usdcBalance, isLoggedIn]);

  const ctaOnClick = async () => {
    switch (sendState) {
      case SendTransactionStatus.APPROVAL_REQUIRED:
        // console.log('ctaOnClick: APPROVAL_REQUIRED');

        try {
          await writeSubmitApproveAsync?.();
        } catch (error) {
          console.log('writeSubmitApproveAsync failed: ', error);
        }
        break;

      case SendTransactionStatus.VALID_FOR_NATIVE_TRANSFER:
        // console.log('ctaOnClick: VALID_FOR_NATIVE_TRANSFER');

        try {
          setTransactionHash('');

          await writeSubmitTransferAsync?.();
        } catch (error) {
          console.log('writeSubmitTransferAsync failed: ', error);
        }
        break;

      case SendTransactionStatus.VALID_FOR_BRIDGE:
        // console.log('ctaOnClick: VALID_FOR_BRIDGE');

        try {
          setTransactionHash('');

          console.log('writeSubmitBridgeAsync:', writeSubmitBridgeAsync);

          await writeSubmitBridgeAsync?.();
        } catch (error) {
          console.log('writeSubmitBridgeAsync failed: ', error);
        }
        break;

      default:
        break;
    }
  }

  const ctaDisabled = (): boolean => {
    switch (sendState) {
      case SendTransactionStatus.DEFAULT:
      case SendTransactionStatus.INSUFFICIENT_BALANCE:
      case SendTransactionStatus.INVALID_RECIPIENT_ADDRESS:
      case SendTransactionStatus.INVALID_ROUTES:
      case SendTransactionStatus.MISSING_AMOUNTS:
      case SendTransactionStatus.TRANSACTION_SIGNING:
      case SendTransactionStatus.TRANSACTION_MINING:
        return true;

      case SendTransactionStatus.APPROVAL_REQUIRED:
      case SendTransactionStatus.VALID_FOR_NATIVE_TRANSFER:
      case SendTransactionStatus.VALID_FOR_BRIDGE:
      case SendTransactionStatus.TRANSACTION_SUCCEEDED:
      default:
        return false;
    }
  };

  const ctaLoading = (): boolean => {
    switch (sendState) {
      case SendTransactionStatus.TRANSACTION_SIGNING:
      case SendTransactionStatus.TRANSACTION_MINING:
        return loginStatus === LoginStatus.AUTHENTICATED;

      default:
        return false;
    }
  };

  const ctaText = (): string => {
    switch (sendState) {
      case SendTransactionStatus.INVALID_RECIPIENT_ADDRESS:
        return 'Invalid recipient address';

      case SendTransactionStatus.MISSING_AMOUNTS:
        return 'Input send amount';

      case SendTransactionStatus.INVALID_ROUTES:
        return 'Invalid routes';
      
      case SendTransactionStatus.INSUFFICIENT_BALANCE:
        const humanReadableUsdcBalance = usdcBalance ? toUsdcString(usdcBalance) : '0';
        return `Insufficient USDC balance: ${humanReadableUsdcBalance}`;

      case SendTransactionStatus.TRANSACTION_SIGNING:
        return 'Signing Transaction';

      case SendTransactionStatus.TRANSACTION_MINING:
        return 'Mining Transaction';

      case SendTransactionStatus.VALID_FOR_NATIVE_TRANSFER:
        return 'Send';

      case SendTransactionStatus.VALID_FOR_BRIDGE:
        const bridgeText = receiveNetwork === ReceiveNetwork.BASE ? 'Send' : 'Bridge';
        return bridgeText;

      case SendTransactionStatus.TRANSACTION_SUCCEEDED:
        return 'Send';

      case SendTransactionStatus.APPROVAL_REQUIRED:
        const usdcApprovalToSocketBridgeString = usdcApprovalToSocketBridge ? toUsdcString(usdcApprovalToSocketBridge) : '0';
        return `Insufficient USDC transfer approval: ${usdcApprovalToSocketBridgeString}`;

      case SendTransactionStatus.DEFAULT:
      default:
        return 'Input recipient address';
    }
  };

  const recipientInputText = (): string => {
    if (isRecipientInputFocused) {
      return recipientAddressInput.input;
    } else {
      if (recipientAddressInput.ensName) {
        return recipientAddressInput.ensName;
      } else if (recipientAddressInput.displayAddress) {
        return recipientAddressInput.displayAddress;
      } else {
        return recipientAddressInput.input;
      }
    }
  };

  const networkSvg = (): string => {
    if (network === 'sepolia') {
      return sepoliaSvg;
    } else {
      return baseSvg;
    }
  };

  const networkName = (): string => {
    if (network === 'sepolia') {
      return 'Sepolia';
    } else {
      return 'Base';
    }
  };

  function receiveAmountInputValue() {
    if (currentQuote.receiveAmountQuote && 
        currentQuote.receiveAmountQuote.toAmount !== undefined && 
        currentQuote.receiveAmountQuote.decimals !== undefined) {

      return toTokenString(currentQuote.receiveAmountQuote.toAmount, currentQuote.receiveAmountQuote.decimals);
    }

    return "0";
  }

  /*
   * Component
   */

  return (
    <Suspense>
      <Wrapper>
        <SendFormContainer>
          <TitleContainer>
            <ThemedText.HeadlineSmall>
              Send
            </ThemedText.HeadlineSmall>
          </TitleContainer>

          <MainContentWrapper>
            <NetworkContainer>
              <NetworkTransitionContainer>
                <NetworkLogoAndNameContainer>
                  <NetworkSvg src={networkSvg()} />

                  <NetworkNameContainer>
                    <NetworkHeader>
                      {'From'}
                    </NetworkHeader>
                    <NetworkNameLabel>
                      {networkName()}
                    </NetworkNameLabel>
                  </NetworkNameContainer>
                </NetworkLogoAndNameContainer>

                <NetworkSelector />
              </NetworkTransitionContainer>
            </NetworkContainer>

            <Input
              label="Amount"
              name={`SendAmount`}
              value={currentQuote.sendAmountInput}
              onChange={event => handleSendAmountInputChange(event, 'sendAmountInput')}
              type="number"
              inputLabel="USDC"
              placeholder="0"
              accessoryLabel={usdcBalanceLabel}
              enableMax={true}
              maxButtonOnClick={() => {
                if (usdcBalance) {
                  const simulatedEvent = {
                    target: {
                      value: toUsdcString(usdcBalance, false),
                      name: 'sendAmountInput'
                    }
                  } as ChangeEvent<HTMLInputElement>;
              
                  handleSendAmountInputChange(simulatedEvent, 'sendAmountInput');
                }
              }}
            />

            <Input
              label="Receive"
              name={`ReceiveAmount`}
              value={receiveAmountInputValue()}
              hasSelector={true}
              onChange={() => {}} // no-op
              readOnly={true}
              type="number"
              inputLabel="USDC"
              placeholder="0"
              accessoryLabel={usdcBalanceLabel}
            />

            <Input
              label="To"
              name={`to`}
              value={recipientInputText()}
              onChange={(e) => {handleRecipientInputChange(e.currentTarget.value)}}
              onFocus={() => setIsRecipientInputFocused(true)}
              onBlur={() => setIsRecipientInputFocused(false)}
              type="string"
              placeholder="Wallet address or ENS name"
              fontSize={24}
            />

            { transactionHash?.length ? (
              <Link
                href={`${blockscanUrl}/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer">
                  <ThemedText.LabelSmall textAlign="center">
                    View on Explorer ↗
                  </ThemedText.LabelSmall>
              </Link>
            ) : null}

            { quoteFetchingStatus !== FetchQuoteStatus.DEFAULT ? (
              <QuoteDrawer
                isLoading={quoteFetchingStatus === FetchQuoteStatus.LOADING}
                totalGasFeeUsd={currentQuote.receiveAmountQuote?.totalGasFeesInUsd}
                serviceTimeSeconds={currentQuote.receiveAmountQuote?.serviceTimeSeconds}
              />
            ) : null}

            <ButtonContainer>
              {!isLoggedIn ? (
                <CustomConnectButton
                  fullWidth={true}
                />
              ) : (
                <Button
                  fullWidth={true}
                  disabled={ctaDisabled()}
                  loading={ctaLoading()}
                  onClick={async () => {
                    ctaOnClick();
                  }}>
                  { ctaText() }
                </Button>
               )}
            </ButtonContainer>
          </MainContentWrapper>
        </SendFormContainer>
      </Wrapper>
    </Suspense>
  );
};

const Wrapper = styled.div`
  width: 100%;
  max-width: 484px;
  padding-top: 32px;
  display: flex;
  flex-direction: column;
`;

const SendFormContainer = styled(AutoColumn)`
  border-radius: 16px;
  padding: 1rem;
  gap: 1rem;
  background-color: ${colors.container};
  border: 1px solid #98a1c03d;
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

const NetworkContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const NetworkTransitionContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;
`;

const NetworkLogoAndNameContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 188px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  gap: 1rem;
  align-items: center;
  justify-content: flex-start;
  background: #141A2A;
  padding: 1.05rem 1rem;
`;

const NetworkNameContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  justify-content: center;
  align-items: center;
  text-align: left;
`;

const NetworkHeader = styled.div`
  font-size: 14px;
  color: #CED4DA;
`;

const NetworkNameLabel = styled.div`
  font-size: 16px;
  color: #6C757D;
`;

const NetworkSvg = styled.img`
  width: 32px;
  height: 32px;
`;

const Link = styled.a`
  white-space: pre;
  display: inline-block;
  color: #1F95E2;
  text-decoration: none;
  padding: 1rem;
  justify-content: center;

  &:hover {
    text-decoration: underline;
  }
`;

const ButtonContainer = styled.div`
  width: 100%;
`;
