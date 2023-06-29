import React, { useState } from 'react';
import styled from 'styled-components';

import { Button } from "../components/Button";
import { Col, SubHeader } from "../components/Layout";
import { NumberedStep } from "../components/NumberedStep";
import { ReadOnlyInput } from "../components/ReadOnlyInput";
import { SingleLineInput } from "../components/SingleLineInput";
import { StyledLink } from "../components/StyledLink";

import { encryptMessage } from "../helpers/messagEncryption";
import { generateVenmoIdHash } from "../helpers/venmoHash";


interface ClaimOrderFormProps {
  loggedInWalletAddress: string;
  senderEncryptingKey: string;
  senderAddressDisplay: string;
  senderRequestedAmountDisplay: number;
  setRequestedUSDAmount: (key: number) => void;
  setEncryptedVenmoId: (key: string) => void;
  setHashedVenmoId: (key: string) => void;
  writeClaimOrder?: () => void;
  isWriteClaimOrderLoading: boolean;
  rampExplorerLink: string;
  fusdcExplorerLink: string;
}
 
export const ClaimOrderForm: React.FC<ClaimOrderFormProps> = ({
  loggedInWalletAddress,
  senderEncryptingKey,
  senderAddressDisplay,
  senderRequestedAmountDisplay,
  setRequestedUSDAmount,
  setEncryptedVenmoId,
  setHashedVenmoId,
  writeClaimOrder,
  isWriteClaimOrderLoading,
  rampExplorerLink,
  fusdcExplorerLink
}) => {
  const persistedVenmoIdKey = `persistedVenmoId_${loggedInWalletAddress}`;
  const [venmoIdInput, setVenmoIdInput] = useState<string>(localStorage.getItem(persistedVenmoIdKey) || "");
  const [requestedUSDAmountInput, setRequestedUSDAmountInput] = useState<number>(0);

  return (
    <ClaimOrderFormHeaderContainer>
      <SubHeader>Claim Order</SubHeader>
      <ClaimOrderBodyContainer>
        <SelectedOrderContainer>
          <ReadOnlyInput
            label="Order Creator"
            value={senderAddressDisplay}
          />
          <ReadOnlyInput
            label="Requested USDC Amount"
            value={senderRequestedAmountDisplay}
          />
        </SelectedOrderContainer>
        <NumberedInputContainer>
          <NumberedStep>
            Specify a Venmo ID (not handle, see our
            <StyledLink
            urlHyperlink="https://github.com/0xSachinK/zk-p2p-onramp/blob/main/README.md#fetching-venmo-id-instructions"
            label={' guide'}/> on retrieving your ID)
            to receive USD at and a required USD amount to receive. Your Venmo ID will be encrypted.
            Submitting this transaction will escrow {senderRequestedAmountDisplay} fUSDC for the
            on-ramper. If this is your first time, you will need to mint
            <StyledLink
              urlHyperlink={fusdcExplorerLink}
              label={' fUSDC '}/>
            and approve spending to the ramp
            (<StyledLink
              urlHyperlink={rampExplorerLink}
              label={'smart contract'}/>).
            Make sure to approve the correct amount with the appropriate decimals (6).
          </NumberedStep>
        </NumberedInputContainer>
        <InputsContainer>
          <SingleLineInput
            label="Venmo ID"
            value={venmoIdInput}
            placeholder={'1234567891011121314'}
            onChange={(e) => {
              setVenmoIdInput(e.currentTarget.value);
            }}
          />
          <SingleLineInput
            label="USD Amount to Request"
            value={requestedUSDAmountInput === 0 ? '' : requestedUSDAmountInput.toString()}
            placeholder={'0'}
            onChange={(e) => {
              setRequestedUSDAmountInput(e.currentTarget.value);
            }}
          />
        </InputsContainer>
        <Button
          disabled={isWriteClaimOrderLoading}
          onClick={async () => {
            // Sign venmo id with encrypting key from the order
            const encryptedVenmoId = await encryptMessage(venmoIdInput, senderEncryptingKey);
            setEncryptedVenmoId(encryptedVenmoId);
            console.log(encryptedVenmoId);

            // Generate hash of the venmo id
            const hashedVenmoId = await generateVenmoIdHash(venmoIdInput);
            setHashedVenmoId(hashedVenmoId);
            console.log(hashedVenmoId);

            // Set the requested USD amount
            setRequestedUSDAmount(requestedUSDAmountInput);

            // Persist venmo id input so user doesn't have to paste it again in the future
            localStorage.setItem(persistedVenmoIdKey, venmoIdInput);

            writeClaimOrder?.();
          }}
          >
          Claim Order
        </Button>
      </ClaimOrderBodyContainer>
    </ClaimOrderFormHeaderContainer>
  );
};

const SelectedOrderContainer = styled(Col)`
  background: rgba(255, 255, 255, 0.1);
  gap: 1rem;
  border-radius: 4px;
  padding: 1rem;
  color: #fff;
`;

const ClaimOrderFormHeaderContainer = styled.div`
  gap: 1rem;
`;

const ClaimOrderBodyContainer = styled(Col)`
  gap: 2rem;
`;

const NumberedInputContainer = styled(Col)`
  gap: 1rem;
`;

const InputsContainer = styled(Col)`
  gap: 1rem;
`;
