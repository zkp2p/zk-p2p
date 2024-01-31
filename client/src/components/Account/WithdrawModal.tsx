import React, { Suspense, useEffect, useMemo, useState, useCallback } from 'react';
import styled from 'styled-components/macro';
import { X } from 'react-feather';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction, useSendTransaction, usePrepareSendTransaction } from 'wagmi';
import debounce from 'lodash/debounce';

import { Button } from "@components/common/Button";
import { Overlay } from '@components/modals/Overlay';
import { NetworkSelector } from '@components/Account/NetworkSelector';
import { Input } from '@components/Account/Input';
import { ThemedText } from '@theme/text'
import { ZERO } from '@helpers/constants';
import { toBigInt, toUsdcString } from '@helpers/units';
import { WithdrawTransactionStatus } from '@helpers/types';
import { formatAddress } from '@helpers/addressFormat';
import { resolveEnsName } from '@helpers/ens';
import { tokens } from '@helpers/tokens';
import useAccount from '@hooks/useAccount';
import useBalances from '@hooks/useBalance';
import useModal from '@hooks/useModal';
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

export default function WithdrawModal() {
  /*
   * Contexts
   */

  const { closeModal } = useModal();
  const { isLoggedIn, network, loggedInEthereumAddress } = useAccount();
  const { usdcBalance, refetchUsdcBalance, usdcApprovalToLifiBridge, refetchUsdcApprovalToLifiBridge } = useBalances();
  const { blockscanUrl, usdcAddress, usdcAbi, lifiBridgeAddress } = useSmartContracts();
  const { getLifiQuotes, getLifiTransactionHistory, getLifiTransactionStatus } = useLifiBridge();

  /*
   * State
   */

  const [transactionHash, setTransactionHash] = useState<string>('');

  const [withdrawState, setWithdrawState] = useState(WithdrawTransactionStatus.DEFAULT);
  const [withdrawAmountInput, setWithdrawAmountInput] = useState<string>('');
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
      toBigInt(withdrawAmountInput.toString()),
    ],
    enabled: shouldConfigureTransferWrite
  });

  const {
    data: submitTransferResult,
    status: signTransferTransactionStatus,
    writeAsync: writeSubmitTransferAsync
  } = useContractWrite(writeTransferConfig);

  const {
    status: mineTransferTransactionStatus
  } = useWaitForTransaction({
    hash: submitTransferResult ? submitTransferResult.hash : undefined,
    onSuccess(data: any) {
      console.log('writeSubmitTransferAsync successful: ', data);

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

  const handleCloseModal = () => {
    closeModal();
  };

  const handleInputChange = (value: string, setInputFunction: React.Dispatch<React.SetStateAction<string>>) => {
    resetWithdrawStateOnInputChange();

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
    resetWithdrawStateOnInputChange();

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
  
    if (value.endsWith('.eth')) {
      ensName = value;
      const resolvedAddress = await resolveEnsName(value);
      if (resolvedAddress) {
        rawAddress = resolvedAddress;
        displayAddress = formatAddress(resolvedAddress);
        isValidAddress = true;
      }
    } else if (value.length === 42 && value.startsWith('0x')) {
      rawAddress = value;
      displayAddress = formatAddress(value);
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
    const updateWithdrawState = async () => {
      const successfulDepositTransaction = mineTransferTransactionStatus === 'success';

      if (successfulDepositTransaction) {
        setWithdrawState(WithdrawTransactionStatus.TRANSACTION_SUCCEEDED);
      } else {
        if (!withdrawAmountInput) { 
          setWithdrawState(WithdrawTransactionStatus.MISSING_AMOUNTS);
        } else {
          const usdcBalanceLoaded = usdcBalance !== null;

          if (withdrawAmountInput && usdcBalanceLoaded) {
            const depositAmountBI = toBigInt(withdrawAmountInput);
            const isDepositAmountGreaterThanBalance = depositAmountBI > usdcBalance;

            if (isDepositAmountGreaterThanBalance) {
              setWithdrawState(WithdrawTransactionStatus.INSUFFICIENT_BALANCE);
            } else {
              if (!recipientAddressInput.input) {
                setWithdrawState(WithdrawTransactionStatus.DEFAULT);
              } else if (!isValidRecipientAddress) {
                setWithdrawState(WithdrawTransactionStatus.INVALID_RECIPIENT_ADDRESS);
              } else {
                const signingDepositTransaction = signTransferTransactionStatus === 'loading';
                const miningDepositTransaction = mineTransferTransactionStatus === 'loading';
  
                if (signingDepositTransaction) {
                  setWithdrawState(WithdrawTransactionStatus.TRANSACTION_SIGNING);
                } else if (miningDepositTransaction){
                  setWithdrawState(WithdrawTransactionStatus.TRANSACTION_MINING);
                } else {
                  setWithdrawState(WithdrawTransactionStatus.VALID);
                }
              }
            }
          } else {
            setWithdrawState(WithdrawTransactionStatus.MISSING_AMOUNTS);
          }
        }
      }
    }

    updateWithdrawState();
  }, [
      recipientAddressInput.input,
      withdrawAmountInput,
      usdcBalance,
      isValidRecipientAddress,
      signTransferTransactionStatus,
      mineTransferTransactionStatus,
    ]
  );

  useEffect(() => {
    // TODO: for 4337 wallets, skip approval check because we are batching approve + bridge + revoke approval
    const isApprovalRequired = withdrawState === WithdrawTransactionStatus.APPROVAL_REQUIRED;
    setShouldConfigureApprovalWrite(isApprovalRequired);
    
    setShouldConfigureTransferWrite(withdrawState === WithdrawTransactionStatus.VALID);
  }, [withdrawState]);

  useEffect(() => {
    if (submitTransferResult?.hash) {
      setTransactionHash(submitTransferResult.hash);
    }
  }, [submitTransferResult])


  useEffect(() => {
    // TODO: skip approval if 4337 wallet
    const usdcApprovalToLifiBridgeLoaded = usdcApprovalToLifiBridge !== null && usdcApprovalToLifiBridge !== undefined;

    if (!withdrawAmountInput || !usdcApprovalToLifiBridgeLoaded) {
      setAmountToApprove(ZERO);
    } else {
      // TODO: Check if USDC on Base transfer vs bridge transaction to skip approval
      const depositAmountBI = toBigInt(withdrawAmountInput.toString());
      const approvalDifference = depositAmountBI - usdcApprovalToLifiBridge;
      if (approvalDifference > ZERO) {
        setAmountToApprove(depositAmountBI);
      } else {
        setAmountToApprove(ZERO);
      }
    }
  }, [withdrawAmountInput, usdcApprovalToLifiBridge]);
  
  /*
   * Helpers
   */

  function resetWithdrawStateOnInputChange() {
    if (withdrawState === WithdrawTransactionStatus.TRANSACTION_SUCCEEDED) {
      setWithdrawState(WithdrawTransactionStatus.DEFAULT);
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
    switch (withdrawState) {
      case WithdrawTransactionStatus.DEFAULT:
      case WithdrawTransactionStatus.INSUFFICIENT_BALANCE:
      case WithdrawTransactionStatus.INVALID_RECIPIENT_ADDRESS:
      case WithdrawTransactionStatus.MISSING_AMOUNTS:
      case WithdrawTransactionStatus.TRANSACTION_SIGNING:
      case WithdrawTransactionStatus.TRANSACTION_MINING:
        return true;

      case WithdrawTransactionStatus.APPROVAL_REQUIRED:
        return false;
      case WithdrawTransactionStatus.VALID:
      case WithdrawTransactionStatus.TRANSACTION_SUCCEEDED:
      default:
        return false;
    }
  };

  const ctaText = (): string => {
    switch (withdrawState) {
      case WithdrawTransactionStatus.INVALID_RECIPIENT_ADDRESS:
        return 'Invalid recipient address';

      case WithdrawTransactionStatus.MISSING_AMOUNTS:
        return 'Input withdraw amount';
      
      case WithdrawTransactionStatus.INSUFFICIENT_BALANCE:
        const humanReadableUsdcBalance = usdcBalance ? toUsdcString(usdcBalance) : '0';
        return `Insufficient USDC balance: ${humanReadableUsdcBalance}`;

      case WithdrawTransactionStatus.TRANSACTION_SIGNING:
        return 'Signing Transaction';

      case WithdrawTransactionStatus.TRANSACTION_MINING:
        return 'Mining Transaction';

      case WithdrawTransactionStatus.VALID:
        return 'Withdraw';

      case WithdrawTransactionStatus.TRANSACTION_SUCCEEDED:
        return 'Withdraw';

      case WithdrawTransactionStatus.APPROVAL_REQUIRED:
        const usdcApprovalToLifiBridgeString = usdcApprovalToLifiBridge ? toUsdcString(usdcApprovalToLifiBridge) : '0';
        return `Insufficient USDC transfer approval: ${usdcApprovalToLifiBridgeString}`;

      case WithdrawTransactionStatus.DEFAULT:
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
    <ModalAndOverlayContainer>
      <Overlay onClick={handleCloseModal} />

      <Suspense>
        <ModalContainer>
          <TitleCenteredRow>
            <div style={{ flex: 0.25 }}>
              <button
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >

                <StyledX/>
              </button>
            </div>

            <ThemedText.HeadlineSmall style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
              {'Withdraw'}
            </ThemedText.HeadlineSmall>

            <div style={{ flex: 0.25 }}/>
          </TitleCenteredRow>

          <NetworkContainer>
            {/* <ThemedText.HeadlineSmall style={{ textAlign: 'left' }}>
              Network
            </ThemedText.HeadlineSmall> */}
            
            <NetworkTransitionContainer>
              <NetworkLogoAndNameContainer>
                <NetworkSvg src={networkSvg()} />

                <NetworkNameContainer>
                  <ThemedText.LabelSmall>
                    {'From'}
                  </ThemedText.LabelSmall>
                  <ThemedText.Link>
                    {networkName()}
                  </ThemedText.Link>
                </NetworkNameContainer>
              </NetworkLogoAndNameContainer>

              <NetworkSelector />
            </NetworkTransitionContainer>
          </NetworkContainer>

          <InputsContainer>
            <Input
              label="Amount"
              name={`withdrawAmount`}
              value={withdrawAmountInput}
              onChange={(e) => handleInputChange(e.currentTarget.value, setWithdrawAmountInput)}
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
            />
          </InputsContainer>

          { transactionHash?.length ? (
            <Link
              href={`${blockscanUrl}/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer">
                <ThemedText.LabelSmall textAlign="left">
                  View on Explorer ↗
                </ThemedText.LabelSmall>
            </Link>
          ) : null}

          <ButtonContainer>
            <Button
              fullWidth={true}
              disabled={ctaDisabled()}
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
          </ButtonContainer>
        </ModalContainer>
      </Suspense>
    </ModalAndOverlayContainer>
  );
};

const ModalAndOverlayContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  position: fixed;
  align-items: flex-start;
  top: 0;
  left: 0;
  z-index: 10;
`;

const ModalContainer = styled.div`
  width: 440px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.25rem;
  background: #0D111C;
  justify-content: space-between;
  align-items: center;
  z-index: 20;

  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const NetworkContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-top: 1.5rem;
`;

const TitleCenteredRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  color: #FFF;
`;

const StyledX = styled(X)`
  color: #FFF;
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
  width: 180px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  gap: 1rem;
  align-items: center;
  justify-content: flex-start;
  background: #0E111C;
  padding: 1rem;
`;

const NetworkNameContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  justify-content: center;
  text-align: left;
`;

const NetworkSvg = styled.img`
  width: 32px;
  height: 32px;
`;

const InputsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 0.75rem;
`;

const Link = styled.a`
  white-space: pre;
  display: inline-block;
  color: #1F95E2;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const ButtonContainer = styled.div`
  width: 100%;
  padding-top: 1rem;
`;
