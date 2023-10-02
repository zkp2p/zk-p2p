import React from 'react';
import styled from 'styled-components';
import {
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from 'wagmi'

import { Button } from "../Button";
import { Col } from "../legacy/Layout";
import { LabeledTextArea } from '../legacy/LabeledTextArea';
import { NumberedStep } from "../common/NumberedStep";
import useSmartContracts from '@hooks/useSmartContracts';

import { vkey } from "../../helpers/verifiers/receive_vkey";
import { reformatProofForChain } from "../../helpers/submitProof";
// @ts-ignore
import * as snarkjs from "snarkjs";

interface SubmitOffRampProps {
  proof: string;
  publicSignals: string;
}
 
export const SubmitOffRamp: React.FC<SubmitOffRampProps> = ({
  proof,
  publicSignals,
}) => {
  /*
   * Contexts
   */

  const {
    rampAddress,
    rampAbi,
    receiveProcessorAddress,
    receiveProcessorAbi,
  } = useSmartContracts()

  /*
    Contract Reads
  */

  const {
    data: verifyProofRaw,
  } = useContractRead({
    address: receiveProcessorAddress,
    abi: receiveProcessorAbi,
    functionName: "verifyProof",
    args: [
      ...reformatProofForChain(proof),
      publicSignals ? JSON.parse(publicSignals) : null,
    ],
    watch: true,
    enabled: true,
  });

  /*
    Contract Writes
  */

  //
  // new: onRampWithConvenience(uint256[2] memory _a, uint256[2][2] memory _b, uint256[2] memory _c, uint256[9] memory _signals)
  //
  const { config: writeCompleteOrderConfig } = usePrepareContractWrite({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'onRampWithConvenience',
    args: [
      ...reformatProofForChain(proof),
      publicSignals ? JSON.parse(publicSignals) : null,
    ],
    onError: (error: { message: any }) => {
      console.error(error.message);
    },
  });

  const {
    isLoading: isWriteCompleteOrderLoading,
    write: writeCompleteOrder
  } = useContractWrite(writeCompleteOrderConfig);

  return (
    <Container>
      <Body>
          <NumberedStep>
            Upon successful proof generation above, both the proof and public inputs will be
            populated automatically. Prior to submission, select the correct order claim for
            the Venmo payment you completed from table of claims above.
          </NumberedStep>
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
          disabled={proof.length === 0 || publicSignals.length === 0 || isWriteCompleteOrderLoading}
          onClick={async () => {

            console.log("proof", proof);
            console.log("public signals", publicSignals);
            console.log("vkey", vkey);

            const proofVerified = await snarkjs.groth16.verify(vkey, JSON.parse(publicSignals), JSON.parse(proof));
            console.log("proofVerified", proofVerified);

            console.log("verifyProofRaw", verifyProofRaw);

            writeCompleteOrder?.();
          }}
        >
          Submit
        </Button>
      </Body>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  gap: 1rem;
`;

const Body = styled(Col)`
  gap: 2rem;
`;
