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
import { NumberedStep } from "../common/NumberedStep";
import { SingleLineInput } from "../common/SingleLineInput";
import useSmartContracts from '@hooks/useSmartContracts';
import usePermissions from '@hooks/usePermissions';


interface NewPermissionProps {
  handleBackClick: () => void;
}
 
export const NewPermission: React.FC<NewPermissionProps> = ({
  handleBackClick
}) => {
  /*
    Contexts
  */

  const { rampAddress, rampAbi } = useSmartContracts()
  const { refetchDeniedUsers } = usePermissions()
  
  /*
   * State
   */
  
  const [userHashInput, setUserHashInput] = useState<string>('');

  const [shouldConfigurePermissionWrite, setShouldConfigurePermissionWrite] = useState<boolean>(false); 

  /*
    Contract Writes
  */

  //
  // addAccountToDenylist(bytes32 _deniedUser)
  //
  const { config: writePermissionConfig } = usePrepareContractWrite({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'addAccountToDenylist',
    args: [
      userHashInput,
    ],
    onError: (error: { message: any }) => {
      console.error(error.message);
    },
    enabled: shouldConfigurePermissionWrite
  });

  const {
    data: submitPermissionResult,
    isLoading: isSubmitPermissionLoading,
    writeAsync: writeSubmitPermissionAsync
  } = useContractWrite(writePermissionConfig);

  const {
    isLoading: isSubmitPermissionMining
  } = useWaitForTransaction({
    hash: submitPermissionResult ? submitPermissionResult.hash : undefined,
    onSuccess(data) {
      console.log('writeSubmitPermissionAsync successful: ', data);
      
      refetchDeniedUsers?.();
    },
  });

  /*
    Hooks
  */

  useEffect(() => {
    if (userHashInput) {
      const isValidBytes32 = userHashInput.length === 66;
      setShouldConfigurePermissionWrite(isValidBytes32);
    } else {
      setShouldConfigurePermissionWrite(false);
    }
  }, [userHashInput]);

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
            New Permission
          </ThemedText.HeadlineSmall>
        </RowBetween>

        <Body>
          <NumberedStep>
            Add a new user hash to your deny list to prevent them from submitting orders on your deposits.
          </NumberedStep>
          <SingleLineInput
            label="Venmo Hash"
            value={userHashInput}
            placeholder={'0x12345678910'}
            onChange={(e) => {
              setUserHashInput(e.currentTarget.value);
            }}
          />
          <ButtonContainer>
            <Button
              disabled={isSubmitPermissionLoading}
              loading={isSubmitPermissionLoading || isSubmitPermissionMining}
              onClick={async () => {
                try {
                  await writeSubmitPermissionAsync?.();
                } catch (error) {
                  console.log('writeSubmitPermissionAsync failed: ', error);
                }
              }}
            >
              Submit
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
