import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'react-feather';
import styled from 'styled-components';
import Link from '@mui/material/Link';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';

import { Button } from "@components/common/Button";
import { RowBetween } from '@components/layouts/Row';
import { ThemedText } from '@theme/text';
import { Input } from "@components/Deposit/Input";
import { NumberedStep } from "@components/common/NumberedStep";
import { calculatePackedVenmoId, isProvidedIdEqualToRegistration } from '@helpers/poseidonHash';
import { LoginStatus, NewDepositTransactionStatus } from '@helpers/types';
import { toBigInt, toUsdcString } from '@helpers/units';
import { ZERO } from '@helpers/constants';
import { venmoStrings } from '@helpers/strings';
import useAccount from '@hooks/useAccount';
import useBalances from '@hooks/useBalance';
import useDeposits from '@hooks/venmo/useDeposits';
import useRampState from '@hooks/venmo/useRampState';
import useRegistration from '@hooks/venmo/useRegistration';
import useSmartContracts from '@hooks/useSmartContracts';


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
  const { venmoRampAddress, venmoRampAbi, usdcAddress, usdcAbi } = useSmartContracts();
  const { minimumDepositAmount } = useRampState();
  const { usdcApprovalToRamp, usdcBalance, refetchUsdcApprovalToRamp, refetchUsdcBalance } = useBalances();
  const { refetchDeposits } = useDeposits();
  const { extractedVenmoId, registrationHash, setExtractedVenmoId } = useRegistration();

  /*
   * State
   */
  
  const [depositState, setDepositState] = useState(NewDepositTransactionStatus.DEFAULT);
  const [venmoIdInput, setVenmoIdInput] = useState<string>('');
  const [depositAmountInput, setDepositAmountInput] = useState<string>('');
  const [receiveAmountInput, setReceiveAmountInput] = useState<string>('');

  const [isVenmoIdInputValid, setIsVenmoIdInputValid] = useState<boolean>(false);
  const [amountToApprove, setAmountToApprove] = useState<bigint>(ZERO);

  const [shouldConfigureNewDepositWrite, setShouldConfigureNewDepositWrite] = useState<boolean>(false);
  const [shouldConfigureApprovalWrite, setShouldConfigureApprovalWrite] = useState<boolean>(false);

  /*
   * Contract Writes
   */

  //
  // offRamp(bytes32 _venmoId, uint256 _depositAmount, uint256 _receiveAmount)
  //
  const { config: writeDepositConfig } = usePrepareContractWrite({
    address: venmoRampAddress,
    abi: venmoRampAbi,
    functionName: 'offRamp',
    args: [
      calculatePackedVenmoId(venmoIdInput),
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

      refetchUsdcApprovalToRamp?.();

      setDepositState(NewDepositTransactionStatus.TRANSACTION_SUCCEEDED);
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
      venmoRampAddress,
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
        setDepositState(NewDepositTransactionStatus.TRANSACTION_SUCCEEDED);
      } else {
        if(!registrationHash) {
          setDepositState(NewDepositTransactionStatus.MISSING_REGISTRATION);
        } else {
          if (!venmoIdInput) { 
            setDepositState(NewDepositTransactionStatus.DEFAULT);
          } else {
            if (!isVenmoIdInputValid) {
              setDepositState(NewDepositTransactionStatus.INVALID_DEPOSITOR_ID);
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
      venmoIdInput,
      registrationHash,
      depositAmountInput,
      receiveAmountInput,
      minimumDepositAmount,
      usdcBalance,
      usdcApprovalToRamp,
      isVenmoIdInputValid,
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
    if (extractedVenmoId) {
      setVenmoIdInput(extractedVenmoId);
    } else {
      setVenmoIdInput('');
    }
  }, [extractedVenmoId]);

  useEffect(() => {
    const verifyVenmoIdInput = async () => {
      if (venmoIdInput.length < 18) {
        setIsVenmoIdInputValid(false);
      } else {
        if (registrationHash) {
          const validVenmoInput = await isProvidedIdEqualToRegistration(venmoIdInput, registrationHash);

          setIsVenmoIdInputValid(validVenmoInput);

          if (validVenmoInput && setExtractedVenmoId) {
            setExtractedVenmoId(venmoIdInput);
          };
        } else {
          setIsVenmoIdInputValid(false);
        }
      }
    };

    verifyVenmoIdInput();
  }, [venmoIdInput, registrationHash, setExtractedVenmoId]);

  /*
   * Helpers
   */

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
      case NewDepositTransactionStatus.INSUFFICIENT_BALANCE:
      case NewDepositTransactionStatus.MAX_INTENTS_REACHED:
      case NewDepositTransactionStatus.MISSING_REGISTRATION:
      case NewDepositTransactionStatus.MISSING_AMOUNTS:
      case NewDepositTransactionStatus.TRANSACTION_SIGNING:
      case NewDepositTransactionStatus.TRANSACTION_MINING:
        return true;

      case NewDepositTransactionStatus.APPROVAL_REQUIRED:
        return false;

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
        return 'Venmo id does not match registration';

      case NewDepositTransactionStatus.MISSING_AMOUNTS:
        return 'Input deposit and receive amounts';
      
      case NewDepositTransactionStatus.INSUFFICIENT_BALANCE:
        const humanReadableUsdcBalance = usdcBalance ? toUsdcString(usdcBalance) : '0';
        return `Insufficient USDC balance: ${humanReadableUsdcBalance}`;
      
      case NewDepositTransactionStatus.MIN_DEPOSIT_THRESHOLD_NOT_MET:
        const minimumDepositAmountString = minimumDepositAmount ? toUsdcString(minimumDepositAmount) : '0';
        return `Minimum deposit amount is ${minimumDepositAmountString}`;

      case NewDepositTransactionStatus.TRANSACTION_SIGNING:
        return 'Signing Transaction';

      case NewDepositTransactionStatus.TRANSACTION_MINING:
        return 'Mining Transaction';

      case NewDepositTransactionStatus.APPROVAL_REQUIRED:
        const usdcApprovalToRampString = usdcApprovalToRamp ? toUsdcString(usdcApprovalToRamp) : '0';
        return `Insufficient USDC transfer approval: ${usdcApprovalToRampString}`;

      case NewDepositTransactionStatus.VALID:
        return 'Create Deposit';

      case NewDepositTransactionStatus.TRANSACTION_SUCCEEDED:
        return 'Go to Deposits';

      case NewDepositTransactionStatus.DEFAULT:
      default:
        return 'Input valid Venmo Id';
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
            { venmoStrings.get('NEW_DEPOSIT_INSTRUCTIONS') }
            <Link href="https://docs.zkp2p.xyz/zkp2p/user-guides/off-ramping/fetch-your-venmo-id" target="_blank">
              Fetch Your Venmo ID ↗
            </Link>
          </NumberedStep>
        </InstructionsAndTogglesContainer>
        <InputsContainer>
          <Input
            label="Venmo ID"
            name={`venmoId`}
            value={venmoIdInput}
            onChange={(e) => {setVenmoIdInput(e.currentTarget.value)}}
            type="number"
            placeholder="215524379021315184"
            helperText={venmoStrings.get('NEW_DEPOSIT_ID_TOOLTIP')}
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
            helperText={venmoStrings.get('NEW_DEPOSIT_AMOUNT_TOOLTIP')}
          />

          <Input
            label="Receive Amount"
            name={`receiveAmount`}
            value={receiveAmountInput}
            onChange={(e) => handleInputChange(e.currentTarget.value, setReceiveAmountInput)}
            type="number"
            inputLabel="USD"
            placeholder="1050"
            helperText={venmoStrings.get('NEW_DEPOSIT_RECEIVE_TOOLTIP')}
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
