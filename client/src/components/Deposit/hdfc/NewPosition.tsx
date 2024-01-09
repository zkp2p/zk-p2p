import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'react-feather';
import styled from 'styled-components';
import Link from '@mui/material/Link';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';

import { TransactionButton } from "@components/common/TransactionButton";
import { RowBetween } from '@components/layouts/Row';
import { ThemedText } from '@theme/text';
import { Input } from "@components/Deposit/Input";
import { NumberedStep } from "@components/common/NumberedStep";
import { calculatePackedUPIId } from '@helpers/poseidonHash';
import { toBigInt, toUsdcString } from '@helpers/units';
import { ZERO } from '@helpers/constants';
import { hdfcStrings } from '@helpers/strings';
import useAccount from '@hooks/useAccount';
import useBalances from '@hooks/useBalance';
import useHdfcRampState from '@hooks/hdfc/useRampState';
import useHdfcDeposits from '@hooks/hdfc/useDeposits';
import useHdfcRegistration from '@hooks/hdfc/useRegistration';
import useSmartContracts from '@hooks/useSmartContracts';


const NewDepositState = {
  MISSING_REGISTRATION: 'missing_registration',
  DEFAULT: 'default',
  INVALID_UPI_ID: 'invalid_upi_id',
  MISSING_AMOUNTS: 'missing_amounts',
  INSUFFICIENT_BALANCE: 'insufficient_balance',
  APPROVAL_REQUIRED: 'approval_required',
  CONVENIENCE_FEE_INVALID: 'convenience_fee_invalid',
  MAX_INTENTS_REACHED: 'max_intents_reached',
  MIN_DEPOSIT_THRESHOLD_NOT_MET: 'min_deposit_threshold_not_met',
  VALID: 'valid',
  TRANSACTION_SUCCEEDED: 'transaction_succeeded'
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

  const { isLoggedIn } = useAccount();
  const { hdfcRampAddress, hdfcRampAbi, usdcAddress, usdcAbi } = useSmartContracts();
  const { minimumDepositAmount } = useHdfcRampState();
  const { usdcApprovalToHdfcRamp, usdcBalance, refetchUsdcApprovalToHdfcRamp, refetchUsdcBalance } = useBalances();
  const { refetchDeposits } = useHdfcDeposits();
  const { registrationHash } = useHdfcRegistration();

  /*
   * State
   */
  const [depositState, setDepositState] = useState(NewDepositState.DEFAULT);
  const [upiIdInput, setUpiIdInput] = useState<string>('');
  const [depositAmountInput, setDepositAmountInput] = useState<string>('');
  const [receiveAmountInput, setReceiveAmountInput] = useState<string>('');

  const [isUpiIdInputValid, setIsUpiInputValid] = useState<boolean>(false);
  const [amountToApprove, setAmountToApprove] = useState<bigint>(ZERO);

  const [shouldConfigureNewDepositWrite, setShouldConfigureNewDepositWrite] = useState<boolean>(false);
  const [shouldConfigureApprovalWrite, setShouldConfigureApprovalWrite] = useState<boolean>(false);

  /*
   * Contract Writes
   */

  //
  // offRamp(bytes32 _upiId, uint256 _depositAmount, uint256 _receiveAmount)
  //
  const { config: writeDepositConfig } = usePrepareContractWrite({
    address: hdfcRampAddress,
    abi: hdfcRampAbi,
    functionName: 'offRamp',
    args: [
      calculatePackedUPIId(upiIdInput),
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

      refetchUsdcApprovalToHdfcRamp?.();

      setDepositState(NewDepositState.TRANSACTION_SUCCEEDED);
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
      hdfcRampAddress,
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
      
      refetchUsdcApprovalToHdfcRamp?.();

      refetchUsdcBalance?.();
    },
  });

  /*
   * Hooks
   */

  useEffect(() => {
    const updateDepositState = async () => {
      if(!registrationHash) {
        setDepositState(NewDepositState.MISSING_REGISTRATION);
      } else {
        if (!upiIdInput) { 
          setDepositState(NewDepositState.DEFAULT);
        } else {
          if (!isUpiIdInputValid) {
            setDepositState(NewDepositState.INVALID_UPI_ID);
          } else {
            const usdcBalanceLoaded = usdcBalance !== null;
            const usdcApprovalToRampLoaded = usdcApprovalToHdfcRamp !== null;
            const minimumDepositAmountLoaded = minimumDepositAmount !== null;

  
            if (depositAmountInput && usdcBalanceLoaded && usdcApprovalToRampLoaded && minimumDepositAmountLoaded) {
              const depositAmountBI = toBigInt(depositAmountInput);
              const isDepositAmountGreaterThanBalance = depositAmountBI > usdcBalance;
              const isDepositAmountLessThanMinDepositSize = depositAmountBI < minimumDepositAmount;
              const isDepositAmountGreaterThanApprovedBalance = depositAmountBI > usdcApprovalToHdfcRamp;
        
              if (isDepositAmountGreaterThanBalance) {
                setDepositState(NewDepositState.INSUFFICIENT_BALANCE);
              } else if (isDepositAmountLessThanMinDepositSize) {
                setDepositState(NewDepositState.MIN_DEPOSIT_THRESHOLD_NOT_MET);
              } else if (isDepositAmountGreaterThanApprovedBalance) {
                setDepositState(NewDepositState.APPROVAL_REQUIRED);
              } else {
                if (receiveAmountInput) {
                  setDepositState(NewDepositState.VALID);
                } else {
                  setDepositState(NewDepositState.MISSING_AMOUNTS);
                }
              }
            } else {
              setDepositState(NewDepositState.MISSING_AMOUNTS);
            }
          }
        }
      }
    }

    updateDepositState();
  }, [
      upiIdInput,
      registrationHash,
      depositAmountInput,
      receiveAmountInput,
      minimumDepositAmount,
      usdcBalance,
      usdcApprovalToHdfcRamp,
      isUpiIdInputValid,
    ]
  );

  useEffect(() => {
    const isApprovalRequired = depositState === NewDepositState.APPROVAL_REQUIRED;
    setShouldConfigureApprovalWrite(isApprovalRequired);
    
    setShouldConfigureNewDepositWrite(depositState === NewDepositState.VALID);
  }, [depositState]);

  useEffect(() => {
    const usdcApprovalToRampLoaded = usdcApprovalToHdfcRamp !== null && usdcApprovalToHdfcRamp !== undefined;

    if (!depositAmountInput || !usdcApprovalToRampLoaded) {
      setAmountToApprove(ZERO);
    } else {
      const approvalDifference = toBigInt(depositAmountInput.toString()) - usdcApprovalToHdfcRamp;
      if (approvalDifference > ZERO) {
        setAmountToApprove(approvalDifference);
      } else {
        setAmountToApprove(ZERO);
      }
    }
    
  }, [depositAmountInput, usdcApprovalToHdfcRamp]);

  useEffect(() => {
    const validUpiInput = isValidUpiId(upiIdInput);
  
    setIsUpiInputValid(validUpiInput);
  }, [upiIdInput]);

  /*
   * Helpers
   */

  function isValidUpiId(value: string) {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;

    return upiRegex.test(value);
  }

  function isValidInput(value: string) {
    const isValid = /^-?\d*(\.\d{0,6})?$/.test(value);
    
    return parseFloat(value) >= 0 && isValid;
  }

  const ctaDisabled = (): boolean => {
    switch (depositState) {
      case NewDepositState.DEFAULT:
      case NewDepositState.INVALID_UPI_ID:
      case NewDepositState.MIN_DEPOSIT_THRESHOLD_NOT_MET:
      case NewDepositState.CONVENIENCE_FEE_INVALID:
      case NewDepositState.INSUFFICIENT_BALANCE:
      case NewDepositState.MAX_INTENTS_REACHED:
      case NewDepositState.MISSING_REGISTRATION:
      case NewDepositState.MISSING_AMOUNTS:
        return true;

      case NewDepositState.APPROVAL_REQUIRED:
        return false;

      case NewDepositState.VALID:
      default:
        return false;
    }
  }

  const ctaText = (): string => {
    switch (depositState) {
      case NewDepositState.MISSING_REGISTRATION:
        return 'Missing registration';

      case NewDepositState.INVALID_UPI_ID:
        return 'UPI id does not match registration';

      case NewDepositState.MISSING_AMOUNTS:
        return 'Input deposit and receive amounts';
      
      case NewDepositState.INSUFFICIENT_BALANCE:
        const humanReadableUsdcBalance = usdcBalance ? toUsdcString(usdcBalance) : '0';
        return `Insufficient USDC balance: ${humanReadableUsdcBalance}`;
      
      case NewDepositState.MIN_DEPOSIT_THRESHOLD_NOT_MET:
        const minimumDepositAmountString = minimumDepositAmount ? toUsdcString(minimumDepositAmount) : '0';
        return `Minimum deposit amount is ${minimumDepositAmountString}`;

      case NewDepositState.APPROVAL_REQUIRED:
        const usdcApprovalToRampString = usdcApprovalToHdfcRamp ? toUsdcString(usdcApprovalToHdfcRamp) : '0';
        return `Insufficient USDC transfer approval: ${usdcApprovalToRampString}`;

      case NewDepositState.VALID:
        return 'Create Deposit';

      case NewDepositState.TRANSACTION_SUCCEEDED:
        return 'Go to Deposits';

      case NewDepositState.DEFAULT:
      default:
        return 'Input valid UPI Id';

    }
  }

  const ctaOnClick = async () => {
    switch (depositState) {
      case NewDepositState.APPROVAL_REQUIRED:
        try {
          await writeSubmitApproveAsync?.();
        } catch (error) {
          console.log('writeSubmitApproveAsync failed: ', error);
        }
        break;

      case NewDepositState.VALID:
        try {
          await writeSubmitDepositAsync?.();
        } catch (error) {
          console.log('writeSubmitDepositAsync failed: ', error);
        }
        break;

      case NewDepositState.TRANSACTION_SUCCEEDED:
        handleBackClick();
        break;

      default:
        break;
    }
  }

  const signTransactionStateFromDepositState = () => {
    switch (depositState) {
      case NewDepositState.APPROVAL_REQUIRED:
        return signApproveTransactionStatus;

      case NewDepositState.VALID:
        return signDepositTransactionStatus;

      default:
        return signDepositTransactionStatus;
    }
  }

  const mineTransactionStateFromDepositState = () => {
    switch (depositState) {
      case NewDepositState.APPROVAL_REQUIRED:
        return mineApproveTransactionStatus;

      case NewDepositState.VALID:
        return mineDepositTransactionStatus;

      default:
        return mineDepositTransactionStatus;
    }
  }

  const usdcBalanceLabel = useMemo(() => {
    if (isLoggedIn && usdcBalance !== null) {
      return `Balance: ${toUsdcString(usdcBalance)}`
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
            { hdfcStrings.get('NEW_DEPOSIT_INSTRUCTIONS') }
          </NumberedStep>
        </InstructionsAndTogglesContainer>
        <InputsContainer>
          <Input
            label="UPI ID"
            name={`upiId`}
            value={upiIdInput}
            onChange={(e) => {setUpiIdInput(e.currentTarget.value)}}
            type="text"
            placeholder="0xsachink@okhdfcbank"
            helperText={hdfcStrings.get('NEW_DEPOSIT_ID_TOOLTIP')}
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
            helperText={hdfcStrings.get('NEW_DEPOSIT_AMOUNT_TOOLTIP')}
          />

          <Input
            label="Receive Amount"
            name={`receiveAmount`}
            value={receiveAmountInput}
            onChange={(e) => handleInputChange(e.currentTarget.value, setReceiveAmountInput)}
            type="number"
            inputLabel="INR"
            placeholder="1050"
            helperText={hdfcStrings.get('NEW_DEPOSIT_RECEIVE_TOOLTIP')}
          />

          <ButtonContainer>
            <TransactionButton
              signTransactionStatus={signTransactionStateFromDepositState()}
              mineTransactionStatus={mineTransactionStateFromDepositState()}
              disabled={ctaDisabled()}
              defaultLabel={ctaText()}
              minedLabel={'Go to Deposits'}
              onClick={async () => {
                ctaOnClick();
              }}
            />
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
  background-color: #0D111C;
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
