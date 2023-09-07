import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'react-feather';
import styled from 'styled-components';
import { useContractWrite, usePrepareContractWrite } from 'wagmi'

import { Button } from "../Button";
import { RowBetween } from '../layouts/Row'
import { ThemedText } from '../../theme/text'
import { NumberedStep } from "../common/NumberedStep";
import { SingleLineInput } from "../common/SingleLineInput";
import { abi } from "../../helpers/abi/ramp.abi";
import useAccount from '../../hooks/useAccount'
import useRampRegistration from '../../hooks/useRampRegistration'
import useBalances from '../../hooks/useBalance'


interface NewPositionProps {
  loggedInWalletAddress: string;
  handleBackClick: () => void;
}
 
export const NewPosition: React.FC<NewPositionProps> = ({
  loggedInWalletAddress,
  handleBackClick
}) => {
  /*
   * Contexts
   */
  const { rampAddress } = useAccount()
  const { registrationHash, minimumDepositAmount } = useRampRegistration()
  const { usdcApprovalToRamp, usdcBalance } = useBalances()

  /*
   * State
   */
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [receiveAmount, setReceiveAmount] = useState<number>(0);
  const [convenienceFee, setConvenienceFee] = useState<number>(0);

  /*
    Contract Writes
  */

  //
  // offRamp(bytes32 _venmoId, uint256 _depositAmount, uint256 _receiveAmount, uint256 _convenienceFee)
  //
  const { config: writeDepositConfig } = usePrepareContractWrite({
    address: rampAddress as `0x${string}`,
    abi: abi,
    functionName: 'offRamp',
    args: [
      registrationHash,
      depositAmount,
      receiveAmount,
      convenienceFee,
    ],
    onError: (error: { message: any }) => {
      console.error(error.message);
    },
  });

  const {
    isLoading: isSubmitDepositLoading,
    write: writeSubmitDeposit
  } = useContractWrite(writeDepositConfig);

  /*
    Helpers
  */

  const depositAmountInputErrorString = (): string => {
    if (!depositAmount) {
      return '';
    }

    if (depositAmount < minimumDepositAmount) {
      return `Minimum deposit amount is ${minimumDepositAmount}`;
    }

    if (usdcApprovalToRamp) {
      if (depositAmount > usdcApprovalToRamp.toNumber()) {
        return `Current approved transfer amount: ${usdcApprovalToRamp}`;
      }
    }

    if (usdcBalance) {
      if (depositAmount > usdcBalance.toNumber()) {
        return `Current USDC balance: ${usdcBalance}`;
      }
    }

    return '';
  }

  const convenienceFeeInputErrorString = (): string => {
    if (!depositAmount || !convenienceFee) {
      return '';
    }

    if (convenienceFee > depositAmount) {
      return `Convenience fee cannot be greater than deposit amount`;
    }

    return '';
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
            label="Deposit Amount"
            value={depositAmount === 0 ? '' : depositAmount.toString()}
            placeholder={'1000'}
            error={depositAmountInputErrorString()}
            onChange={(e) => {
              setDepositAmount(e.currentTarget.value);
            }}
          />
          <SingleLineInput
            label="Receive Amount"
            value={receiveAmount === 0 ? '' : receiveAmount.toString()}
            placeholder={'1050'}
            onChange={(e) => {
              setReceiveAmount(e.currentTarget.value);
            }}
          />
          <SingleLineInput
            label="Convenience Fee"
            value={convenienceFee === 0 ? '' : convenienceFee.toString()}
            placeholder={'5'}
            error={convenienceFeeInputErrorString()}
            onChange={(e) => {
              setConvenienceFee(e.currentTarget.value);
            }}
          />
          <ButtonContainer>
            <Button
              disabled={depositAmount === 0 || receiveAmount === 0 || convenienceFee === 0}
              loading={isSubmitDepositLoading}
              onClick={async () => {
                writeSubmitDeposit?.();
              }}
            >
              Submit Deposit
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
