import React, { Suspense, useCallback, useEffect, useMemo, useState, ChangeEvent } from 'react';
import styled from 'styled-components/macro';
import { PublicKey } from "@solana/web3.js";
import { getDomainKeySync, NameRegistryState } from "@bonfida/spl-name-service";
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
import { ZERO, SOCKET_QUOTE_DEFAULT_ADDRESS, SOCKET_DEFAULT_SOL_ADDRESS, QUOTE_FETCHING_DEBOUNCE_MS } from '@helpers/constants';
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
import { alchemySolanaConnection } from "index";
import useAccount from '@hooks/useAccount';
import useBalances from '@hooks/useBalance';
import useSmartContracts from '@hooks/useSmartContracts';
import useLifiBridge from '@hooks/useLifiBridge';
import useSendSettings from '@hooks/useSendSettings';

import baseSvg from '../../assets/images/base.svg';
import sepoliaSvg from '../../assets/images/sepolia.svg';


type RecipientAddress = {
  input: string;
  ensName: string;
  rawAddress: string;
  displayAddress: string;
  addressType: string;
};

const EMPTY_RECIPIENT_ADDRESS: RecipientAddress = {
  input: '',
  ensName: '',
  rawAddress: '',
  displayAddress: '',
  addressType: ''
};

export type SendQuote = {
  sendAmountInput: string;
  receiveAmountQuote: LifiReceiveQuote | null;
};

const ZERO_QUOTE: SendQuote = {
  sendAmountInput: '',
  receiveAmountQuote: null
};

export type LifiReceiveQuote = {
  fromAmount?: bigint;
  toAmount: bigint;
  totalGasFeesInUsd?: string;
  serviceTimeSeconds?: number;
  bridgeName?: string;
  decimals?: number;
  totalGasFeesWei?: bigint;
  txData?: any;
};

