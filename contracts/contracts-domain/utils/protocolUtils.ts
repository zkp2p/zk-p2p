import { ethers } from "ethers";

import { BigNumber, BytesLike } from "ethers";
import { Domain, ReclaimProof, ClaimInfo, SignedClaim } from "./types";
import { ITransferDomainProcessor } from "./contracts"
import { ZERO_BYTES32, ADDRESS_ZERO, ZERO } from "./constants";

export const createTypedGroth16Proof = (
  a: string[],
  b: string[][],
  c: string[],
  signals: string[]
): any => {
  const a_fixed: [BigNumber, BigNumber] = [BigNumber.from(a[0]), BigNumber.from(a[1])];
  const b_fixed: [[BigNumber, BigNumber], [BigNumber, BigNumber]] = [
    [BigNumber.from(b[0][0]), BigNumber.from(b[0][1])],
    [BigNumber.from(b[1][0]), BigNumber.from(b[1][1])]
  ];
  const c_fixed: [BigNumber, BigNumber] = [BigNumber.from(c[0]), BigNumber.from(c[1])];
  const signals_fixed: BigNumber[] = signals.map((signal) => BigNumber.from(signal));;

  return {
    a: a_fixed,
    b: b_fixed,
    c: c_fixed,
    signals: signals_fixed
  };
}

export function calculateDomainId(domainName: string): string {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(domainName));
}

export function convertToUnixTimestamp(dateString: string): BigNumber {
  const date = new Date(dateString + 'Z'); // Append 'Z' to treat as UTC
  return BigNumber.from(Math.floor(date.getTime() / 1000));
}

export function convertUnixTimestampToDateString(timestamp: BigNumber): string {
  const date = new Date(timestamp.toNumber() * 1000);
  return date.toISOString();
}

export const generateProofsFromDomains = (
  domains: Domain[]
): ReclaimProof[] => {
  const proofs: ReclaimProof[] = [];
  for (const domain of domains) {
    const claimInfo: ClaimInfo = {
      provider: "http",
      parameters: "",
      context: "",
    };
    const signedClaim: SignedClaim = {
      claim: {
        identifier: ZERO_BYTES32,
        owner: ADDRESS_ZERO,
        timestampS: ethers.constants.Zero,
        epoch: ethers.constants.Zero,
      },
      signatures: [
        ethers.utils.hexlify(Buffer.from(domain.name)),
        ethers.utils.hexlify(Buffer.from(domain.expiryTimestamp))
      ],
    };
    proofs.push({ claimInfo, signedClaim } as ReclaimProof);
  }

  return proofs;
}


export const generateTransferProof = (
  hashedBuyerId: BytesLike,
  bidId: BigNumber
) => {
  return {
    a: [ZERO, ZERO],
    b: [[ZERO, ZERO], [ZERO, ZERO]],
    c: [ZERO, ZERO],
    signals: [
      ZERO,     // Modulus
      BigNumber.from(hashedBuyerId),    // hashedReceiverId
      ZERO,     // domain Name already set in mock
      bidId,   // bidId
      ZERO,
      ZERO,
      ZERO,
      ZERO,
      ZERO,
      ZERO
    ]
  } as ITransferDomainProcessor.TransferProofStruct;
}