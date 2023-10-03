import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'react-feather';
import styled from 'styled-components';
import { useContractWrite, usePrepareContractWrite } from 'wagmi'

import { Button } from "../Button";
import { RowBetween } from '../layouts/Row'
import { ThemedText } from '../../theme/text'
import { NumberedStep } from "../common/NumberedStep";
import { SingleLineInput } from "../common/SingleLineInput";
import { calculatePackedVenmoId } from '@helpers/poseidonHash'
import { usdc, ether, fromUsdcToNaturalString } from '@helpers/units'
import { ZERO } from '@helpers/constants'
import useBalances from '@hooks/useBalance'
import useRampState from '@hooks/useRampState'
import useSmartContracts from '@hooks/useSmartContracts';


interface NewPositionProps {
  handleBackClick: () => void;
}

const NewPositionState = {
  INCOMPLETE: 'incomplete',
  INSUFFICIENT_BALANCE: 'insufficient_balance',
  APPROVAL_REQUIRED: 'approval_required',
  CONVENIENCE_FEE_INVALID: 'convenience_fee_invalid',
  MAX_INTENTS_REACHED: 'max_intents_reached',
  MIN_DEPOSIT_THRESHOLD_NOT_MET: 'min_deposit_threshold_not_met',
  VALID: 'valid'
};
 
