import React, { Suspense, useEffect, useMemo, useState, useCallback } from 'react';
import styled from 'styled-components/macro';
import { X } from 'react-feather';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction, useSendTransaction, usePrepareSendTransaction } from 'wagmi';
import debounce from 'lodash/debounce';

import { Button } from "@components/common/Button";
import { CustomConnectButton } from "@components/common/ConnectButton";
import { AutoColumn } from '@components/layouts/Column';
import { NetworkSelector } from '@components/Send/NetworkSelector';
import { Input } from '@components/Send/Input';
import { ThemedText } from '@theme/text'
import { ZERO } from '@helpers/constants';
import { toBigInt, toUsdcString } from '@helpers/units';
import { LoginStatus, SendTransactionStatus } from '@helpers/types';
import { resolveEnsName } from '@helpers/ens';
import { tokens } from '@helpers/tokens';
import useAccount from '@hooks/useAccount';
import useBalances from '@hooks/useBalance';
import useSmartContracts from '@hooks/useSmartContracts';
import useLifiBridge from '@hooks/useLifiBridge';

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

export default function SendForm() {
  /*
   * Contexts
   */

  const { isLoggedIn, network, loginStatus, loggedInEthereumAddress } = useAccount();
  const { usdcBalance, refetchUsdcBalance, usdcApprovalToLifiBridge, refetchUsdcApprovalToLifiBridge } = useBalances();
  const { blockscanUrl, usdcAddress, usdcAbi, lifiBridgeAddress } = useSmartContracts();
  const { getLifiQuotes, getLifiTransactionHistory, getLifiTransactionStatus } = useLifiBridge();

  /*
   * State
   */

  const [transactionHash, setTransactionHash] = useState<string>('');

  const [sendState, setSendState] = useState(SendTransactionStatus.DEFAULT);
  const [sendAmountInput, setSendAmountInput] = useState<string>('');
  const [recipientAddressInput, setRecipientAddressInput] = useState<RecipientAddress>(EMPTY_RECIPIENT_ADDRESS);

  const [isRecipientInputFocused, setIsRecipientInputFocused] = useState(false);

  const [isValidRecipientAddress, setIsValidRecipientAddress] = useState<boolean>(false);
  const [amountToApprove, setAmountToApprove] = useState<bigint>(ZERO);

  const [shouldConfigureTransferWrite, setShouldConfigureTransferWrite] = useState<boolean>(false);
  const [shouldConfigureApprovalWrite, setShouldConfigureApprovalWrite] = useState<boolean>(false);

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
      toBigInt(sendAmountInput.toString()),
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

      setSendAmountInput('');
      setRecipientAddressInput(EMPTY_RECIPIENT_ADDRESS);

      refetchUsdcBalance?.();
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
  // Bridge
  //
  // const { config: writeBridgeConfig } = usePrepareSendTransaction({
  //   to: lifiBridgeAddress,
  //   value: ZERO,
  //   data: lifiQuoteResponse?.transactionRequest.data,
  //   onError: (error: { message: any }) => {
  //     console.error(error.message);
  //   },
  //   enabled: shouldConfigureBridgeWrite
  // });

  // const {
  //   data: submitBridgeResult,
  //   status: signBridgeTransactionStatus,
  //   writeAsync: writeSubmitBridgeAsync
  // } = useContractWrite(writeBridgeConfig);

  // const {
  //   status: mineBridgeTransactionStatus
  // } = useWaitForTransaction({
  //   hash: submitBridgeResult ? submitBridgeResult.hash : undefined,
  //   onSuccess(data: any) {
  //     console.log('writeSubmitBridgeAsync successful: ', data);
      
  //     refetchUsdcApprovalToLifiBridge?.();

  //     refetchUsdcBalance?.();
  //   },
  // });

  /*
   * Handlers
   */

  const handleInputChange = (value: string, setInputFunction: React.Dispatch<React.SetStateAction<string>>) => {
    resetSendStateOnInputChange();

    if (value === "") {
      setInputFunction('');
    } else if (value === ".") {
      setInputFunction('0.');
    } else if (isValidInput(value)) {
      setInputFunction(value);
      // Add debounce
      debouncedGetQuotes(value);
    }
  };

  const handleRecipientInputChange = async (value: string) => {
    resetSendStateOnInputChange();

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
        isValidAddress = true;
      }
    } else if (value.length === 42 && value.startsWith('0x')) {
      rawAddress = value;
      displayAddress = value;
      isValidAddress = true;
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

  const debouncedGetQuotes = useCallback(debounce(async (value) => {
    if (!usdcAddress || !loggedInEthereumAddress || !recipientAddressInput.rawAddress) {
      return;
    }
    const result = await getLifiQuotes({
        fromAmount: value,
        fromToken: tokens['8453']['USDC'].address, // Bridge only works on Mainnet, so we use Base USDC from token constants
        fromAddress: loggedInEthereumAddress,
        toChain: '137', // TODO Hardcoded to Polygon for now
        toToken: tokens['137']['USDCe'].address, // TODO Hardcoded to USDCe for now
        toAddress: recipientAddressInput.rawAddress,
    });
    console.log('lifi', result)
    return result;
  }, 1000), [usdcAddress, loggedInEthereumAddress, recipientAddressInput]); // Adjust the delay as needed

  useEffect(() => {
    const updateSendState = async () => {
      if (!sendAmountInput) { 
        setSendState(SendTransactionStatus.MISSING_AMOUNTS);
      } else {
        const usdcBalanceLoaded = usdcBalance !== null;

        if (sendAmountInput && usdcBalanceLoaded) {
          const sendAmountBI = toBigInt(sendAmountInput);
          const isSendAmountGreaterThanBalance = sendAmountBI > usdcBalance;

          if (isSendAmountGreaterThanBalance) {
            setSendState(SendTransactionStatus.INSUFFICIENT_BALANCE);
          } else {
            if (!recipientAddressInput.input) {
              setSendState(SendTransactionStatus.DEFAULT);
            } else if (!isValidRecipientAddress) {
              setSendState(SendTransactionStatus.INVALID_RECIPIENT_ADDRESS);
            } else {
              const signingSendTransaction = signTransferTransactionStatus === 'loading';
              const miningSendTransaction = mineTransferTransactionStatus === 'loading';

              if (signingSendTransaction) {
                setSendState(SendTransactionStatus.TRANSACTION_SIGNING);
              } else if (miningSendTransaction) {
                setSendState(SendTransactionStatus.TRANSACTION_MINING);
              } else {
                setSendState(SendTransactionStatus.VALID);
              }
            }
          }
        } else {
          setSendState(SendTransactionStatus.MISSING_AMOUNTS);
        }
      }
    }

    updateSendState();
  }, [
      recipientAddressInput.input,
      sendAmountInput,
      usdcBalance,
      isValidRecipientAddress,
      signTransferTransactionStatus,
      mineTransferTransactionStatus
    ]
  );

  useEffect(() => {
    // TODO: for 4337 wallets, skip approval check because we are batching approve + bridge + revoke approval
    const isApprovalRequired = sendState === SendTransactionStatus.APPROVAL_REQUIRED;
    setShouldConfigureApprovalWrite(isApprovalRequired);
    
    setShouldConfigureTransferWrite(sendState === SendTransactionStatus.VALID);
  }, [sendState]);

  useEffect(() => {
    if (submitTransferResult?.hash) {
      setTransactionHash(submitTransferResult.hash);
    }
  }, [submitTransferResult])


  useEffect(() => {
    // TODO: skip approval if 4337 wallet
    const usdcApprovalToLifiBridgeLoaded = usdcApprovalToLifiBridge !== null && usdcApprovalToLifiBridge !== undefined;

    if (!sendAmountInput || !usdcApprovalToLifiBridgeLoaded) {
      setAmountToApprove(ZERO);
    } else {
      // TODO: Check if USDC on Base transfer vs bridge transaction to skip approval
      const depositAmountBI = toBigInt(sendAmountInput.toString());
      const approvalDifference = depositAmountBI - usdcApprovalToLifiBridge;
      if (approvalDifference > ZERO) {
        setAmountToApprove(depositAmountBI);
      } else {
        setAmountToApprove(ZERO);
      }
    }
  }, [sendAmountInput, usdcApprovalToLifiBridge]);
  
  /*
   * Helpers
   */

  function resetSendStateOnInputChange() {
    if (sendState === SendTransactionStatus.TRANSACTION_SUCCEEDED) {
      setSendState(SendTransactionStatus.DEFAULT);
    }
  };

  function isValidInput(value: string) {
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

  const ctaDisabled = (): boolean => {
    switch (sendState) {
      case SendTransactionStatus.DEFAULT:
      case SendTransactionStatus.INSUFFICIENT_BALANCE:
      case SendTransactionStatus.INVALID_RECIPIENT_ADDRESS:
      case SendTransactionStatus.MISSING_AMOUNTS:
      case SendTransactionStatus.TRANSACTION_SIGNING:
      case SendTransactionStatus.TRANSACTION_MINING:
        return true;

      case SendTransactionStatus.APPROVAL_REQUIRED:
      case SendTransactionStatus.VALID:
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
      
      case SendTransactionStatus.INSUFFICIENT_BALANCE:
        const humanReadableUsdcBalance = usdcBalance ? toUsdcString(usdcBalance) : '0';
        return `Insufficient USDC balance: ${humanReadableUsdcBalance}`;

      case SendTransactionStatus.TRANSACTION_SIGNING:
        return 'Signing Transaction';

      case SendTransactionStatus.TRANSACTION_MINING:
        return 'Mining Transaction';

      case SendTransactionStatus.VALID:
        return 'Send';

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
              value={sendAmountInput}
              onChange={(e) => handleInputChange(e.currentTarget.value, setSendAmountInput)}
              type="number"
              inputLabel="USDC"
              placeholder="0"
              accessoryLabel={usdcBalanceLabel}
              enableMax={true}
              maxButtonOnClick={() => {
                if (usdcBalance) {
                  setSendAmountInput(toUsdcString(usdcBalance, false));
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
                    try {
                      setTransactionHash('');

                      await writeSubmitTransferAsync?.();
                    } catch (error) {
                      console.log('writeSubmitTransferAsync failed: ', error);
                    }
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
  background: #0D111C;
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
  background: #0E111C;
  padding: 1.05rem 1rem;
`;

const NetworkNameContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  justify-content: center;
  text-align: left;
`;

const NetworkHeader = styled.div`
  font-size: 14px;
  color: #CED4DA;
`;

const NetworkNameLabel = styled.div`
  font-size: 16px;
  color: #FFF;
  font-weight: 600;
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
