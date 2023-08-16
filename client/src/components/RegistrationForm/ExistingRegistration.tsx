import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  useContractRead,
  useNetwork,
} from 'wagmi';

import { Button } from "../Button";
import { RowBetween } from '../layouts/Row'
import { Col } from "../legacy/Layout";
import { ThemedText } from '../../theme/text'
import { NumberedStep } from "../common/NumberedStep";
import { ReadOnlyInput } from "../legacy/ReadOnlyInput";
import { SingleLineInput } from "../legacy/SingleLineInput";
import { encryptMessage } from "../../helpers/messagEncryption";
import { generateVenmoIdHash } from "../../helpers/venmoHash";
// import { abi } from "../helpers/ramp.abi";
// import { useRampContractAddress } from '../hooks/useContractAddress';


interface ExistingRegistrationProps {
  loggedInWalletAddress: string;
  handleNewRegistrationClick: () => void;
}
 
export const ExistingRegistration: React.FC<ExistingRegistrationProps> = ({
  loggedInWalletAddress,
  handleNewRegistrationClick
}) => {
  const { chain } = useNetwork();

  console.log(chain);

  const persistedVenmoIdKey = `persistedVenmoId_${loggedInWalletAddress}`;
  const [venmoIdInput, setVenmoIdInput] = useState<string>(localStorage.getItem(persistedVenmoIdKey) || "");
  
  const [hashedVenmoId, setHashedVenmoId] = useState<string>('');

  /*
    Hooks
  */

  useEffect(() => {
    setVenmoIdInput('');
  }, [loggedInWalletAddress]);

  useEffect(() => {
    // create an async function inside the effect
    const updateVenmoId = async () => {
      if(venmoIdInput && venmoIdInput.length > 15) {
  
        const hashedVenmoId = await generateVenmoIdHash(venmoIdInput);
        setHashedVenmoId(hashedVenmoId);
  
        // Persist venmo id input so user doesn't have to paste it again in the future
        localStorage.setItem(persistedVenmoIdKey, venmoIdInput);
      }
    }
  
    updateVenmoId();
  }, [venmoIdInput]);

  /*
    Contract Reads
  */
  
  // mapping(bytes32 => address) public accountIds;
  // const {
  //   data: orderClaimsData,
  //   isLoading: isReadOrderClaimsLoading,
  //   isError: isReadOrderClaimsError,
  //   refetch: refetchClaimedOrders,
  // } = useContractRead({
  //   addressOrName: useRampContractAddress(chain),
  //   contractInterface: abi,
  //   functionName: 'getClaimsForOrder',
  //   args: [hashedVenmoId],
  // });

  /*
    Component
  */
  return (
    <Wrapper>
      <Column>
        <TitleRow>
          <ThemedText.HeadlineMedium>
            Registration
          </ThemedText.HeadlineMedium>
          <Button onClick={handleNewRegistrationClick} height={40}>
            + Update
          </Button>
        </TitleRow>
        <Body>
          <NumberedInputContainer>
            <NumberedStep>
              Your Venmo ID is hashed on chain to conceal your identity. Verify your existing registered ID by pasting your
              Venmo ID below and tapping verify
            </NumberedStep>
          </NumberedInputContainer>
          <ReadOnlyInput
            label="Current Registration Status"
            value="Registered"
          />
          <SingleLineInput
            label="Verify Venmo ID"
            value="645716473020416186"
            placeholder={'1234567891011121314'}
            onChange={(e) => {
              setVenmoIdInput(e.currentTarget.value);
            }}
          />
          <Button
            onClick={async () => {
              // TODO: Poseidon hash venmoIDInput and give feedback if it matches the existing registration
            }}
            >
            Verify
          </Button>
        </Body>
      </Column>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  gap: 1rem;
`;

const Column = styled.div`
  gap: 1rem;
  align-self: flex-start;
  border-radius: 16px;
  justify-content: center;
`;

const TitleRow = styled(RowBetween)`
  margin-bottom: 20px;
  height: 50px;
  align-items: flex-end;
  color: #FFF;
  padding: 0 1rem;

  @media (max-width: 600px) {
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
  };
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1.5rem;
  background-color: #0D111C;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const NumberedInputContainer = styled(Col)`
  gap: 1rem;
`;
