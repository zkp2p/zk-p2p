import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'react-feather';
import styled from 'styled-components';
import Link from '@mui/material/Link';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';

import { Button } from "@components/common/Button";
import { RowBetween } from '@components/layouts/Row';
import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';
import { Input } from "@components/Deposit/Input";
import { NumberedStep } from "@components/common/NumberedStep";
import { NewAccountRegistration } from "@components/Deposit/wise/NewAccountRegistration";
import { LoginStatus, NewWiseDepositTransactionStatus } from '@helpers/types';
import { toBigInt, toUsdcString } from '@helpers/units';
import { ZERO } from '@helpers/constants';
import { wiseStrings } from '@helpers/strings';
import { keccak256, calculateWiseTagHash } from '@helpers/keccack';
import { MODALS } from '@helpers/types';
import { NOTARY_VERIFICATION_SIGNING_KEY } from '@helpers/notary';
import useAccount from '@hooks/useAccount';
import useBalances from '@hooks/useBalance';
import useDeposits from '@hooks/wise/useDeposits';
import useRampState from '@hooks/wise/useRampState';
import useRegistration from '@hooks/wise/useRegistration';
import useSmartContracts from '@hooks/useSmartContracts';
import useModal from '@hooks/useModal';


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
  const { wiseRampAddress, wiseRampAbi, usdcAddress, usdcAbi } = useSmartContracts();
  const { minimumDepositAmount } = useRampState();
  const { usdcApprovalToRamp, usdcBalance, refetchUsdcApprovalToRamp, refetchUsdcBalance } = useBalances();
  const { refetchDeposits } = useDeposits();
  const {
    extractedWiseProfileId,
    registrationHash,
    setExtractedWiseProfileId,
    isRegisteredForDeposit,
    offRampId,
    
  } = useRegistration();
  const { openModal } = useModal();

  /*
   * State
   */
  
  const [depositState, setDepositState] = useState(NewWiseDepositTransactionStatus.DEFAULT);
  const [wiseTagInput, setWiseTagInput] = useState<string>('');
  const [depositAmountInput, setDepositAmountInput] = useState<string>('');
  const [receiveAmountInput, setReceiveAmountInput] = useState<string>('');

  const [isWiseTagInputValid, setIsWiseTagInputValid] = useState<boolean>(false);
  const [amountToApprove, setAmountToApprove] = useState<bigint>(ZERO);

  const [isNewRegistration, setIsNewRegistration] = useState<boolean>(false);

  const [shouldConfigureNewDepositWrite, setShouldConfigureNewDepositWrite] = useState<boolean>(false);
  const [shouldConfigureApprovalWrite, setShouldConfigureApprovalWrite] = useState<boolean>(false);

  /*
   * Contract Writes
   */

  //
  // offRamp(string calldata _wiseTag, bytes32 _receiveCurrencyId, uint256 _depositAmount, uint256 _receiveAmount, ITLSData.TLSParams calldata _tlsParams)
  //
  const { config: writeDepositConfig } = usePrepareContractWrite({
    address: wiseRampAddress,
    abi: wiseRampAbi,
    functionName: 'offRamp',
    args: [
      wiseTagInput,
      keccak256('EUR'),
      toBigInt(depositAmountInput.toString()),
      toBigInt(receiveAmountInput.toString()),
      NOTARY_VERIFICATION_SIGNING_KEY
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

      setDepositState(NewWiseDepositTransactionStatus.TRANSACTION_SUCCEEDED);
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
      wiseRampAddress,
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
        setDepositState(NewWiseDepositTransactionStatus.TRANSACTION_SUCCEEDED);
      } else {
        if (!registrationHash) {
          setDepositState(NewWiseDepositTransactionStatus.MISSING_REGISTRATION);
        } else {
          if (!isRegisteredForDeposit) {
            setDepositState(NewWiseDepositTransactionStatus.MISSING_MULTICURRENCY_REGISTRATION);
          } else {
            if (!wiseTagInput) { 
              setDepositState(NewWiseDepositTransactionStatus.DEFAULT);
            } else {
              if (!isWiseTagInputValid) {
                setDepositState(NewWiseDepositTransactionStatus.INVALID_DEPOSITOR_ID);
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
                    setDepositState(NewWiseDepositTransactionStatus.INSUFFICIENT_BALANCE);
                  } else if (isDepositAmountLessThanMinDepositSize) {
                    setDepositState(NewWiseDepositTransactionStatus.MIN_DEPOSIT_THRESHOLD_NOT_MET);
                  } else if (isDepositAmountGreaterThanApprovedBalance && !successfulApproveTransaction) {
                    if (signingApproveTransaction) {
                      setDepositState(NewWiseDepositTransactionStatus.TRANSACTION_SIGNING);
                    } else if (miningApproveTransaction) {
                      setDepositState(NewWiseDepositTransactionStatus.TRANSACTION_MINING);
                    } else {
                      setDepositState(NewWiseDepositTransactionStatus.APPROVAL_REQUIRED);
                    }
                  } else {
                    if (receiveAmountInput) {
                      const signingDepositTransaction = signDepositTransactionStatus === 'loading';
                      const miningDepositTransaction = mineDepositTransactionStatus === 'loading';
  
                      if (signingDepositTransaction) {
                        setDepositState(NewWiseDepositTransactionStatus.TRANSACTION_SIGNING);
                      } else if (miningDepositTransaction){
                        setDepositState(NewWiseDepositTransactionStatus.TRANSACTION_MINING);
                      } else {
                        setDepositState(NewWiseDepositTransactionStatus.VALID);
                      }
                    } else {
                      setDepositState(NewWiseDepositTransactionStatus.MISSING_AMOUNTS);
                    }
                  }
                } else {
                  setDepositState(NewWiseDepositTransactionStatus.MISSING_AMOUNTS);
                }
              }
            }
          }
        }
      }
    }

    updateDepositState();
  }, [
      isRegisteredForDeposit,
      wiseTagInput,
      registrationHash,
      depositAmountInput,
      receiveAmountInput,
      minimumDepositAmount,
      usdcBalance,
      usdcApprovalToRamp,
      isWiseTagInputValid,
      signApproveTransactionStatus,
      mineApproveTransactionStatus,
      signDepositTransactionStatus,
      mineDepositTransactionStatus,
    ]
  );

  useEffect(() => {
    const isApprovalRequired = depositState === NewWiseDepositTransactionStatus.APPROVAL_REQUIRED;
    setShouldConfigureApprovalWrite(isApprovalRequired);
    
    setShouldConfigureNewDepositWrite(depositState === NewWiseDepositTransactionStatus.VALID);
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
    if (extractedWiseProfileId) {
      setWiseTagInput(extractedWiseProfileId);
    } else {
      setWiseTagInput('');
    }
  }, [extractedWiseProfileId]);

  useEffect(() => {
    const verifyWiseTagInput = async () => {
      if (wiseTagInput.length < 4) {
        setIsWiseTagInputValid(false);
      } else {
        if (registrationHash) {
          const wiseTagHash = calculateWiseTagHash(wiseTagInput);
          const validWiseTagInput = wiseTagHash === registrationHash;
          setIsWiseTagInputValid(validWiseTagInput);

          if (validWiseTagInput && setExtractedWiseProfileId) {
            setExtractedWiseProfileId(wiseTagInput);
          };
        } else {
          setIsWiseTagInputValid(false);
        }
      }
    };

    verifyWiseTagInput();
  }, [wiseTagInput, registrationHash, setExtractedWiseProfileId]);

  /*
   * Helpers
   */

  function isValidInput(value: string) {
    const isValid = /^-?\d*(\.\d{0,6})?$/.test(value);
    
    return parseFloat(value) >= 0 && isValid;
  }

  const ctaDisabled = (): boolean => {
    switch (depositState) {
      case NewWiseDepositTransactionStatus.DEFAULT:
      case NewWiseDepositTransactionStatus.INVALID_DEPOSITOR_ID:
      case NewWiseDepositTransactionStatus.MIN_DEPOSIT_THRESHOLD_NOT_MET:
      case NewWiseDepositTransactionStatus.CONVENIENCE_FEE_INVALID:
      case NewWiseDepositTransactionStatus.MAX_INTENTS_REACHED:
      case NewWiseDepositTransactionStatus.MISSING_REGISTRATION:
      case NewWiseDepositTransactionStatus.MISSING_AMOUNTS:
      case NewWiseDepositTransactionStatus.TRANSACTION_SIGNING:
      case NewWiseDepositTransactionStatus.TRANSACTION_MINING:
        return true;

      case NewWiseDepositTransactionStatus.MISSING_MULTICURRENCY_REGISTRATION:
      case NewWiseDepositTransactionStatus.INSUFFICIENT_BALANCE:
      case NewWiseDepositTransactionStatus.APPROVAL_REQUIRED:
      case NewWiseDepositTransactionStatus.VALID:
      default:
        return false;
    }
  }

  const ctaLoading = (): boolean => {
    switch (depositState) {
      case NewWiseDepositTransactionStatus.TRANSACTION_SIGNING:
      case NewWiseDepositTransactionStatus.TRANSACTION_MINING:
        return loginStatus === LoginStatus.AUTHENTICATED;

      default:
        return false;
    }
  };

  const ctaText = (): string => {
    switch (depositState) {
      case NewWiseDepositTransactionStatus.MISSING_REGISTRATION:
        return 'Missing registration';

      case NewWiseDepositTransactionStatus.MISSING_MULTICURRENCY_REGISTRATION:
        return 'Complete Depositor Verification';

      case NewWiseDepositTransactionStatus.INVALID_DEPOSITOR_ID:
        return 'Wise tag does not match registration';

      case NewWiseDepositTransactionStatus.MISSING_AMOUNTS:
        return 'Input deposit and receive amounts';
      
      case NewWiseDepositTransactionStatus.INSUFFICIENT_BALANCE:
        return `Insufficient balance — Deposit USDC`;
      
      case NewWiseDepositTransactionStatus.MIN_DEPOSIT_THRESHOLD_NOT_MET:
        const minimumDepositAmountString = minimumDepositAmount ? toUsdcString(minimumDepositAmount, true) : '0';
        return `Minimum deposit amount is ${minimumDepositAmountString}`;

      case NewWiseDepositTransactionStatus.TRANSACTION_SIGNING:
        return 'Signing Transaction';

      case NewWiseDepositTransactionStatus.TRANSACTION_MINING:
        return 'Mining Transaction';

      case NewWiseDepositTransactionStatus.APPROVAL_REQUIRED:
        const usdcApprovalToRampString = usdcApprovalToRamp ? toUsdcString(usdcApprovalToRamp, true) : '0';
        return `Insufficient USDC transfer approval: ${usdcApprovalToRampString}`;

      case NewWiseDepositTransactionStatus.VALID:
        return 'Create Deposit';

      case NewWiseDepositTransactionStatus.TRANSACTION_SUCCEEDED:
        return 'Go to Deposits';

      case NewWiseDepositTransactionStatus.DEFAULT:
      default:
        return 'Input valid Wise tag';
    }
  }

  const ctaOnClick = async () => {
    switch (depositState) {
      case NewWiseDepositTransactionStatus.MISSING_MULTICURRENCY_REGISTRATION:
        handleNewRegistrationClick();
        break;

      case NewWiseDepositTransactionStatus.APPROVAL_REQUIRED:
        try {
          await writeSubmitApproveAsync?.();
        } catch (error) {
          console.log('writeSubmitApproveAsync failed: ', error);
        }
        break;

      case NewWiseDepositTransactionStatus.VALID:
        try {
          await writeSubmitDepositAsync?.();
        } catch (error) {
          console.log('writeSubmitDepositAsync failed: ', error);
        }
        break;

      case NewWiseDepositTransactionStatus.TRANSACTION_SUCCEEDED:
        handleBackClick();
        break;

      case NewWiseDepositTransactionStatus.INSUFFICIENT_BALANCE:
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

  /*
   * Handlers
   */

  const handleNewRegistrationClick = () => {
    setIsNewRegistration(true);
  };

  const handleNewRegistrationBackClick = () => {
    setIsNewRegistration(false);
  };

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
    if (isNewRegistration) {
      return (
        <NewAccountRegistration
          handleBackClick={handleNewRegistrationBackClick}
        />
      );
    } else {
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
                { wiseStrings.get('NEW_DEPOSIT_INSTRUCTIONS') }
                <Link href="https://docs.zkp2p.xyz/zkp2p/user-guides/off-ramping/wise-deposit-id-verification" target="_blank">
                  Fetch your Wise tag ↗
                </Link>
              </NumberedStep>
            </InstructionsAndTogglesContainer>
            <InputsContainer>
              <Input
                label="Depositor Verification"
                name={`multiCurrency`}
                value={offRampId ? 'Verified' : 'Not Verified'}
                onChange={() => {}}
                readOnly={true}
                type="string"
                placeholder="multi_currency_id"
                helperText={wiseStrings.get('NEW_DEPOSIT_ADDITIONAL_REGISTRATION_TOOLTIP')}
                valueFontSize="18px"
              />

              <Input
                label="Wise Tag"
                name={`wiseTag`}
                value={wiseTagInput}
                onChange={(e) => {setWiseTagInput(e.currentTarget.value)}}
                type="string"
                placeholder="alexanders6341"
                helperText={wiseStrings.get('NEW_DEPOSIT_ID_TOOLTIP')}
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
                helperText={wiseStrings.get('NEW_DEPOSIT_AMOUNT_TOOLTIP')}
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
                inputLabel="EUR"
                placeholder="940"
                helperText={wiseStrings.get('NEW_DEPOSIT_RECEIVE_TOOLTIP')}
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
  };

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
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
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
