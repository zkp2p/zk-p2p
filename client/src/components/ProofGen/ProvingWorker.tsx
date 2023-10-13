import { expose } from 'comlink';
import {
  ICircuitInputs
} from '@zkp2p/circuits-circom/scripts/generate_input';

import { HOSTED_FILES_PATH } from "@helpers/constants";
import { generateProof as rapidSnarkGenerateProof } from "@helpers/zkp";


async function generateProof(input: ICircuitInputs, circuitRemoteFilePath: string) {
  return await rapidSnarkGenerateProof(input, circuitRemoteFilePath, HOSTED_FILES_PATH);
}

const worker = {
  generateProof
}

export type RunGenerateProofWorker = typeof worker;

expose(worker)
