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
import { usePrepareContractBatchWrite, useContractBatchWrite  } from "@zerodev/wagmi";

import { Button } from "@components/common/Button";
import { CustomConnectButton } from "@components/common/ConnectButton";
import { AutoColumn } from '@components/layouts/Column';
import { NetworkSelector } from '@components/Send/NetworkSelector';
import { QuoteDrawer } from '@components/Send/QuoteDrawer';
import { Input } from '@components/Send/Input';
import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';
import { ZERO, SOCKET_QUOTE_DEFAULT_ADDRESS, QUOTE_FETCHING_DEBOUNCE_MS } from '@helpers/constants';
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
  bridgeName?: string;
  decimals?: number;
  totalGasFeesWei?: bigint;
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
  const [shouldConfigureBatchBridgeWrite, setShouldConfigureBatchBridgeWrite] = useState<boolean>(false);

  /*
   * Contract Writes
   */

  const { config: batchWriteApproveAndBridgeConfig } = usePrepareContractBatchWrite({
    calls: [
      {
        address: usdcAddress as `0x${string}`,
        abi: usdcAbi,
        functionName: "approve",
        args: [
          socketBridgeAddress,
          amountToApprove
        ]
      },
      {
        to: socketBridgeAddress as `0x${string}`,
        data: socketSendTransactionData as `0x${string}`,
      }
    ],
    enabled: shouldConfigureBatchBridgeWrite
  });

  const {
    data: batchWriteApproveAndBridgeResult,
    status: batchWriteApproveAndBridgeStatus,
    sendUserOperationAsync: batchWriteApproveAndBridgeAsync,
  } = useContractBatchWrite(batchWriteApproveAndBridgeConfig);

  const {
    status: mineBatchApproveAndBridgeStatus,
  } = useWaitForTransaction({
    hash: batchWriteApproveAndBridgeResult ? batchWriteApproveAndBridgeResult.hash : undefined,
    onSuccess(data: any) {
      console.log('batchWriteApproveAndBridgeAsync successful: ', data);

      setCurrentQuote(ZERO_QUOTE);
      setRecipientAddressInput(EMPTY_RECIPIENT_ADDRESS);

      refetchUsdcBalance?.();

      refetchUsdcApprovalToSocketBridge?.();
    },
  });

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
    resetStateOnInputChanges();
    
    const value = event.target.value;
    if (value === "") {
      cancelDebounceFetchIndicativeQuote();

      cancelDebounceFetchFormQuote();

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
      updateQuoteOnInputChange(value, recipientAddressInput.rawAddress);
    } else {
      cancelDebounceFetchIndicativeQuote();

      cancelDebounceFetchFormQuote();

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
    resetStateOnInputChanges();

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

        updateQuoteOnInputChange(currentQuote.sendAmountInput, resolvedAddress);
        isValidAddress = true;
      }
    } else if (value.startsWith('0x') && value.length === 42) {
      rawAddress = value;
      displayAddress = value;

      updateQuoteOnInputChange(currentQuote.sendAmountInput, value);
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
            const isQuoteLoading = quoteFetchingStatus === FetchQuoteStatus.LOADING;
            const isReceiveAmountNull = !receiveAmount?.toAmount;

            if (isQuoteLoading) {
              // console.log('FETCHING_QUOTE');

              setSendState(SendTransactionStatus.FETCHING_QUOTE);
            } else if (isReceiveAmountNull && !isQuoteLoading) {
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
                  const loginStatusRequiresApproval = loginStatus === LoginStatus.EOA;

                  const signingApproveTransaction = signApproveTransactionStatus === 'loading';
                  const miningApproveTransaction = mineApproveTransactionStatus === 'loading';
                  const successfulApproveTransaction = mineApproveTransactionStatus === 'success';

                  // Approval Required
                  if (isSendAmountGreaterThanApprovedBalance && !successfulApproveTransaction && loginStatusRequiresApproval) {
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
                      const signingBatchWriteApproveAndBridgeStatusLoading = batchWriteApproveAndBridgeStatus === 'loading';
                      const mineBatchApproveAndBridgeStatusLoading = mineBatchApproveAndBridgeStatus === 'loading';
                      const signingBridgeTransaction = signBridgeTransactionStatus === 'loading';
                      const miningBridgeTransaction = mineBridgeTransactionStatus === 'loading';
        
                      if (signingBridgeTransaction || signingBatchWriteApproveAndBridgeStatusLoading) {
                        // console.log('TRANSACTION_SIGNING');

                        setSendState(SendTransactionStatus.TRANSACTION_SIGNING);
                      } else if (miningBridgeTransaction || mineBatchApproveAndBridgeStatusLoading) {
                        // console.log('TRANSACTION_MINING');

                        setSendState(SendTransactionStatus.TRANSACTION_MINING);
                      } else {
                        if (shouldConfigureBridgeWrite || shouldConfigureBatchBridgeWrite) {
                          if (isSendAmountGreaterThanApprovedBalance) {
                            // console.log('VALID_FOR_BATCH_TRANSFER_BRIDGE');
  
                            setSendState(SendTransactionStatus.VALID_FOR_BATCH_TRANSFER_BRIDGE);
                          } else {
                            // console.log('VALID_FOR_BRIDGE');
  
                            setSendState(SendTransactionStatus.VALID_FOR_BRIDGE);
                          }
                        } else {
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
      quoteFetchingStatus,
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
      shouldConfigureBridgeWrite,
      loginStatus,
      batchWriteApproveAndBridgeStatus,
      mineBatchApproveAndBridgeStatus,
      shouldConfigureBatchBridgeWrite
    ]
  );

  const debouncedFetchIndicativeQuote = useCallback(
    debounce(async (sendAmount, recipient?) => {
      const receiveAmountQuote = await fetchSocketQuote(sendAmount, recipient);
      
      console.log('fetchedIndicativeQuote:', receiveAmountQuote);

      if (receiveAmountQuote) {
        setCurrentQuote({
          sendAmountInput: sendAmount,
          receiveAmountQuote
        });
      }
    }, QUOTE_FETCHING_DEBOUNCE_MS
  ), [receiveNetwork, receiveToken]);

  const debouncedFetchFirmQuote = useCallback(
    debounce(async (sendAmount, recipient) => {
      await fetchFirmQuoteAndTxnData(sendAmount, recipient);
    }, QUOTE_FETCHING_DEBOUNCE_MS
  ), [receiveNetwork, receiveToken]);

  useEffect(() => {
    if (socketSendTransactionData) {
      if (amountToApprove > ZERO) {
        setShouldConfigureBatchBridgeWrite(true);
      } else {
        setShouldConfigureBridgeWrite(true);

        setShouldConfigureBatchBridgeWrite(false);
      }
    } else {
      setShouldConfigureBridgeWrite(false);

      setShouldConfigureBatchBridgeWrite(false);
    };

  }, [socketSendTransactionData, amountToApprove]);

  useEffect(() => {
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
    if (submitBridgeResult?.hash) {
      setTransactionHash(submitBridgeResult.hash);
    }
  }, [submitBridgeResult])

  useEffect(() => {
    const usdcApprovalToSocketBridgeLoaded = usdcApprovalToSocketBridge !== null && usdcApprovalToSocketBridge !== undefined;
    const sendAmountInput = currentQuote.sendAmountInput;

    if (!sendAmountInput || !usdcApprovalToSocketBridgeLoaded) {
      setAmountToApprove(ZERO);
    } else {
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
    updateQuoteOnInputChange(currentQuote.sendAmountInput, recipientAddressInput.rawAddress);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiveNetwork, receiveToken, usdcApprovalToSocketBridge]);
  
  /*
   * Helpers
   */

  const updateQuoteOnInputChange = async (inputAmount?: string, recipientAddress?: string) => {
    setSocketSendTransactionData('');

    const sendInputValue = inputAmount;
    if (!sendInputValue) {
      return;
    };

    setCurrentQuote({
      ...ZERO_QUOTE,
      sendAmountInput: inputAmount
    });

    const isReceiveNetworkBase = receiveNetwork === ReceiveNetwork.BASE;
    const isReceiveTokenUsdc = receiveToken === ReceiveToken.USDC;
    const isValidRecipientAddressPresent = recipientAddress;

    if (isReceiveNetworkBase && isReceiveTokenUsdc) {               // Base USDC to Base USDC
      setQuoteFetchingStatus(FetchQuoteStatus.DEFAULT);

      const baseUsdcToBaseUsdcQuote = {
        toAmount: toBigInt(sendInputValue),
        decimals: 6
      } as SocketReceiveQuote;

      setCurrentQuote({
        sendAmountInput: sendInputValue,
        receiveAmountQuote: baseUsdcToBaseUsdcQuote
      });
    } else if (isValidRecipientAddressPresent) {                    // Recipient Address exists, fetch txn data
      setQuoteFetchingStatus(FetchQuoteStatus.LOADING);

      debouncedFetchFirmQuote(sendInputValue, recipientAddress);
    } else {                                                        // Fetch indicative quote
      setQuoteFetchingStatus(FetchQuoteStatus.LOADING);
      
      debouncedFetchIndicativeQuote(sendInputValue);
    }
  };

  /*
   * Indicative Quote
   */

  const cancelDebounceFetchIndicativeQuote = () => {
    setQuoteFetchingStatus(FetchQuoteStatus.DEFAULT);

    debouncedFetchIndicativeQuote.cancel();
  };

  const cancelDebounceFetchFormQuote = () => {
    setQuoteFetchingStatus(FetchQuoteStatus.DEFAULT);

    debouncedFetchFirmQuote.cancel();
  };

  const fetchSocketQuote = async (sendAmount: string, recipient?: string): Promise<SocketReceiveQuote | null> => {
    if (!receiveNetwork || !receiveToken || !receiveTokenData) {
      return null;
    };

    let selectedReceiveTokenData = receiveTokenData[receiveNetwork][receiveToken];
    if (!selectedReceiveTokenData) {
      selectedReceiveTokenData = baseUSDCTokenData;
    };

    const getSocketQuoteParams = {
      fromAmount: toBigInt(sendAmount).toString(),
      userAddress: loggedInEthereumAddress || SOCKET_QUOTE_DEFAULT_ADDRESS,
      toChainId: networksInfo[receiveNetwork].networkChainId,
      toTokenAddress: selectedReceiveTokenData.address,
      recipient
    };

    console.log('getSocketQuote params: ', getSocketQuoteParams);

    const quote = await getSocketQuote(getSocketQuoteParams);
    if (!quote.success || quote.result?.routes?.length === 0) {
      setQuoteFetchingStatus(FetchQuoteStatus.DEFAULT);

      return null;
    };

    console.log('getSocketQuote response:', quote);

    const bestRoute = quote.result.routes[0];
    const fromAmount = BigInt(bestRoute.fromAmount);
    const toAmount = BigInt(bestRoute.toAmount);
    const totalGasFeesInUsd = bestRoute.totalGasFeesInUsd;
    const serviceTimeSeconds = bestRoute.serviceTime as number;

    const usedBridgeNames = bestRoute.usedBridgeNames;
    const usedDexName = bestRoute.usedDexName;
    const bridgeName = usedBridgeNames ? usedBridgeNames[0] : usedDexName;

    const userTxns = bestRoute.userTxs;
    const totalGasFees = userTxns.reduce((cumulativeFees: bigint, txn: any) => {
      return cumulativeFees + BigInt(txn.gasFees.gasAmount)
    }, ZERO);

    setQuoteFetchingStatus(FetchQuoteStatus.LOADED);

    return {
      fromAmount: fromAmount,
      toAmount: toAmount,
      totalGasFeesInUsd: totalGasFeesInUsd,
      serviceTimeSeconds,
      decimals: selectedReceiveTokenData.decimals,
      bridgeName: bridgeName,
      routeData: bestRoute,
      totalGasFeesWei: totalGasFees
    } as SocketReceiveQuote;
  };

  /*
   * Firm Quote
   */

  const fetchFirmQuoteAndTxnData = async (inputAmount: string, recipientAddress: string) => {
    const updatedQuote = await fetchSocketQuote(inputAmount, recipientAddress);

    console.log('fetchedFirmQuote:', updatedQuote);
    
    // todo: perform check if updated quote price range moved too much
    if (!updatedQuote) {
      return;
    };

    const socketTransactionData = await getSocketTransactionData(updatedQuote.routeData);
    if (!socketTransactionData) {
      return;
    };

    setCurrentQuote({
      sendAmountInput: inputAmount,
      receiveAmountQuote: updatedQuote
    });

    setSocketSendTransactionData(socketTransactionData.result.txData);
  };

  function resetStateOnInputChanges() {
    if (transactionHash) {
      setTransactionHash('');
    };

    if (socketSendTransactionData) {
      setSocketSendTransactionData('');
    };

    if (sendState === SendTransactionStatus.TRANSACTION_SUCCEEDED) {
      setSendState(SendTransactionStatus.DEFAULT);
    };
  };

  /*
   * Other Helpers
   */

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
        try {
          await writeSubmitApproveAsync?.();
        } catch (error) {
          console.log('writeSubmitApproveAsync failed: ', error);
        }
        break;

      case SendTransactionStatus.VALID_FOR_NATIVE_TRANSFER:
        try {
          await writeSubmitTransferAsync?.();
        } catch (error) {
          console.log('writeSubmitTransferAsync failed: ', error);
        }
        break;

      case SendTransactionStatus.VALID_FOR_BATCH_TRANSFER_BRIDGE:
        try {
          await batchWriteApproveAndBridgeAsync?.();
        } catch (error) {
          console.log('batchWriteApproveAndBridgeAsync failed: ', error);
        }
        break;

      case SendTransactionStatus.VALID_FOR_BRIDGE:
        try {
          await writeSubmitBridgeAsync?.();
        } catch (error) {
          console.log('writeSubmitBridgeAsync failed: ', error);
        }
        break;

      default:
        break;
    }
  };

  const ctaDisabled = (): boolean => {
    switch (sendState) {
      case SendTransactionStatus.DEFAULT:
      case SendTransactionStatus.INSUFFICIENT_BALANCE:
      case SendTransactionStatus.INVALID_RECIPIENT_ADDRESS:
      case SendTransactionStatus.INVALID_ROUTES:
      case SendTransactionStatus.MISSING_AMOUNTS:
      case SendTransactionStatus.TRANSACTION_SIGNING:
      case SendTransactionStatus.TRANSACTION_MINING:
      case SendTransactionStatus.FETCHING_QUOTE:
        return true;

      case SendTransactionStatus.APPROVAL_REQUIRED:
      case SendTransactionStatus.VALID_FOR_NATIVE_TRANSFER:
      case SendTransactionStatus.VALID_FOR_BRIDGE:
      case SendTransactionStatus.VALID_FOR_BATCH_TRANSFER_BRIDGE:
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
      case SendTransactionStatus.FETCHING_QUOTE:
        return 'Fetching quote';
      
      case SendTransactionStatus.INVALID_RECIPIENT_ADDRESS:
        return 'Invalid recipient address';

      case SendTransactionStatus.MISSING_AMOUNTS:
        return 'Input send amount';

      case SendTransactionStatus.INVALID_ROUTES:
        return 'Insufficient amount for bridge';
      
      case SendTransactionStatus.INSUFFICIENT_BALANCE:
        const humanReadableUsdcBalance = usdcBalance ? toUsdcString(usdcBalance) : '0';
        return `Insufficient USDC balance: ${humanReadableUsdcBalance}`;

      case SendTransactionStatus.TRANSACTION_SIGNING:
        return 'Signing Transaction';

      case SendTransactionStatus.TRANSACTION_MINING:
        return 'Mining Transaction';

      case SendTransactionStatus.VALID_FOR_NATIVE_TRANSFER:
        return 'Send';

      case SendTransactionStatus.VALID_FOR_BATCH_TRANSFER_BRIDGE:
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

  const selectorsDisabled = (): boolean => {
    return sendState === SendTransactionStatus.TRANSACTION_SIGNING || sendState === SendTransactionStatus.TRANSACTION_MINING;
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
  };

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

                <NetworkSelector
                  disabled={selectorsDisabled()}
                />
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
              selectorDisabled={selectorsDisabled()}
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

            { quoteFetchingStatus === FetchQuoteStatus.LOADED ? (
              <QuoteDrawer
                isLoading={quoteFetchingStatus === FetchQuoteStatus.LOADING}
                isManagedWallet={loginStatus === LoginStatus.AUTHENTICATED}
                totalGasFeeUsd={currentQuote.receiveAmountQuote?.totalGasFeesInUsd}
                totalGasFeeWei={currentQuote.receiveAmountQuote?.totalGasFeesWei}
                serviceTimeSeconds={currentQuote.receiveAmountQuote?.serviceTimeSeconds}
                bridgeName={currentQuote.receiveAmountQuote?.bridgeName}
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
