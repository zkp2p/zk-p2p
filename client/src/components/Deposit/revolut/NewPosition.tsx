import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'react-feather';
import styled from 'styled-components';
import Link from '@mui/material/Link';
import { ethers } from "ethers";
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';

import { Button } from "@components/common/Button";
import { RowBetween } from '@components/layouts/Row';
import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';
import { Input } from "@components/Deposit/Input";
import { NumberedStep } from "@components/common/NumberedStep";
import { LoginStatus, NewRevolutDepositTransactionStatus } from '@helpers/types';
import { calculateConversionRate, toBigInt, toUsdcString } from '@helpers/units';
import { ZERO } from '@helpers/constants';
import { revolutStrings } from '@helpers/strings';
import { keccak256, calculateRevolutTagHash } from '@helpers/keccack';
import { MODALS } from '@helpers/types';
import { NOTARY_VERIFICATION_SIGNING_KEY } from '@helpers/notary';
import { PaymentPlatform, paymentPlatformInfo } from '@helpers/types';
import useAccount from '@hooks/useAccount';
import useBalances from '@hooks/useBalance';
import useDeposits from '@hooks/revolut/useDeposits';
import usePlatformSettings from '@hooks/usePlatformSettings';
import useRampState from '@hooks/revolut/useRampState';
import useRegistration from '@hooks/revolut/useRegistration';
import useSmartContracts from '@hooks/useSmartContracts';
import useModal from '@hooks/useModal';


const NOTARY_PUBKEY_HASH = process.env.NOTARY_PUBKEY_HASH;
if (!NOTARY_PUBKEY_HASH) {
    throw new Error("NOTARY_PUBKEY_HASH environment variable is not defined.");
};

interface NewPositionProps {
  handleBackClick: () => void;
}
 
