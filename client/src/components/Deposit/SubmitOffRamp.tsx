import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi'

import { Button } from "../Button";
import { Col } from "../legacy/Layout";
import { LabeledTextArea } from '../legacy/LabeledTextArea';
import { NumberedStep } from "../common/NumberedStep";
import { reformatProofForChain } from "@helpers/submitProof";
import useSmartContracts from '@hooks/useSmartContracts';
import useDeposits from '@hooks/useDeposits';

// import { vkey } from "@helpers/verifiers/receive_vkey";
// @ts-ignore
// import * as snarkjs from "snarkjs";


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

  const {
    refetchDepositIntents
  } = useDeposits()

  /*
    State
  */

  const [shouldConfigureOnRampWrite, setShouldConfigureOnRampWrite] = useState<boolean>(false);
  const [shouldFetchVerifyProof, setShouldFetchVerifyProof] = useState<boolean>(false);

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
    enabled: shouldFetchVerifyProof
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
    enabled: shouldConfigureOnRampWrite
  });

  const {
    data: submitOnRampWithConvenienceResult,
    isLoading: isWriteCompleteOrderLoading,
    writeAsync: writeCompleteOrderAsync
  } = useContractWrite(writeCompleteOrderConfig);

  const {
    isLoading: isSubmitOnRampWithConvenienceMining
  } = useWaitForTransaction({
    hash: submitOnRampWithConvenienceResult ? submitOnRampWithConvenienceResult.hash : undefined,
    onSuccess(data) {
      console.log('writeSubmitOnRampWithConvenience successful: ', data);
      
      refetchDepositIntents?.();
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
      setShouldConfigureOnRampWrite(true);
    } else {
      setShouldConfigureOnRampWrite(false);
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
          loading={isSubmitOnRampWithConvenienceMining || isWriteCompleteOrderLoading}
          disabled={proof.length === 0 || publicSignals.length === 0 || isWriteCompleteOrderLoading}
          onClick={async () => {
            try {
              await writeCompleteOrderAsync?.();
            } catch (error) {
              console.log('writeCompleteOrderAsync failed: ', error);
            }
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
