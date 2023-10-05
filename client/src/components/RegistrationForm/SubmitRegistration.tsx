import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useContractWrite, usePrepareContractWrite } from 'wagmi'

import { Button } from "../Button";
import { Col } from "../legacy/Layout";
import { LabeledTextArea } from '../legacy/LabeledTextArea';
import useSmartContracts from '@hooks/useSmartContracts';
import { reformatProofForChain } from "@helpers/submitProof";


interface SubmitRegistrationProps {
  proof: string;
  publicSignals: string;
}
 
export const SubmitRegistration: React.FC<SubmitRegistrationProps> = ({
  proof,
  publicSignals,
}) => {
  /*
   * Contexts
   */
  const { rampAddress, rampAbi } = useSmartContracts()

  /*
    State
  */

  const [shouldConfigureRegistrationWrite, setShouldConfigureRegistrationWrite] = useState<boolean>(false);

  /*
    Contract Writes
  */

  //
  // register(uint256[2] memory _a, uint256[2][2] memory _b, uint256[2] memory _c, uint256[msgLen] memory _signals)
  //
  const { config: writeSubmitRegistrationConfig } = usePrepareContractWrite({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'register',
    args: [
      ...reformatProofForChain(proof),
      publicSignals ? JSON.parse(publicSignals) : null,
    ],
    onError: (error: { message: any }) => {
      console.error(error.message);
    },
    enabled: shouldConfigureRegistrationWrite
  });

  const {
    isLoading: isSubmitRegistrationLoading,
    write: writeSubmitRegistration
  } = useContractWrite(writeSubmitRegistrationConfig);

  /*
    Hooks
  */

  useEffect(() => {
    if (proof && publicSignals) {
      // TODO: perform local verification

      setShouldConfigureRegistrationWrite(true);
    } else {
      setShouldConfigureRegistrationWrite(false);
    }
  }, [proof, publicSignals]);

  return (
    <Container>
      <Body>
        <LabeledTextArea
          label="Proof Output"
          value={proof}
          disabled={true}
        />

        <LabeledTextArea
          label="Public Signals"
          value={publicSignals}
          disabled={true}
          secret
        />
        
        <Button
          disabled={proof.length === 0 || publicSignals.length === 0 || isSubmitRegistrationLoading}
          loading={isSubmitRegistrationLoading}
          onClick={async () => {
            writeSubmitRegistration?.();
          }}
        >
          Submit Registration
        </Button>
      </Body>
    </Container>
  );
};

const Container = styled.div`
  gap: 1rem;
`;

const Body = styled(Col)`
  gap: 2rem;
`;
