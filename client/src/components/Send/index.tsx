import React, { Suspense, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components/macro';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';

import { Button } from "@components/common/Button";
import { CustomConnectButton } from "@components/common/ConnectButton";
import { AutoColumn } from '@components/layouts/Column';
import { NetworkSelector } from '@components/Send/NetworkSelector';
import { Input } from '@components/Send/Input';
import { ThemedText } from '@theme/text'
import { toBigInt, toUsdcString } from '@helpers/units';
import { LoginStatus, SendTransactionStatus } from '@helpers/types';
import { formatAddressLong } from '@helpers/addressFormat';
import { resolveEnsName } from '@helpers/ens';
import useAccount from '@hooks/useAccount';
import useBalances from '@hooks/useBalance';
import useSmartContracts from '@hooks/useSmartContracts';

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

  const { isLoggedIn, network, loginStatus } = useAccount();
  const { usdcBalance, refetchUsdcBalance } = useBalances();
  const { blockscanUrl, usdcAddress, usdcAbi } = useSmartContracts();

  /*
   * State
   */

  const [transactionHash, setTransactionHash] = useState<string>('');

  const [sendState, setSendState] = useState(SendTransactionStatus.DEFAULT);
  const [sendAmountInput, setSendAmountInput] = useState<string>('');
  const [recipientAddressInput, setRecipientAddressInput] = useState<RecipientAddress>(EMPTY_RECIPIENT_ADDRESS);

  const [isRecipientInputFocused, setIsRecipientInputFocused] = useState(false);

  const [isValidRecipientAddress, setIsValidRecipientAddress] = useState<boolean>(false);

  const [shouldConfigureTransferWrite, setShouldConfigureTransferWrite] = useState<boolean>(false);

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
  
    if (value.endsWith('.eth')) {
      ensName = value;
      const resolvedAddress = await resolveEnsName(value);
      if (resolvedAddress) {
        rawAddress = resolvedAddress;
        displayAddress = formatAddressLong(resolvedAddress);
        isValidAddress = true;
      }
    } else if (value.length === 42 && value.startsWith('0x')) {
      rawAddress = value;
      displayAddress = formatAddressLong(value);
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
    setShouldConfigureTransferWrite(sendState === SendTransactionStatus.VALID);
  }, [sendState]);

  useEffect(() => {
    if (submitTransferResult?.hash) {
      setTransactionHash(submitTransferResult.hash);
    }
  }, [submitTransferResult])

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
        return 'Input Send amount';
      
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
              Transfer
            </ThemedText.HeadlineSmall>
          </TitleContainer>

          <MainContentWrapper>
            <NetworkContainer>
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

            <Input
              label="Amount"
              name={`SendAmount`}
              value={sendAmountInput}
              onChange={(e) => handleInputChange(e.currentTarget.value, setSendAmountInput)}
              type="number"
              readOnly={!isLoggedIn}
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
              readOnly={!isLoggedIn}
              placeholder="Wallet address or ENS name"
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
