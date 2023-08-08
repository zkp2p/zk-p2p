import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  useContractRead,
  useNetwork,
} from 'wagmi';

import { Button } from "../Button";
import { Col } from "../legacy/Layout";
import { NumberedStep } from "../common/NumberedStep";
import { ReadOnlyInput } from "../legacy/ReadOnlyInput";
import { SingleLineInput } from "../legacy/SingleLineInput";
import { encryptMessage } from "../../helpers/messagEncryption";
import { generateVenmoIdHash } from "../../helpers/venmoHash";
// import { abi } from "../helpers/ramp.abi";
// import { useRampContractAddress } from '../hooks/useContractAddress';


interface ExistingRegistrationProps {
  loggedInWalletAddress: string;
}
 
export const ExistingRegistration: React.FC<ExistingRegistrationProps> = ({
  loggedInWalletAddress,
}) => {
  const { chain } = useNetwork();

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
    <Container>
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
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  gap: 1rem;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const NumberedInputContainer = styled(Col)`
  gap: 1rem;
`;
