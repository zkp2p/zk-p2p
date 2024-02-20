import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft } from 'react-feather';
import styled from 'styled-components';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';

import { Button } from "@components/common/Button";
import { RowBetween } from '@components/layouts/Row';
import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';
import { Input } from "@components/Deposit/Input";
import { NumberedStep } from "@components/common/NumberedStep";
import { toBigInt, toUsdcString } from '@helpers/units';
import { LoginStatus, NewDepositTransactionStatus } from '@helpers/types';
import { ZERO } from '@helpers/constants';
import { garantiStrings } from '@helpers/strings';
import { MODALS } from '@helpers/types';
import useAccount from '@hooks/useAccount';
import useBalances from '@hooks/useBalance';
import useGarantiRampState from '@hooks/garanti/useRampState';
import useGarantiDeposits from '@hooks/garanti/useDeposits';
import useGarantiRegistration from '@hooks/garanti/useRegistration';
import useSmartContracts from '@hooks/useSmartContracts';
import useModal from '@hooks/useModal';


interface NewPositionProps {
  handleBackClick: () => void;
}
 
export const NewPosition: React.FC<NewPositionProps> = ({
  handleBackClick
}) => {
  const latestIbanInputRef = useRef("");

  /*
   * Contexts
   */

  const { isLoggedIn, loginStatus } = useAccount();
  const { garantiRampAddress, garantiRampAbi, usdcAddress, usdcAbi } = useSmartContracts();
  const { minimumDepositAmount } = useGarantiRampState();
  const { usdcApprovalToGarantiRamp, usdcBalance, refetchUsdcApprovalToGarantiRamp, refetchUsdcBalance } = useBalances();
  const { refetchDeposits } = useGarantiDeposits();
  const { storedGarantiId, registrationHash, setStoredGarantiId } = useGarantiRegistration();
  const { openModal } = useModal();

  /*
   * State
   */

  const [depositState, setDepositState] = useState(NewDepositTransactionStatus.DEFAULT);
  const [garantiIbanInput, setGarantiIdInput] = useState<string>('');
  const [depositAmountInput, setDepositAmountInput] = useState<string>('');
  const [receiveAmountInput, setReceiveAmountInput] = useState<string>('');

  const [isGarantiIdInputValid, setIsGarantiIbanInputValid] = useState<boolean>(false);
  const [amountToApprove, setAmountToApprove] = useState<bigint>(ZERO);

  const [shouldConfigureNewDepositWrite, setShouldConfigureNewDepositWrite] = useState<boolean>(false);
  const [shouldConfigureApprovalWrite, setShouldConfigureApprovalWrite] = useState<boolean>(false);

  /*
   * Contract Writes
   */

  //
  // offRamp(string _garantiIban, uint256 _depositAmount, uint256 _receiveAmount)
  //
  const { config: writeDepositConfig } = usePrepareContractWrite({
    address: garantiRampAddress,
    abi: garantiRampAbi,
    functionName: 'offRamp',
    args: [
      garantiIbanInput,
      toBigInt(depositAmountInput.toString()),
      toBigInt(receiveAmountInput.toString()),
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

      refetchUsdcApprovalToGarantiRamp?.();
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
      garantiRampAddress,
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
      
      refetchUsdcApprovalToGarantiRamp?.();

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
        setDepositState(NewDepositTransactionStatus.TRANSACTION_SUCCEEDED);
      } else {
        if(!registrationHash) {
          setDepositState(NewDepositTransactionStatus.MISSING_REGISTRATION);
        } else {
          if (!garantiIbanInput) { 
            setDepositState(NewDepositTransactionStatus.DEFAULT);
          } else {
            if (!isGarantiIdInputValid) {
              setDepositState(NewDepositTransactionStatus.INVALID_DEPOSITOR_ID);
            } else {
              const usdcBalanceLoaded = usdcBalance !== null;
              const usdcApprovalToRampLoaded = usdcApprovalToGarantiRamp !== null;
              const minimumDepositAmountLoaded = minimumDepositAmount !== null;
  
              if (depositAmountInput && usdcBalanceLoaded && usdcApprovalToRampLoaded && minimumDepositAmountLoaded) {
                const depositAmountBI = toBigInt(depositAmountInput);
                const isDepositAmountGreaterThanBalance = depositAmountBI > usdcBalance;
                const isDepositAmountLessThanMinDepositSize = depositAmountBI < minimumDepositAmount;
                const isDepositAmountGreaterThanApprovedBalance = depositAmountBI > usdcApprovalToGarantiRamp;
          
                const signingApproveTransaction = signApproveTransactionStatus === 'loading';
                const miningApproveTransaction = mineApproveTransactionStatus === 'loading';
                const successfulApproveTransaction = mineApproveTransactionStatus === 'success';

                if (isDepositAmountGreaterThanBalance) {
                  setDepositState(NewDepositTransactionStatus.INSUFFICIENT_BALANCE);
                } else if (isDepositAmountLessThanMinDepositSize) {
                  setDepositState(NewDepositTransactionStatus.MIN_DEPOSIT_THRESHOLD_NOT_MET);
                } else if (isDepositAmountGreaterThanApprovedBalance && !successfulApproveTransaction) {
                  if (signingApproveTransaction) {
                    setDepositState(NewDepositTransactionStatus.TRANSACTION_SIGNING);
                  } else if (miningApproveTransaction) {
                    setDepositState(NewDepositTransactionStatus.TRANSACTION_MINING);
                  } else {
                    setDepositState(NewDepositTransactionStatus.APPROVAL_REQUIRED);
                  }
                } else {
                  if (receiveAmountInput) {
                    const signingDepositTransaction = signDepositTransactionStatus === 'loading';
                    const miningDepositTransaction = mineDepositTransactionStatus === 'loading';

                    if (signingDepositTransaction) {
                      setDepositState(NewDepositTransactionStatus.TRANSACTION_SIGNING);
                    } else if (miningDepositTransaction){
                      setDepositState(NewDepositTransactionStatus.TRANSACTION_MINING);
                    } else {
                      setDepositState(NewDepositTransactionStatus.VALID);
                    }
                  } else {
                    setDepositState(NewDepositTransactionStatus.MISSING_AMOUNTS);
                  }
                }
              } else {
                setDepositState(NewDepositTransactionStatus.MISSING_AMOUNTS);
              }
            }
          }
        }
      }
    }

    updateDepositState();
  }, [
      garantiIbanInput,
      registrationHash,
      depositAmountInput,
      receiveAmountInput,
      minimumDepositAmount,
      usdcBalance,
      usdcApprovalToGarantiRamp,
      isGarantiIdInputValid,
      signApproveTransactionStatus,
      mineApproveTransactionStatus,
      signDepositTransactionStatus,
      mineDepositTransactionStatus,
    ]
  );

  useEffect(() => {
    const isApprovalRequired = depositState === NewDepositTransactionStatus.APPROVAL_REQUIRED;
    setShouldConfigureApprovalWrite(isApprovalRequired);
    
    setShouldConfigureNewDepositWrite(depositState === NewDepositTransactionStatus.VALID);
  }, [depositState]);

  useEffect(() => {
    const usdcApprovalToRampLoaded = usdcApprovalToGarantiRamp !== null && usdcApprovalToGarantiRamp !== undefined;

    if (!depositAmountInput || !usdcApprovalToRampLoaded) {
      setAmountToApprove(ZERO);
    } else {
      const depositAmountBI = toBigInt(depositAmountInput.toString());
      const approvalDifference = depositAmountBI - usdcApprovalToGarantiRamp;
      if (approvalDifference > ZERO) {
        setAmountToApprove(depositAmountBI);
      } else {
        setAmountToApprove(ZERO);
      }
    }
    
  }, [depositAmountInput, usdcApprovalToGarantiRamp]);

  useEffect(() => {
    if (storedGarantiId) {
      setGarantiIdInput(storedGarantiId);
    } else {
      setGarantiIdInput('');
    }
  }, [storedGarantiId]);
  
  useEffect(() => {
    const validIbanInput = isValidGarantiIbanRegex(garantiIbanInput);

    setIsGarantiIbanInputValid(validIbanInput);

    if (validIbanInput && setStoredGarantiId) {
      setStoredGarantiId(garantiIbanInput);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [garantiIbanInput, setStoredGarantiId]);

  /*
   * Helpers
   */

  function isValidGarantiIbanRegex(value: string) {
    const ibanRegex = /^TR\d{2}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{2}$/;

    return ibanRegex.test(value);
  }

  function isValidInput(value: string) {
    const isValid = /^-?\d*(\.\d{0,6})?$/.test(value);
    
    return parseFloat(value) >= 0 && isValid;
  }

  const ctaDisabled = (): boolean => {
    switch (depositState) {
      case NewDepositTransactionStatus.DEFAULT:
      case NewDepositTransactionStatus.INVALID_DEPOSITOR_ID:
      case NewDepositTransactionStatus.MIN_DEPOSIT_THRESHOLD_NOT_MET:
      case NewDepositTransactionStatus.CONVENIENCE_FEE_INVALID:
      case NewDepositTransactionStatus.MAX_INTENTS_REACHED:
      case NewDepositTransactionStatus.MISSING_REGISTRATION:
      case NewDepositTransactionStatus.MISSING_AMOUNTS:
      case NewDepositTransactionStatus.TRANSACTION_SIGNING:
      case NewDepositTransactionStatus.TRANSACTION_MINING:
        return true;

      case NewDepositTransactionStatus.INSUFFICIENT_BALANCE:
      case NewDepositTransactionStatus.APPROVAL_REQUIRED:
      case NewDepositTransactionStatus.VALID:
      default:
        return false;
    }
  }

  const ctaLoading = (): boolean => {
    switch (depositState) {
      case NewDepositTransactionStatus.TRANSACTION_SIGNING:
      case NewDepositTransactionStatus.TRANSACTION_MINING:
        return loginStatus === LoginStatus.AUTHENTICATED;

      default:
        return false;
    }
  };

  const ctaText = (): string => {
    switch (depositState) {
      case NewDepositTransactionStatus.MISSING_REGISTRATION:
        return 'Missing registration';

      case NewDepositTransactionStatus.INVALID_DEPOSITOR_ID:
        return 'Invalid IBAN address';

      case NewDepositTransactionStatus.MISSING_AMOUNTS:
        return 'Input deposit and receive amounts';
      
      case NewDepositTransactionStatus.INSUFFICIENT_BALANCE:
        return `Insufficient balance — Deposit USDC`;
      
      case NewDepositTransactionStatus.MIN_DEPOSIT_THRESHOLD_NOT_MET:
        const minimumDepositAmountString = minimumDepositAmount ? toUsdcString(minimumDepositAmount, true) : '0';
        return `Minimum deposit amount is ${minimumDepositAmountString}`;

      case NewDepositTransactionStatus.TRANSACTION_SIGNING:
        return 'Signing Transaction';

      case NewDepositTransactionStatus.TRANSACTION_MINING:
        return 'Mining Transaction';

      case NewDepositTransactionStatus.APPROVAL_REQUIRED:
        const usdcApprovalToRampString = usdcApprovalToGarantiRamp ? toUsdcString(usdcApprovalToGarantiRamp, true) : '0';
        return `Insufficient USDC transfer approval: ${usdcApprovalToRampString}`;

      case NewDepositTransactionStatus.VALID:
        return 'Create Deposit';

      case NewDepositTransactionStatus.TRANSACTION_SUCCEEDED:
        return 'Go to Deposits';

      case NewDepositTransactionStatus.DEFAULT:
      default:
        return 'Input valid IBAN address';

    }
  }

  const ctaOnClick = async () => {
    switch (depositState) {
      case NewDepositTransactionStatus.APPROVAL_REQUIRED:
        try {
          await writeSubmitApproveAsync?.();
        } catch (error) {
          console.log('writeSubmitApproveAsync failed: ', error);
        }
        break;

      case NewDepositTransactionStatus.VALID:
        try {
          await writeSubmitDepositAsync?.();
        } catch (error) {
          console.log('writeSubmitDepositAsync failed: ', error);
        }
        break;

      case NewDepositTransactionStatus.TRANSACTION_SUCCEEDED:
        handleBackClick();
        break;

      case NewDepositTransactionStatus.INSUFFICIENT_BALANCE:
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

  const handleInputChange = (value: string, setInputFunction: React.Dispatch<React.SetStateAction<string>>) => {
    if (value === "") {
      setInputFunction('');
    } else if (value === ".") {
      setInputFunction('0.');
    } else if (isValidInput(value)) {
      setInputFunction(value);
    }
  };

  return (
    <Container>
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
            { garantiStrings.get('NEW_DEPOSIT_INSTRUCTIONS') }
          </NumberedStep>
        </InstructionsAndTogglesContainer>
        <InputsContainer>
          <Input
            label="Garanti IBAN"
            name={`garantiIban`}
            value={garantiIbanInput}
            onChange={(e) => {
              setGarantiIdInput(e.currentTarget.value)
              latestIbanInputRef.current = e.currentTarget.value
            }}
            type="text"
            placeholder="TR12 3456 7890 1234 5678 9012 34"
            helperText={garantiStrings.get('NEW_DEPOSIT_ID_TOOLTIP')}
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
            helperText={garantiStrings.get('NEW_DEPOSIT_AMOUNT_TOOLTIP')}
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
            inputLabel="TRL"
            placeholder="82800"
            helperText={garantiStrings.get('NEW_DEPOSIT_RECEIVE_TOOLTIP')}
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
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
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