export default function SendForm() {
  /*
   * Contexts
   */

  const { isLoggedIn, network, loginStatus, loggedInEthereumAddress } = useAccount();
  const { usdcBalance, refetchUsdcBalance, usdcApprovalToLifiBridge, refetchUsdcApprovalToLifiBridge } = useBalances();
  const { blockscanUrl, usdcAddress, usdcAbi, lifiBridgeAddress } = useSmartContracts();
  const { getLifiQuote, getLifiTransactionStatus } = useLifiBridge();
  const { receiveNetwork, receiveToken } = useSendSettings();

  /*
   * State
   */

  const [transactionHash, setTransactionHash] = useState<string>('');
  const [receiveBridgeTransactionLink, setReceiveBridgeTransactionLink] = useState<string>('');

  const [sendState, setSendState] = useState(SendTransactionStatus.DEFAULT);
  const [currentQuote, setCurrentQuote] = useState<SendQuote>(ZERO_QUOTE);

  const [quoteFetchingStatus, setQuoteFetchingStatus] = useState<string>(FetchQuoteStatus.DEFAULT);

  const [recipientAddressInput, setRecipientAddressInput] = useState<RecipientAddress>(EMPTY_RECIPIENT_ADDRESS);

  const [isRecipientInputFocused, setIsRecipientInputFocused] = useState(false);

  const [isValidRecipientAddress, setIsValidRecipientAddress] = useState<boolean>(false);
  const [amountToApprove, setAmountToApprove] = useState<bigint>(ZERO);

  const [lifiSendTransactionData, setLifiSendTransactionData] = useState<string>('');

  const [shouldConfigureApprovalWrite, setShouldConfigureApprovalWrite] = useState<boolean>(false);
  const [shouldConfigureTransferWrite, setShouldConfigureTransferWrite] = useState<boolean>(false);
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
          lifiBridgeAddress,
          amountToApprove
        ]
      },
      {
        to: lifiBridgeAddress as `0x${string}`,
        data: lifiSendTransactionData as `0x${string}`,
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

      resetStateOnSuccessfulTransaction();
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

      resetStateOnSuccessfulTransaction();
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
      lifiBridgeAddress,
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
      
      refetchUsdcApprovalToLifiBridge?.();

      refetchUsdcBalance?.();
    },
  });

  //
  // Bridge useContractWrite non-4337
  //

  const { config: writeBridgeConfig } = usePrepareSendTransaction({
    to: lifiBridgeAddress,
    data: lifiSendTransactionData,
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
      
      resetStateOnSuccessfulTransaction();
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

      cancelDebounceFetchFirmQuote();

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

      cancelDebounceFetchFirmQuote();

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

    const isNetworkSolana = receiveNetwork === ReceiveNetwork.SOLANA;

    setRecipientAddressInput({
      input: value,
      ensName,
      rawAddress,
      displayAddress,
      addressType: isNetworkSolana ? 'sol' : 'eth'
    });
  
    if (isNetworkSolana) {
      if (value.endsWith('.sol')) {
        const { pubkey: recordKey } = getDomainKeySync(value);
        const { registry } = await NameRegistryState.retrieve(alchemySolanaConnection, recordKey);
        const { owner } = registry;

        if (owner) {
          rawAddress = owner.toString();
          displayAddress = value;
    
          updateQuoteOnInputChange(currentQuote.sendAmountInput, owner.toString());
          isValidAddress = true;
        }
      } else if (value.length >= 32 && value.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(value)) {
        try {
          const publicKey = new PublicKey(value);
          const validSolanaAddress = await PublicKey.isOnCurve(publicKey);
          if (validSolanaAddress) {
            rawAddress = value;
            displayAddress = value;
      
            updateQuoteOnInputChange(currentQuote.sendAmountInput, value);
            isValidAddress = true;
          }
        } catch {
          console.log('Invalid Solana address provided');
        }
      }
    } else {
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
    }

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
          const usdcBalanceLoaded = usdcBalance !== null;
          
          if (usdcBalanceLoaded) {
            const sendAmountBI = toBigInt(sendAmountInput);
            const isSendAmountGreaterThanBalance = sendAmountBI > usdcBalance;

            if (isSendAmountGreaterThanBalance) {
              // console.log('INSUFFICIENT_BALANCE');

              setSendState(SendTransactionStatus.INSUFFICIENT_BALANCE);
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
                const usdcApprovalToLifiBridgeLoaded = usdcApprovalToLifiBridge !== null;

                if (usdcApprovalToLifiBridgeLoaded) {
                  const sendAmountBi = toBigInt(currentQuote.sendAmountInput);
                  const isSendAmountGreaterThanApprovedBalance = sendAmountBi > usdcApprovalToLifiBridge;
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
                      const signingBatchWriteApproveAndBridge = batchWriteApproveAndBridgeStatus === 'loading';
                      const miningBatchApproveAndBridge = mineBatchApproveAndBridgeStatus === 'loading';
                      const signingBridgeTransaction = signBridgeTransactionStatus === 'loading';
                      const miningBridgeTransaction = mineBridgeTransactionStatus === 'loading';
        
                      if (signingBridgeTransaction || signingBatchWriteApproveAndBridge) {
                        // console.log('TRANSACTION_SIGNING');

                        setSendState(SendTransactionStatus.TRANSACTION_SIGNING);
                      } else if (miningBridgeTransaction || miningBatchApproveAndBridge) {
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
          } else {
            // console.log('MISSING_AMOUNTS: USDC Balance');

            setSendState(SendTransactionStatus.MISSING_AMOUNTS);    
          }
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
      usdcApprovalToLifiBridge,
      signBridgeTransactionStatus,
      mineBridgeTransactionStatus,
      shouldConfigureBridgeWrite,
      loginStatus,
      batchWriteApproveAndBridgeStatus,
      mineBatchApproveAndBridgeStatus,
      shouldConfigureBatchBridgeWrite
    ]
  );

  useEffect(() => {
    if (lifiSendTransactionData) {
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

  }, [lifiSendTransactionData, amountToApprove]);

  useEffect(() => {
    if (loginStatus === LoginStatus.LOGGED_OUT) {
      resetStateOnSuccessfulTransaction();

      if (transactionHash) {
        setTransactionHash('');
      };

      if (receiveBridgeTransactionLink) {
        setReceiveBridgeTransactionLink('');
      };
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginStatus]);

  useEffect(() => {
    const isApprovalRequired = sendState === SendTransactionStatus.APPROVAL_REQUIRED;
    setShouldConfigureApprovalWrite(isApprovalRequired);
    
    setShouldConfigureTransferWrite(sendState === SendTransactionStatus.VALID_FOR_NATIVE_TRANSFER);
  }, [sendState]);

  useEffect(() => {
    if (submitTransferResult?.hash) {
      setTransactionHash(submitTransferResult.hash);
    };
  }, [submitTransferResult])

  useEffect(() => {
    if (submitBridgeResult?.hash) {
      setTransactionHash(submitBridgeResult.hash);
    };

    let intervalId: any;
    const fetchLifiTransactionStatus = async () => {
      if (receiveNetwork && submitBridgeResult) {
        const transferOutTxnHash = submitBridgeResult.hash;
        const response = await getLifiTransactionStatus(transferOutTxnHash)

        if (response.result?.destinationTransactionHash) {
          const destinationTransactionHash = response.result.destinationTransactionHash;
          const link = `${networksInfo[receiveNetwork].blockExplorer}/tx/${destinationTransactionHash}`;
          setReceiveBridgeTransactionLink(link);

          clearInterval(intervalId);
        };
      };
    };

    if (submitBridgeResult?.hash) {
      intervalId = setInterval(fetchLifiTransactionStatus, 5000);
    }
  
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitBridgeResult])

  useEffect(() => {
    if (batchWriteApproveAndBridgeResult?.hash) {
      setTransactionHash(batchWriteApproveAndBridgeResult.hash);
    };

    let intervalId: any;
    const fetchLifiTransactionStatus = async () => {
      if (receiveNetwork && batchWriteApproveAndBridgeResult) {
        const transferOutTxnHash = batchWriteApproveAndBridgeResult.hash;
        const response = await getLifiTransactionStatus(transferOutTxnHash)

        if (response?.receiving.txHash) {
          const destinationTransactionHash = response.receiving.txHash;
          const link = `${networksInfo[receiveNetwork].blockExplorer}/tx/${destinationTransactionHash}`;
          setReceiveBridgeTransactionLink(link);

          clearInterval(intervalId);
        };
      };
    };

    if (batchWriteApproveAndBridgeResult?.hash) {
      intervalId = setInterval(fetchLifiTransactionStatus, 5000);
    }
  
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchWriteApproveAndBridgeResult])

  useEffect(() => {
    const usdcApprovalToLifiBridgeLoaded = usdcApprovalToLifiBridge !== null && usdcApprovalToLifiBridge !== undefined;
    const sendAmountInput = currentQuote.sendAmountInput;

    if (!sendAmountInput || !usdcApprovalToLifiBridgeLoaded) {
      setAmountToApprove(ZERO);
    } else {
      const sendAmountBI = toBigInt(sendAmountInput.toString());
      const approvalDifference = sendAmountBI - usdcApprovalToLifiBridge;

      if (approvalDifference > ZERO) {
        setAmountToApprove(sendAmountBI);
      } else {
        setAmountToApprove(ZERO);
      }
    }
  }, [currentQuote.sendAmountInput, usdcApprovalToLifiBridge]);

  useEffect(() => {
    let recipientAddressForUpdatedQuote = recipientAddressInput.rawAddress;
    
    const receiveNetworkAddressTypeForRecipient = receiveNetwork === ReceiveNetwork.SOLANA ? 'sol' : 'eth';
    if (receiveNetworkAddressTypeForRecipient !== recipientAddressInput.addressType) {
      recipientAddressForUpdatedQuote = '';

      setRecipientAddressInput(EMPTY_RECIPIENT_ADDRESS);
    };

    updateQuoteOnInputChange(currentQuote.sendAmountInput, recipientAddressForUpdatedQuote);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiveNetwork, receiveToken, usdcApprovalToLifiBridge]);
  
  /*
   * Helpers
   */

  const updateQuoteOnInputChange = async (inputAmount?: string, recipientAddress?: string) => {
    setLifiSendTransactionData('');

    const sendInputValue = inputAmount;
    if (!sendInputValue) {
      return;
    };

    // Each of these triggers different intermediate UI renders
    setCurrentQuote({
      ...ZERO_QUOTE,
      sendAmountInput: inputAmount
    });

    // setCurrentQuote(prevQuote => ({
    //   ...prevQuote,
    //   sendAmountInput: inputAmount
    // }));

    const isReceiveNetworkBase = receiveNetwork === ReceiveNetwork.BASE;
    const isReceiveTokenUsdc = receiveToken === ReceiveToken.USDC;
    const isValidRecipientAddressPresent = recipientAddress;

    if (isReceiveNetworkBase && isReceiveTokenUsdc) {               // Base USDC to Base USDC
      setQuoteFetchingStatus(FetchQuoteStatus.DEFAULT);

      const baseUsdcToBaseUsdcQuote = {
        toAmount: toBigInt(sendInputValue),
        decimals: 6
      } as LifiReceiveQuote;

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

  const debouncedFetchIndicativeQuote = useCallback(
    debounce(async (sendAmount, recipient?) => {
      const receiveAmountQuote = await fetchLifiQuote(sendAmount, recipient);
      
      console.log('fetchedIndicativeQuote:', receiveAmountQuote);

      if (receiveAmountQuote) {
        setCurrentQuote({
          sendAmountInput: sendAmount,
          receiveAmountQuote
        });

        setQuoteFetchingStatus(FetchQuoteStatus.LOADED)
      }
    }, QUOTE_FETCHING_DEBOUNCE_MS
  ), [receiveNetwork, receiveToken] );

  const debouncedFetchFirmQuote = useCallback(
    debounce(async (sendAmount, recipient) => {
      await fetchFirmQuoteAndTxnData(sendAmount, recipient);
    }, QUOTE_FETCHING_DEBOUNCE_MS
  ), [receiveNetwork, receiveToken]);

  /*
   * Indicative Quote
   */

  const cancelDebounceFetchIndicativeQuote = () => {
    setQuoteFetchingStatus(FetchQuoteStatus.DEFAULT);

    debouncedFetchIndicativeQuote.cancel();
  };

  const fetchLifiQuote = async (sendAmount: string, toAddress?: string): Promise<LifiReceiveQuote | null> => {
    if (!receiveNetwork || !receiveToken || !receiveTokenData) {
      return null;
    };

    let selectedReceiveTokenData = receiveTokenData[receiveNetwork][receiveToken];
    if (!selectedReceiveTokenData) {
      selectedReceiveTokenData = baseUSDCTokenData;
    };

    const defaultAddressForQuote = receiveNetwork === ReceiveNetwork.SOLANA ? SOCKET_DEFAULT_SOL_ADDRESS : SOCKET_QUOTE_DEFAULT_ADDRESS;
    const getLifiQuoteParams = {
      fromAmount: toBigInt(sendAmount).toString(),
      fromAddress: loggedInEthereumAddress ?? defaultAddressForQuote,
      toChain: networksInfo[receiveNetwork].networkChainId,
      toToken: selectedReceiveTokenData.address,
      toAddress: toAddress ?? defaultAddressForQuote
    };

    console.log('getLifiQuote params: ', getLifiQuoteParams);

    const quote = await getLifiQuote(getLifiQuoteParams);
    if (!quote) {
      setQuoteFetchingStatus(FetchQuoteStatus.DEFAULT);

      return null;
    };

    console.log('getLifiQuote response:', quote);

    const fromAmount = BigInt(quote.estimate.fromAmount);
    const toAmount = BigInt(quote.estimate.toAmount);
    const totalGasFeesInUsd = quote.estimate.gasCosts[0].amountUSD;
    const serviceTimeSeconds = Math.floor(quote.estimate.executionDuration as number);

    const bridgeName = quote.toolDetails.name;

    const totalGasFees = BigInt(quote.estimate.gasCosts[0].estimate) * BigInt(quote.estimate.gasCosts[0].amount);
    
    return {
      fromAmount: fromAmount,
      toAmount: toAmount,
      totalGasFeesInUsd: totalGasFeesInUsd,
      serviceTimeSeconds,
      decimals: selectedReceiveTokenData.decimals,
      bridgeName: bridgeName,
      totalGasFeesWei: totalGasFees,
      txData: quote.transactionRequest.data
    } as LifiReceiveQuote;
  };

  /*
   * Firm Quote
   */

  const cancelDebounceFetchFirmQuote = () => {
    setQuoteFetchingStatus(FetchQuoteStatus.DEFAULT);

    debouncedFetchFirmQuote.cancel();
  };

  const fetchFirmQuoteAndTxnData = async (inputAmount: string, recipientAddress: string) => {
    const updatedQuote = await fetchLifiQuote(inputAmount, recipientAddress);

    console.log('fetchedFirmQuote:', updatedQuote);

    // todo: perform check if updated quote price range moved too much
    if (!updatedQuote) {
      return;
    };

    setCurrentQuote({
      sendAmountInput: inputAmount,
      receiveAmountQuote: updatedQuote
    });

    setQuoteFetchingStatus(FetchQuoteStatus.LOADED)

    setLifiSendTransactionData(updatedQuote.txData);
  };

  function resetStateOnInputChanges() {
    if (transactionHash) {
      setTransactionHash('');
    };

    if (receiveBridgeTransactionLink) {
      setReceiveBridgeTransactionLink('');
    };

    if (lifiSendTransactionData) {
      setLifiSendTransactionData('');
    };

    if (sendState === SendTransactionStatus.TRANSACTION_SUCCEEDED) {
      setSendState(SendTransactionStatus.DEFAULT);
    };
  };

  function resetStateOnSuccessfulTransaction() {
    setLifiSendTransactionData('');

    setQuoteFetchingStatus(FetchQuoteStatus.DEFAULT);

    setCurrentQuote(ZERO_QUOTE);
    setRecipientAddressInput(EMPTY_RECIPIENT_ADDRESS);

    refetchUsdcBalance?.();

    refetchUsdcApprovalToLifiBridge?.();
  };

  /*
   * Other Helpers
   */

  const recipientPlaceholderLabel = useMemo(() => {
    if (receiveNetwork === ReceiveNetwork.SOLANA) {
      return "Wallet address or SNS name";
    } else {
      return "Wallet address or ENS name";
    }
  }, [receiveNetwork]);

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
        const usdcApprovalToLifiBridgeString = usdcApprovalToLifiBridge ? toUsdcString(usdcApprovalToLifiBridge) : '0';
        return `Insufficient USDC transfer approval: ${usdcApprovalToLifiBridgeString}`;

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

  const shouldDisplayReceiveLink = (): boolean => {
    const isBaseToBaseUSDCTransfer = receiveNetwork === ReceiveNetwork.BASE && receiveToken === ReceiveToken.USDC;

    return !isBaseToBaseUSDCTransfer;
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
              label="To"
              name={`to`}
              value={recipientInputText()}
              onChange={(e) => {handleRecipientInputChange(e.currentTarget.value)}}
              onFocus={() => setIsRecipientInputFocused(true)}
              onBlur={() => setIsRecipientInputFocused(false)}
              type="string"
              placeholder={recipientPlaceholderLabel}
              fontSize={24}
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

            {transactionHash?.length ? (
              <LinkContainer>
                <Link
                  disabled={!transactionHash}
                  href={`${blockscanUrl}/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer">
                    <ThemedText.LabelSmall textAlign="center">
                      {shouldDisplayReceiveLink() ? 'Send Receipt ↗' : 'View on Explorer ↗'}
                    </ThemedText.LabelSmall>
                </Link>

                {shouldDisplayReceiveLink() ? (
                  <Link
                    disabled={!receiveBridgeTransactionLink}
                    href={`${receiveBridgeTransactionLink}`}
                    target="_blank"
                    rel="noopener noreferrer">
                      <ThemedText.LabelSmall textAlign="center">
                        Receive Receipt ↗
                      </ThemedText.LabelSmall>
                  </Link>
                ) : null}
              </LinkContainer>
            ) : null}
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
  border: 1px solid ${colors.defaultBorderColor};
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
  border: 1px solid ${colors.readOnlyInputColor};
  gap: 1rem;
  align-items: center;
  justify-content: flex-start;
  background: ${colors.readOnlyInputColor};
  padding: 1.1rem 1rem;
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
  font-size: 15px;
  color: #6C757D;
`;

const NetworkSvg = styled.img`
  width: 32px;
  height: 32px;
`;

const LinkContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  padding: 0 2.25rem;
`;

interface LinkProps {
  disabled?: boolean;
}

const Link = styled.a<LinkProps>`
  white-space: pre;
  display: inline-block;
  color: #1F95E2;
  text-decoration: none;
  padding: 0.75rem 1rem 0.5rem 1rem;
  justify-content: center;
  align-items: center;
  flex: 1;

  &:hover {
    text-decoration: ${({ disabled }) => disabled ? 'none' : 'underline'};
  }

  ${({ disabled }) => 
    disabled && `
      color: gray;
      pointer-events: none;
      cursor: default;
  `}
`;

const ButtonContainer = styled.div`
  width: 100%;
`;
