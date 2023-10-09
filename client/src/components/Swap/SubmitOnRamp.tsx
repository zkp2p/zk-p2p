import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from 'wagmi'

import { Button } from "../Button";
import { Col } from "../legacy/Layout";
import { LabeledTextArea } from '../legacy/LabeledTextArea';
import { NumberedStep } from "../common/NumberedStep";
import { reformatProofForChain } from "@helpers/submitProof";
import useSmartContracts from '@hooks/useSmartContracts';
import useOnRamperIntents from '@hooks/useOnRamperIntents';

// import { vkey } from "@helpers/verifiers/send_vkey";
// @ts-ignore
// import * as snarkjs from "snarkjs";


interface SubmitOnRampProps {
  proof: string;
  publicSignals: string;
}
 
export const SubmitOnRamp: React.FC<SubmitOnRampProps> = ({
  proof,
  publicSignals,
}) => {
  /*
   * Contexts
   */

  const {
    rampAddress,
    rampAbi,
    sendProcessorAddress,
    sendProcessorAbi,
  } = useSmartContracts()

  const {
    refetchOnRamperIntents
  } = useOnRamperIntents()

  /*
    State
  */

  const [shouldConfigureOffRampWrite, setShouldConfigureOffRampWrite] = useState<boolean>(false);
  const [shouldFetchVerifyProof, setShouldFetchVerifyProof] = useState<boolean>(false);

  /*
    Contract Reads
  */

  const {
    data: verifyProofRaw,
  } = useContractRead({
    address: sendProcessorAddress,
    abi: sendProcessorAbi,
    functionName: "verifyProof",
    args: [
      ...reformatProofForChain(proof),
      publicSignals ? JSON.parse(publicSignals) : null,
    ],
    enabled: shouldFetchVerifyProof,
  });

  /*
    Contract Writes
  */

  //
  // onRamp(uint256[2] memory _a, uint256[2][2] memory _b, uint256[2] memory _c, uint256[8] memory _signals)
  //
  const { config: writeCompleteOrderConfig } = usePrepareContractWrite({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'onRamp',
    args: [
      ...reformatProofForChain(proof),
      publicSignals ? JSON.parse(publicSignals) : null,
    ],
    onError: (error: { message: any }) => {
      console.error(error.message);
    },
    enabled: shouldConfigureOffRampWrite
  });

  const {
    data: submitOnRampResult,
    isLoading: isWriteCompleteOrderLoading,
    writeAsync: writeCompleteOrder
  } = useContractWrite(writeCompleteOrderConfig);

  const {
    isLoading: isSubmitOnRampMining
  } = useWaitForTransaction({
    hash: submitOnRampResult ? submitOnRampResult.hash : undefined,
    onSuccess(data) {
      console.log('writeSubmitOnRamp successful: ', data);
      
      refetchOnRamperIntents?.();
    },
  });

  /*
   * Hooks
   */

  useEffect(() => {
    if (proof && publicSignals) {
      // console.log("proof", proof);
      // console.log("public signals", publicSignals);
      // console.log("vkey", vkey);

      // const proofVerified = await snarkjs.groth16.verify(vkey, JSON.parse(publicSignals), JSON.parse(proof));
      // console.log("proofVerified", proofVerified);

      setShouldFetchVerifyProof(true);
    } else {
      setShouldFetchVerifyProof(false);
    }
  }, [proof, publicSignals]);

  useEffect(() => {
    if (verifyProofRaw) {
      setShouldConfigureOffRampWrite(true);
    } else {
      setShouldConfigureOffRampWrite(false);
    }
  }, [verifyProofRaw]);

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
          loading={isWriteCompleteOrderLoading || isSubmitOnRampMining}
          disabled={proof.length === 0 || publicSignals.length === 0 || isWriteCompleteOrderLoading}
          onClick={async () => {
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