export const NewPosition: React.FC<NewPositionProps> = ({
  handleBackClick
}) => {
  /*
   * Contexts
   */

  const { isLoggedIn, loginStatus } = useAccount();
  const { revolutRampAddress, revolutRampAbi, usdcAddress, usdcAbi } = useSmartContracts();
  const { minimumDepositAmount } = useRampState();
  const { usdcApprovalToRamp, usdcBalance, refetchUsdcApprovalToRamp, refetchUsdcBalance } = useBalances();
  const { refetchDeposits } = useDeposits();
  const { currencyIndex } = usePlatformSettings();
  const {
    extractedRevolutProfileId,
    registrationHash,
    setExtractedRevolutProfileId,
  } = useRegistration();
  const { openModal } = useModal();

  /*
   * State
   */
  
  const [depositState, setDepositState] = useState(NewRevolutDepositTransactionStatus.DEFAULT);
  const [revTagInput, setRevolutTagInput] = useState<string>('');
  const [depositAmountInput, setDepositAmountInput] = useState<string>('');
  const [receiveAmountInput, setReceiveAmountInput] = useState<string>('');

  const [isRevolutTagInputValid, setIsRevolutTagInputValid] = useState<boolean>(false);
  const [amountToApprove, setAmountToApprove] = useState<bigint>(ZERO);

  const [shouldConfigureNewDepositWrite, setShouldConfigureNewDepositWrite] = useState<boolean>(false);
  const [shouldConfigureApprovalWrite, setShouldConfigureApprovalWrite] = useState<boolean>(false);

  /*
   * Contract Writes
   */

  //
  // offRamp(string calldata _revTag, bytes32 _receiveCurrencyId, uint256 _depositAmount, uint256 _receiveAmount, ITLSData.TLSParams calldata _tlsParams)
  //
  const { config: writeDepositConfig } = usePrepareContractWrite({
    address: revolutRampAddress,
    abi: revolutRampAbi,
    functionName: 'offRamp',
    args: [
      revTagInput,
      keccak256(paymentPlatformInfo[PaymentPlatform.REVOLUT].platformCurrencies[currencyIndex]),
      toBigInt(depositAmountInput.toString()),
      toBigInt(receiveAmountInput.toString()),
      NOTARY_VERIFICATION_SIGNING_KEY,
      ethers.utils.hexZeroPad(ethers.utils.hexlify(BigInt(NOTARY_PUBKEY_HASH)), 32)
    ],
    enabled: shouldConfigureNewDepositWrite
  });

  const {
    data: submitDepositResult,
    status: signDepositTransactionStatus,
    writeAsync: writeSubmitDepositAsync,
  } = useContractWrite(writeDepositConfig);

  const {
    status: mineDepositTransactionStatus
  } = useWaitForTransaction({
    hash: submitDepositResult ? submitDepositResult.hash : undefined,
    onSuccess(data: any) {
      console.log('writeSubmitDepositAsync successful: ', data);
      
      refetchDeposits?.();

      refetchUsdcApprovalToRamp?.();

      setDepositState(NewRevolutDepositTransactionStatus.TRANSACTION_SUCCEEDED);
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
      revolutRampAddress,
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
      
      refetchUsdcApprovalToRamp?.();

      refetchUsdcBalance?.();
    },
  });

  /*
   * Hooks
   */

  useEffect(() => {
    const updateDepositState = async () => {
      const successfulDepositTransaction = mineDepositTransactionStatus === 'success';

      if (successfulDepositTransaction) {
        setDepositState(NewRevolutDepositTransactionStatus.TRANSACTION_SUCCEEDED);
      } else {
        if (!registrationHash) {
          setDepositState(NewRevolutDepositTransactionStatus.MISSING_REGISTRATION);
        } else {
          if (!revTagInput) { 
            setDepositState(NewRevolutDepositTransactionStatus.DEFAULT);
          } else {
            if (!isRevolutTagInputValid) {
              setDepositState(NewRevolutDepositTransactionStatus.INVALID_DEPOSITOR_ID);
            } else {
              const usdcBalanceLoaded = usdcBalance !== null;
              const usdcApprovalToRampLoaded = usdcApprovalToRamp !== null;
              const minimumDepositAmountLoaded = minimumDepositAmount !== null;
  
              if (depositAmountInput && usdcBalanceLoaded && usdcApprovalToRampLoaded && minimumDepositAmountLoaded) {
                const depositAmountBI = toBigInt(depositAmountInput);
                const isDepositAmountGreaterThanBalance = depositAmountBI > usdcBalance;
                const isDepositAmountLessThanMinDepositSize = depositAmountBI < minimumDepositAmount;
                const isDepositAmountGreaterThanApprovedBalance = depositAmountBI > usdcApprovalToRamp;
          
                const signingApproveTransaction = signApproveTransactionStatus === 'loading';
                const miningApproveTransaction = mineApproveTransactionStatus === 'loading';
                const successfulApproveTransaction = mineApproveTransactionStatus === 'success';

                if (isDepositAmountGreaterThanBalance) {
                  setDepositState(NewRevolutDepositTransactionStatus.INSUFFICIENT_BALANCE);
                } else if (isDepositAmountLessThanMinDepositSize) {
                  setDepositState(NewRevolutDepositTransactionStatus.MIN_DEPOSIT_THRESHOLD_NOT_MET);
                } else if (isDepositAmountGreaterThanApprovedBalance && !successfulApproveTransaction) {
                  if (signingApproveTransaction) {
                    setDepositState(NewRevolutDepositTransactionStatus.TRANSACTION_SIGNING);
                  } else if (miningApproveTransaction) {
                    setDepositState(NewRevolutDepositTransactionStatus.TRANSACTION_MINING);
                  } else {
                    setDepositState(NewRevolutDepositTransactionStatus.APPROVAL_REQUIRED);
                  }
                } else {
                  if (receiveAmountInput) {
                    const signingDepositTransaction = signDepositTransactionStatus === 'loading';
                    const miningDepositTransaction = mineDepositTransactionStatus === 'loading';

                    if (signingDepositTransaction) {
                      setDepositState(NewRevolutDepositTransactionStatus.TRANSACTION_SIGNING);
                    } else if (miningDepositTransaction){
                      setDepositState(NewRevolutDepositTransactionStatus.TRANSACTION_MINING);
                    } else {
                      setDepositState(NewRevolutDepositTransactionStatus.VALID);
                    }
                  } else {
                    setDepositState(NewRevolutDepositTransactionStatus.MISSING_AMOUNTS);
                  }
                }
              } else {
                setDepositState(NewRevolutDepositTransactionStatus.MISSING_AMOUNTS);
              }
            }
          }
        }
      }
    }

    updateDepositState();
  }, [
      revTagInput,
      registrationHash,
      depositAmountInput,
      receiveAmountInput,
      minimumDepositAmount,
      usdcBalance,
      usdcApprovalToRamp,
      isRevolutTagInputValid,
      signApproveTransactionStatus,
      mineApproveTransactionStatus,
      signDepositTransactionStatus,
      mineDepositTransactionStatus,
    ]
  );

  useEffect(() => {
    const isApprovalRequired = depositState === NewRevolutDepositTransactionStatus.APPROVAL_REQUIRED;
    setShouldConfigureApprovalWrite(isApprovalRequired);
    
    setShouldConfigureNewDepositWrite(depositState === NewRevolutDepositTransactionStatus.VALID);
  }, [depositState]);

  useEffect(() => {
    const usdcApprovalToRampLoaded = usdcApprovalToRamp !== null && usdcApprovalToRamp !== undefined;

    if (!depositAmountInput || !usdcApprovalToRampLoaded) {
      setAmountToApprove(ZERO);
    } else {
      const depositAmountBI = toBigInt(depositAmountInput.toString());
      const approvalDifference = depositAmountBI - usdcApprovalToRamp;
      if (approvalDifference > ZERO) {
        setAmountToApprove(depositAmountBI);
      } else {
        setAmountToApprove(ZERO);
      }
    }
    
  }, [depositAmountInput, usdcApprovalToRamp]);

  useEffect(() => {
    if (extractedRevolutProfileId) {
      setRevolutTagInput(extractedRevolutProfileId);
    } else {
      setRevolutTagInput('');
    }
  }, [extractedRevolutProfileId]);

  useEffect(() => {
    const verifyRevolutTagInput = async () => {
      if (revTagInput.length < 6) {
        setIsRevolutTagInputValid(false);
      } else {
        if (registrationHash) {
          const revTagHash = calculateRevolutTagHash(revTagInput);
          const validRevolutTagInput = revTagHash === registrationHash;
          setIsRevolutTagInputValid(validRevolutTagInput);

          if (validRevolutTagInput && setExtractedRevolutProfileId) {
            setExtractedRevolutProfileId(revTagInput);
          };
        } else {
          setIsRevolutTagInputValid(false);
        }
      }
    };

    verifyRevolutTagInput();
  }, [revTagInput, registrationHash, setExtractedRevolutProfileId]);

  /*
   * Helpers
   */

  function isValidInput(value: string) {
    const isValid = /^-?\d*(\.\d{0,6})?$/.test(value);
    
    return parseFloat(value) >= 0 && isValid;
  }

  const ctaDisabled = (): boolean => {
    switch (depositState) {
      case NewRevolutDepositTransactionStatus.DEFAULT:
      case NewRevolutDepositTransactionStatus.INVALID_DEPOSITOR_ID:
      case NewRevolutDepositTransactionStatus.MIN_DEPOSIT_THRESHOLD_NOT_MET:
      case NewRevolutDepositTransactionStatus.CONVENIENCE_FEE_INVALID:
      case NewRevolutDepositTransactionStatus.MAX_INTENTS_REACHED:
      case NewRevolutDepositTransactionStatus.MISSING_REGISTRATION:
      case NewRevolutDepositTransactionStatus.MISSING_AMOUNTS:
      case NewRevolutDepositTransactionStatus.TRANSACTION_SIGNING:
      case NewRevolutDepositTransactionStatus.TRANSACTION_MINING:
        return true;

      case NewRevolutDepositTransactionStatus.INSUFFICIENT_BALANCE:
      case NewRevolutDepositTransactionStatus.APPROVAL_REQUIRED:
      case NewRevolutDepositTransactionStatus.VALID:
      default:
        return false;
    }
  }

  const ctaLoading = (): boolean => {
    switch (depositState) {
      case NewRevolutDepositTransactionStatus.TRANSACTION_SIGNING:
      case NewRevolutDepositTransactionStatus.TRANSACTION_MINING:
        return loginStatus === LoginStatus.AUTHENTICATED;

      default:
        return false;
    }
  };

  const ctaText = (): string => {
    switch (depositState) {
      case NewRevolutDepositTransactionStatus.MISSING_REGISTRATION:
        return 'Missing registration';

      case NewRevolutDepositTransactionStatus.INVALID_DEPOSITOR_ID:
        return 'Revtag does not match registration';

      case NewRevolutDepositTransactionStatus.MISSING_AMOUNTS:
        return 'Input deposit and receive amounts';
      
      case NewRevolutDepositTransactionStatus.INSUFFICIENT_BALANCE:
        return `Insufficient balance — Deposit USDC`;
      
      case NewRevolutDepositTransactionStatus.MIN_DEPOSIT_THRESHOLD_NOT_MET:
        const minimumDepositAmountString = minimumDepositAmount ? toUsdcString(minimumDepositAmount, true) : '0';
        return `Minimum deposit amount is ${minimumDepositAmountString}`;

      case NewRevolutDepositTransactionStatus.TRANSACTION_SIGNING:
        return 'Signing Transaction';

      case NewRevolutDepositTransactionStatus.TRANSACTION_MINING:
        return 'Mining Transaction';

      case NewRevolutDepositTransactionStatus.APPROVAL_REQUIRED:
        const usdcApprovalToRampString = usdcApprovalToRamp ? toUsdcString(usdcApprovalToRamp, true) : '0';
        return `Insufficient USDC transfer approval: ${usdcApprovalToRampString}`;

      case NewRevolutDepositTransactionStatus.VALID:
        return 'Create Deposit';

      case NewRevolutDepositTransactionStatus.TRANSACTION_SUCCEEDED:
        return 'Go to Deposits';

      case NewRevolutDepositTransactionStatus.DEFAULT:
      default:
        return 'Input valid Revtag';
    }
  }

  const ctaOnClick = async () => {
    switch (depositState) {
      case NewRevolutDepositTransactionStatus.APPROVAL_REQUIRED:
        try {
          await writeSubmitApproveAsync?.();
        } catch (error) {
          console.log('writeSubmitApproveAsync failed: ', error);
        }
        break;

      case NewRevolutDepositTransactionStatus.VALID:
        try {
          await writeSubmitDepositAsync?.();
        } catch (error) {
          console.log('writeSubmitDepositAsync failed: ', error);
        }
        break;

      case NewRevolutDepositTransactionStatus.TRANSACTION_SUCCEEDED:
        handleBackClick();
        break;

      case NewRevolutDepositTransactionStatus.INSUFFICIENT_BALANCE:
        openModal(MODALS.RECEIVE);
        break;

      default:
        break;
    }
  }

  const usdcBalanceLabel = useMemo(() => {
    if (isLoggedIn && usdcBalance !== null) {
      return `Balance: ${toUsdcString(usdcBalance, true)}`
    } else {
      return '';
    }
  }, [usdcBalance, isLoggedIn]);

  const conversionRateLabel =  useMemo(() => {
    if (isLoggedIn && depositAmountInput && receiveAmountInput) {
      // Flipping conversion rate (i.e. relative to Venmo) b/c EUR/USD is quoted with USD as the base currency
      return `Rate: ${calculateConversionRate(receiveAmountInput, depositAmountInput)} ${paymentPlatformInfo[PaymentPlatform.REVOLUT].platformCurrencies[currencyIndex]} / USDC`;
    } else {
      return '';
    }
  }, [depositAmountInput, receiveAmountInput, isLoggedIn, currencyIndex]);

  /*
   * Handlers
   */

  const handleInputChange = (value: string, setInputFunction: React.Dispatch<React.SetStateAction<string>>) => {
    if (value === "") {
      setInputFunction('');
    } else if (value === ".") {
      setInputFunction('0.');
    } else if (isValidInput(value)) {
      setInputFunction(value);
    }
  };

  /*
   * Component
   */

  function renderContent() {
    return (
      <NewPositionContainer>
        <RowBetween style={{ padding: '0.25rem 0rem 1.5rem 0rem' }}>
          <div style={{ flex: 0.5 }}>
            <button
              onClick={handleBackClick}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <StyledArrowLeft/>
            </button>
          </div>

          <ThemedText.HeadlineSmall style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
            New Deposit
          </ThemedText.HeadlineSmall>

          <div style={{ flex: 0.5 }}/>
        </RowBetween>

        <Body>
          <InstructionsAndTogglesContainer>
            <NumberedStep>
              { revolutStrings.get('NEW_DEPOSIT_INSTRUCTIONS') }
              <Link href="https://docs.zkp2p.xyz/zkp2p/user-guides/off-ramping/fetch-your-revtag" target="_blank">
                Fetch your Revtag ↗
              </Link>
            </NumberedStep>
          </InstructionsAndTogglesContainer>
          <InputsContainer>
            <Input
              label="Revtag"
              name={`revTag`}
              value={revTagInput}
              onChange={(e) => {setRevolutTagInput(e.currentTarget.value)}}
              type="string"
              placeholder="zkp2p7gy"
              helperText={revolutStrings.get('NEW_DEPOSIT_ID_TOOLTIP')}
              valueFontSize="20px"
            />

            <Input
              label="Deposit Amount"
              name={`depositAmount`}
              value={depositAmountInput}
              onChange={(e) => handleInputChange(e.currentTarget.value, setDepositAmountInput)}
              type="number"
              inputLabel="USDC"
              placeholder="1000"
              accessoryLabel={usdcBalanceLabel}
              helperText={revolutStrings.get('NEW_DEPOSIT_AMOUNT_TOOLTIP')}
              enableMax={true}
              maxButtonOnClick={() => {
                if (usdcBalance) {
                  setDepositAmountInput(toUsdcString(usdcBalance, false));
                }
              }}
            />

            <Input
              label="Receive Amount"
              name={`receiveAmount`}
              value={receiveAmountInput}
              onChange={(e) => handleInputChange(e.currentTarget.value, setReceiveAmountInput)}
              type="number"
              hasSelector={true}
              placeholder="940"
              accessoryLabel={conversionRateLabel}
              helperText={revolutStrings.get('NEW_DEPOSIT_RECEIVE_TOOLTIP')}
            />

            <ButtonContainer>
              <Button
                fullWidth={true}
                disabled={ctaDisabled()}
                loading={ctaLoading()}
                onClick={async () => {
                  ctaOnClick();
                }}>
                { ctaText() }
              </Button>
            </ButtonContainer>
          </InputsContainer>
        </Body>
      </NewPositionContainer>
    );
  }

  return (
    <NewPositionOrAccountRegistrationContainer>
      {renderContent()}
    </NewPositionOrAccountRegistrationContainer>
  );
};

const NewPositionOrAccountRegistrationContainer = styled.div`
  width: 100%;
`;

const NewPositionContainer = styled.div`
  display: grid;
  padding: 1.5rem;
  background-color: ${colors.container};

  @media (min-width: 600px) {
    border-radius: 16px;
    border: 1px solid ${colors.defaultBorderColor};
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: ${colors.container};
`;

const InputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ButtonContainer = styled.div`
  display: grid;
`;

const StyledArrowLeft = styled(ArrowLeft)`
  color: #FFF;
`;

const InstructionsAndTogglesContainer = styled.div`
  display: grid;
  flex-direction: column;
  gap: 1rem;
`;