export const NewPosition: React.FC<NewPositionProps> = ({
  handleBackClick
}) => {
  /*
    Contexts
  */
  const { rampAddress, rampAbi, usdcAddress, usdcAbi } = useSmartContracts()
  const { minimumDepositAmount } = useRampState()
  const { usdcApprovalToRamp, usdcBalance } = useBalances()

  /*
    State
  */
  const [formState, setFormState] = useState(NewPositionState.INCOMPLETE);
  const [venmoId, setVenmoId] = useState<string>("645716473020416186");
  const [depositAmountInput, setDepositAmountInput] = useState<number>(0);
  const [receiveAmountInput, setReceiveAmountInput] = useState<number>(0);
  const [convenienceFeeInput, setConvenienceFeeInput] = useState<number>(0);

  const [amountToApprove, setAmountToApprove] = useState<bigint>(ZERO);

  /*
    Contract Writes
  */

  //
  // offRamp(bytes32 _venmoId, uint256 _depositAmount, uint256 _receiveAmount, uint256 _convenienceFee)
  //
  const { config: writeDepositConfig } = usePrepareContractWrite({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'offRamp',
    args: [
      calculatePackedVenmoId(venmoId),
      usdc(depositAmountInput.toString()),
      usdc(receiveAmountInput.toString()),
      ether(convenienceFeeInput.toString()),
    ],
    onError: (error: { message: any }) => {
      console.error(error.message);
    },
  });

  const {
    isLoading: isSubmitDepositLoading,
    write: writeSubmitDeposit
  } = useContractWrite(writeDepositConfig);

  //
  // approve(address spender, uint256 value)
  //
  const { config: writeApproveConfig } = usePrepareContractWrite({
    address: usdcAddress,
    abi: usdcAbi,
    functionName: "approve",
    args: [
      rampAddress,
      usdc(amountToApprove.toString())
    ],
  });

  const {
    isLoading: isSubmitApproveLoading,
    write: writeSubmitApprove
  } = useContractWrite(writeApproveConfig);

  /*
    Hooks
  */

  useEffect(() => {
    const usdcBalanceLoaded = usdcBalance !== null && usdcBalance !== undefined;
    const usdcApprovalToRampLoaded = usdcApprovalToRamp !== null && usdcApprovalToRamp !== undefined;
    const minimumDepositAmountLoaded = minimumDepositAmount !== null && minimumDepositAmount !== undefined;

    if (depositAmountInput && usdcBalanceLoaded && usdcApprovalToRampLoaded && minimumDepositAmountLoaded) {
      const depositAmountForComparison = BigInt(depositAmountInput);

      if (depositAmountForComparison > usdcBalance) {
        setFormState(NewPositionState.INSUFFICIENT_BALANCE);
      } else if (depositAmountForComparison < minimumDepositAmount) {
        setFormState(NewPositionState.MIN_DEPOSIT_THRESHOLD_NOT_MET);
      } else if (depositAmountForComparison > usdcApprovalToRamp) {
        setFormState(NewPositionState.APPROVAL_REQUIRED);
      } else {
        if (receiveAmountInput && convenienceFeeInput) {
          if (convenienceFeeInput > depositAmountInput) {
            setFormState(NewPositionState.CONVENIENCE_FEE_INVALID);
          } else {
            setFormState(NewPositionState.VALID);
          }
        } else {
          setFormState(NewPositionState.INCOMPLETE);
        }
      }
    } else {
      setFormState(NewPositionState.INCOMPLETE);
    }
  }, [
      depositAmountInput,
      receiveAmountInput,
      convenienceFeeInput,
      minimumDepositAmount,
      usdcBalance,
      usdcApprovalToRamp
    ]
  );

  useEffect(() => {
    const usdcApprovalToRampLoaded = usdcApprovalToRamp !== null && usdcApprovalToRamp !== undefined;

    if (!depositAmountInput || !usdcApprovalToRampLoaded) {
      setAmountToApprove(ZERO);
    } else {
      const approvalDifference = usdc(depositAmountInput.toString()) - usdcApprovalToRamp;
      if (approvalDifference > ZERO) {
        setAmountToApprove(approvalDifference);
      } else {
        setAmountToApprove(ZERO);
      }
    }
    
  }, [depositAmountInput, usdcApprovalToRamp]);

  /*
    Helpers
  */

  const venmoInputErrorString = (): string => {
    // TODO: check that the input venmo ID matches the user's registration hash

    return ''
  }

  const depositAmountInputErrorString = (): string => {
    if (depositAmountInput) {
      switch (formState) {
        case NewPositionState.INSUFFICIENT_BALANCE:
          return `Current USDC balance: ${usdcBalance}`;
        
        case NewPositionState.MIN_DEPOSIT_THRESHOLD_NOT_MET:
          return `Minimum deposit amount is ${minimumDepositAmount}`;

        case NewPositionState.APPROVAL_REQUIRED:
          return `Current approved transfer amount: ${usdcApprovalToRamp}`;

        default:
          return '';
      }
    } else {
      return '';
    }
  }

  const convenienceFeeInputErrorString = (): string => {
    if (depositAmountInput && convenienceFeeInput) {
      if (convenienceFeeInput > depositAmountInput) {
        return `Convenience fee cannot be greater than deposit amount`;
      } else {
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
        return 'Submit Deposit';
    }
  }

  const ctaLoading = (): boolean => {
    switch (formState) {
      case NewPositionState.APPROVAL_REQUIRED:
        return isSubmitApproveLoading;

      case NewPositionState.VALID:
        return isSubmitDepositLoading;

      default:
        return false;
    }
  }

  const ctaOnClick = async () => {
    switch (formState) {
      case NewPositionState.APPROVAL_REQUIRED:
        writeSubmitApprove?.();
        break;

      case NewPositionState.VALID:
        writeSubmitDeposit?.();
        break;

      default:
        break;
    }
  }

  return (
    <Container>
      <Column>
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
          <NumberedStep>
            Create a new deposit by specifying the amount of USDC you want to deposit and the conversion rate you want to charge.
          </NumberedStep>
          <SingleLineInput
            label="Vennmo ID"
            value={venmoId}
            placeholder={'215524379021315184'}
            error={venmoInputErrorString()}
            onChange={(e) => {
              const value = e.currentTarget.value;
              setVenmoId(value);
            }}
          />
          <SingleLineInput
            label="Deposit Amount"
            value={depositAmountInput === 0 ? '' : depositAmountInput.toString()}
            placeholder={'1000'}
            error={depositAmountInputErrorString()}
            onChange={(e) => {
              const value = e.currentTarget.value;
              if (value === "") {
                setDepositAmountInput(0);
              } else if (!isNaN(value) && parseFloat(value) >= 0) {
                setDepositAmountInput(parseFloat(value));
              }
            }}
          />
          <SingleLineInput
            label="Receive Amount"
            value={receiveAmountInput === 0 ? '' : receiveAmountInput.toString()}
            placeholder={'1050'}
            onChange={(e) => {
              const value = e.currentTarget.value;
              if (value === "") {
                setReceiveAmountInput(0);
              } else if (!isNaN(value) && parseFloat(value) >= 0) {
                setReceiveAmountInput(parseFloat(value));
              }
            }}
          />
          <SingleLineInput
            label="Convenience Fee"
            value={convenienceFeeInput === 0 ? '' : convenienceFeeInput.toString()}
            placeholder={'5'}
            error={convenienceFeeInputErrorString()}
            onChange={(e) => {
              const value = e.currentTarget.value;
              if (value === "") {
                setConvenienceFeeInput(0);
              } else if (!isNaN(value) && parseFloat(value) >= 0) {
                setConvenienceFeeInput(parseFloat(value));
              }
            }}
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
        </Body>
      </Column>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  gap: 1rem;
`;

const Column = styled.div`
  gap: 1rem;
  align-self: flex-start;
  border-radius: 16px;
  justify-content: center;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background-color: #0D111C;
`;

const ButtonContainer = styled.div`
  display: grid;
`;

const StyledArrowLeft = styled(ArrowLeft)`
  color: #FFF;
`
