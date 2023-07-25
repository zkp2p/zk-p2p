import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { Button } from "../Button";
import { Col, SubHeader } from "../legacy/Layout";
import { NumberedStep } from "../legacy/NumberedStep";
import { ReadOnlyInput } from "../legacy/ReadOnlyInput";
import { SingleLineInput } from "../legacy/SingleLineInput";

// import { encryptMessage } from "../helpers/messagEncryption";
// import { generateVenmoIdHash } from "../helpers/venmoHash";
// import { abi } from "../helpers/ramp.abi";
// import { OnRampOrder } from "../helpers/types";
// import { contractAddresses } from "../helpers/deployed_addresses";
// import { formatAmountsForTransactionParameter } from '../helpers/transactionFormat';


interface RegistrationFormProps {
  // loggedInWalletAddress: string;
  // senderRequestedAmountDisplay: number;
}
 
export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  // loggedInWalletAddress,
  // senderRequestedAmountDisplay,
}) => {
  // const persistedVenmoIdKey = `persistedVenmoId_${loggedInWalletAddress}`;
  // const [venmoIdInput, setVenmoIdInput] = useState<string>(localStorage.getItem(persistedVenmoIdKey) || "");
  const [requestedUSDAmountInput, setRequestedUSDAmountInput] = useState<number>(0);

  // const [encryptedVenmoId, setEncryptedVenmoId] = useState<string>('');
  // const [hashedVenmoId, setHashedVenmoId] = useState<string>('');
  // const [requestedAmount, setRequestedAmount] = useState<number>(0);

  /*
    Contract Writes
  */

  //
  // legacy: claimOrder(uint256 _orderNonce)
  // new:    claimOrder(uint256 _venmoId, uint256 _orderNonce, bytes calldata _encryptedVenmoId, uint256 _minAmountToPay)
  //
  // const { config: writeClaimOrderConfig } = usePrepareContractWrite({
  //   addressOrName: contractAddresses['goerli'].ramp,
  //   contractInterface: abi,
  //   functionName: 'claimOrder',
  //   args: [
  //     hashedVenmoId,
  //     selectedOrder.orderId,
  //     '0x' + encryptedVenmoId,
  //     formatAmountsForTransactionParameter(requestedAmount)

  //   ],
  //   onError: (error: { message: any }) => {
  //     console.error(error.message);
  //   },
  // });

  // const {
  //   isLoading: isWriteClaimOrderLoading,
  //   write: writeClaimOrder
  // } = useContractWrite(writeClaimOrderConfig);

  /*
    Hooks
  */

  // useEffect(() => {
  //   setRequestedUSDAmountInput(0);
  //   setRequestedAmount(0);
  // }, [selectedOrder]);

  /*
    Component
  */
  return (
    <ComponentWrapper>
      <SubHeader>Registration</SubHeader>
      <RegistrationBodyContainer>
        <ExistingRegistrationContainer>
          <ReadOnlyInput
            label="Order Creator"
            value="Test Order Creator"
          />
          <ReadOnlyInput
            label="Requested USDC Amount"
            value="Test Requested USDC Amount"
          />
        </ExistingRegistrationContainer>
        <NumberedInputContainer>
          <NumberedStep>
            Specify a Venmo ID (not handle, see our guide on retrieving your ID)
            to receive USD at and a required USD amount to receive. Your Venmo ID will be encrypted.
            Submitting this transaction will escrow 10 fUSDC for the
            on-ramper. If this is your first time, you will need to mint.
          </NumberedStep>
        </NumberedInputContainer>
        <NewRegistrationContainer>
          <SingleLineInput
            label="Venmo ID"
            value="My Venmo ID"
            placeholder={'1234567891011121314'}
            onChange={(e) => {
              // setVenmoIdInput(e.currentTarget.value);
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
        </NewRegistrationContainer>
        <Button
          onClick={async () => {
            // Sign venmo id with encrypting key from the order
            // const encryptedVenmoId = await encryptMessage(venmoIdInput, selectedOrder.onRamperEncryptPublicKey);
            // setEncryptedVenmoId(encryptedVenmoId);
            // console.log(encryptedVenmoId);

            // Generate hash of the venmo id
            // const hashedVenmoId = await generateVenmoIdHash(venmoIdInput);
            // setHashedVenmoId(hashedVenmoId);
            // console.log(hashedVenmoId);

            // Set the requested USD amount
            // setRequestedAmount(requestedUSDAmountInput);

            // Persist venmo id input so user doesn't have to paste it again in the future
            // localStorage.setItem(persistedVenmoIdKey, venmoIdInput);

            // writeClaimOrder?.();
          }}
          >
          Claim Order
        </Button>
      </RegistrationBodyContainer>
    </ComponentWrapper>
  );
};

const ComponentWrapper = styled.div`
  gap: 1rem;
  padding-top: 8px;
  max-width: 800px;
  width: 100%;
`;

const RegistrationBodyContainer = styled(Col)`
  gap: 2rem;
`;

const ExistingRegistrationContainer = styled(Col)`
  background: rgba(255, 255, 255, 0.1);
  gap: 1rem;
  border-radius: 4px;
  padding: 1rem;
  color: #fff;
`;

const NumberedInputContainer = styled(Col)`
  gap: 1rem;
`;

const NewRegistrationContainer = styled(Col)`
  gap: 1rem;
`;
