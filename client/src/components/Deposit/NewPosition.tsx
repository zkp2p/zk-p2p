import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'react-feather';
import styled from 'styled-components';
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from 'wagmi'

import { Button } from "../Button";
import { RowBetween } from '../layouts/Row'
import { ThemedText } from '../../theme/text'
import { Input } from "@components/Swap/Input";
import {
  calculatePackedVenmoId,
  isProvidedIdEqualToRegistration
} from '@helpers/poseidonHash'
import { toBigInt, toUsdcString } from '@helpers/units'
import { ZERO } from '@helpers/constants'
import useBalances from '@hooks/useBalance'
import useDeposits from '@hooks/useDeposits';
import useRampState from '@hooks/useRampState'
import useRegistration from '@hooks/useRegistration';
import useSmartContracts from '@hooks/useSmartContracts';


const NewDepositState = {
  MISSING_REGISTRATION: 'missing_registration',
  DEFAULT: 'default',
  INVALID_VENMO_ID: 'invalid_venmo_id',
  MISSING_AMOUNTS: 'missing_amounts',
  INSUFFICIENT_BALANCE: 'insufficient_balance',
  APPROVAL_REQUIRED: 'approval_required',
  CONVENIENCE_FEE_INVALID: 'convenience_fee_invalid',
  MAX_INTENTS_REACHED: 'max_intents_reached',
  MIN_DEPOSIT_THRESHOLD_NOT_MET: 'min_deposit_threshold_not_met',
  VALID: 'valid'
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
  const { rampAddress, rampAbi, usdcAddress, usdcAbi } = useSmartContracts()
  const { minimumDepositAmount } = useRampState()
  const { usdcApprovalToRamp, usdcBalance, refetchUsdcApprovalToRamp } = useBalances()
  const { refetchDeposits } = useDeposits()
  const { extractedVenmoId, registrationHash } = useRegistration();

  /*
   * State
   */
  const [depositState, setDepositState] = useState(NewDepositState.DEFAULT);
  const [venmoIdInput, setVenmoIdInput] = useState<string>('');
  const [depositAmountInput, setDepositAmountInput] = useState<string>('');
  const [receiveAmountInput, setReceiveAmountInput] = useState<string>('');

  const [isVenmoIdInputValid, setIsVenmoIdInputValid] = useState<boolean>(false);
  const [amountToApprove, setAmountToApprove] = useState<bigint>(ZERO);

  const [shouldConfigureSignalIntentWrite, setShouldConfigureSignalIntentWrite] = useState<boolean>(false);
  const [shouldConfigureApprovalWrite, setShouldConfigureApprovalWrite] = useState<boolean>(false);

  /*
   * Contract Writes
   */

  //
  // offRamp(bytes32 _venmoId, uint256 _depositAmount, uint256 _receiveAmount)
  //
  const { config: writeDepositConfig } = usePrepareContractWrite({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'offRamp',
    args: [
      calculatePackedVenmoId(venmoIdInput),
      toBigInt(depositAmountInput.toString()),
      toBigInt(receiveAmountInput.toString()),
    ],
    enabled: shouldConfigureSignalIntentWrite
  });

  const {
    data: submitDepositResult,
    isLoading: isSubmitDepositLoading,
    writeAsync: writeSubmitDepositAsync,
  } = useContractWrite(writeDepositConfig);

  const {
    isLoading: isSubmitDepositMining
  } = useWaitForTransaction({
    hash: submitDepositResult ? submitDepositResult.hash : undefined,
    onSuccess(data) {
      console.log('writeSubmitDepositAsync successful: ', data);
      
      refetchDeposits?.();
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
      rampAddress,
      amountToApprove
    ],
    enabled: shouldConfigureApprovalWrite
  });

  const {
    data: submitApproveResult,
    isLoading: isSubmitApproveLoading,
    writeAsync: writeSubmitApproveAsync
  } = useContractWrite(writeApproveConfig);

  const {
    isLoading: isSubmitApproveMining
  } = useWaitForTransaction({
    hash: submitApproveResult ? submitApproveResult.hash : undefined,
    onSuccess(data) {
      console.log('writeSubmitApproveAsync successful: ', data);
      
      refetchUsdcApprovalToRamp?.();
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
        if (!venmoIdInput) { 
          setDepositState(NewDepositState.DEFAULT);
        } else {
          if (!isVenmoIdInputValid) {
            setDepositState(NewDepositState.INVALID_VENMO_ID);
          } else {
            const usdcBalanceLoaded = usdcBalance !== null && usdcBalance !== undefined;
            const usdcApprovalToRampLoaded = usdcApprovalToRamp !== null && usdcApprovalToRamp !== undefined;
            const minimumDepositAmountLoaded = minimumDepositAmount !== null && minimumDepositAmount !== undefined;
  
            if (depositAmountInput && usdcBalanceLoaded && usdcApprovalToRampLoaded && minimumDepositAmountLoaded) {
              const depositAmountBI = toBigInt(depositAmountInput);
              const isDepositAmountGreaterThanBalance = depositAmountBI > usdcBalance;
              const isDepositAmountLessThanMinDepositSize = depositAmountBI < minimumDepositAmount;
              const isDepositAmountGreaterThanApprovedBalance = depositAmountBI > usdcApprovalToRamp;
        
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
      venmoIdInput,
      registrationHash,
      depositAmountInput,
      receiveAmountInput,
      minimumDepositAmount,
      usdcBalance,
      usdcApprovalToRamp,
      isVenmoIdInputValid,
    ]
  );

  useEffect(() => {
    const isApprovalRequired = depositState === NewDepositState.APPROVAL_REQUIRED;
    setShouldConfigureApprovalWrite(isApprovalRequired);
    
    setShouldConfigureSignalIntentWrite(depositState === NewDepositState.VALID);
  }, [depositState]);

  useEffect(() => {
    const usdcApprovalToRampLoaded = usdcApprovalToRamp !== null && usdcApprovalToRamp !== undefined;

    if (!depositAmountInput || !usdcApprovalToRampLoaded) {
      setAmountToApprove(ZERO);
    } else {
      const approvalDifference = toBigInt(depositAmountInput.toString()) - usdcApprovalToRamp;
      if (approvalDifference > ZERO) {
        setAmountToApprove(approvalDifference);
      } else {
        setAmountToApprove(ZERO);
      }
    }
    
  }, [depositAmountInput, usdcApprovalToRamp]);

  useEffect(() => {
    if (extractedVenmoId) {
      setVenmoId(extractedVenmoId);
    } else {
      setVenmoId('');
    }
  }, [extractedVenmoId]);

  /*
   * Helpers
   */

  const venmoInputErrorString = (): string => {
    // TODO: check that the input venmo ID matches the user's registration hash

    return ''
  }

  function isValidInput(value: string) {
    const isValid = /^-?\d*(\.\d{0,6})?$/.test(value);
    
    return parseFloat(value) >= 0 && isValid;
  }

  const depositAmountInputErrorString = (): string => {
    if (depositAmountInput) {
      switch (formState) {
        case NewPositionState.INSUFFICIENT_BALANCE:
          return `Current USDC balance: ${usdcBalance}`;
        
        case NewPositionState.MIN_DEPOSIT_THRESHOLD_NOT_MET:
          const minimumDepositAmountString = minimumDepositAmount ? toUsdcString(minimumDepositAmount) : '0';
          return `Minimum deposit amount is ${minimumDepositAmountString}`;

        case NewPositionState.APPROVAL_REQUIRED:
          const usdcApprovalToRampString = usdcApprovalToRamp ? toUsdcString(usdcApprovalToRamp) : '0';
          return `Current approved transfer amount: ${usdcApprovalToRampString}`;

        default:
          return '';
      }
    } else {
      return '';
    }
  }

  const ctaDisabled = (): boolean => {
    switch (formState) {
      case NewPositionState.INCOMPLETE:
      case NewPositionState.MIN_DEPOSIT_THRESHOLD_NOT_MET:
      case NewPositionState.CONVENIENCE_FEE_INVALID:
      case NewPositionState.INSUFFICIENT_BALANCE:
      case NewPositionState.MAX_INTENTS_REACHED:
        return true;

      case NewPositionState.APPROVAL_REQUIRED:
        return false;

      case NewPositionState.VALID:
      default:
        return false;
    }
  }

  const ctaText = (): string => {
    switch (formState) {
      case NewPositionState.APPROVAL_REQUIRED:
        return 'Approve USDC Transfer';

      case NewPositionState.INSUFFICIENT_BALANCE:
        return 'Insufficient USDC Balance';

      case NewPositionState.VALID:
      default:
        return 'Create Deposit';
    }
  }

  const ctaLoading = (): boolean => {
    switch (formState) {
      case NewPositionState.APPROVAL_REQUIRED:
        return isSubmitApproveLoading || isSubmitApproveMining;

      case NewPositionState.VALID:
        return isSubmitDepositLoading || isSubmitDepositMining;

      default:
        return false;
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

      default:
        break;
    }
  }

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
        <button
          onClick={handleBackClick}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <StyledArrowLeft/>
        </button>
        <ThemedText.HeadlineSmall style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
          New Position
        </ThemedText.HeadlineSmall>
      </RowBetween>

      <Body>
        <InputsContainer>
          <Input
            label="Venmo ID"
            name={`venmoId`}
            value={venmoIdInput}
            onChange={(e) => {setVenmoIdInput(e.currentTarget.value)}}
            type="number"
            placeholder="215524379021315184"
          />

          <Input
            label="Deposit Amount"
            name={`depositAmount`}
            value={depositAmountInput}
            onChange={(e) => handleInputChange(e.currentTarget.value, setDepositAmountInput)}
            type="number"
            inputLabel="USDC"
            placeholder="1000"
          />

          <Input
            label="Receive Amount"
            name={`receiveAmount`}
            value={receiveAmountInput}
            onChange={(e) => handleInputChange(e.currentTarget.value, setReceiveAmountInput)}
            type="number"
            inputLabel="USD"
            placeholder="1050"
          />

          <ButtonContainer>
            <Button
              disabled={ctaDisabled()}
              loading={ctaLoading()}
              onClick={async () => {
                ctaOnClick();
              }}
            >
              {ctaText()}
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
`
