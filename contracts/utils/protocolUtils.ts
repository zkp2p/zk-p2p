import { ethers } from "ethers";
import { BigNumber } from "ethers";
import { ZERO } from "./constants";
const buildPoseidon = require("circomlibjs").buildPoseidonOpt;

const CIRCOM_FIELD = BigNumber.from("21888242871839275222246405745257275088548364400416034343698204186575808495617");

export const calculateIntentHash = (
  venmoId: string,
  depositId: BigNumber,
  timestamp: BigNumber
): string => {

  const intermediateHash = ethers.utils.solidityKeccak256(
    ["bytes32", "uint256", "uint256"],
    [venmoId, depositId, timestamp]
  );

  return ethers.utils.hexZeroPad(BigNumber.from(intermediateHash).mod(CIRCOM_FIELD).toHexString(), 32);
};

// Calculate id hashes

export const calculateIdHash = async (venmoId: string): Promise<string> => {
  const poseidon = await buildPoseidon();

  const packedVenmoId = calculatePackedId(venmoId);

  return BigNumber.from(poseidon.F.toString(poseidon(packedVenmoId))).toHexString();
}

export const calculateUpiIdHash = async (upiId: string): Promise<string> => {
  const poseidon = await buildPoseidon();

  const packedUpiId = calculatePackedUPIId(upiId);

  return BigNumber.from(
    poseidon.F.toString(
      poseidon([BigNumber.from(poseidon.F.toString(poseidon(packedUpiId.slice(0, 6))))].concat(packedUpiId.slice(6, 8)))
    )
  ).toHexString()
}

export const calculateGarantiIdHash = async (garantiId: string): Promise<string> => {
  const poseidon = await buildPoseidon();

  // Use same packing scheme as UPI
  const packedGarantiId = calculatePackedUPIId(garantiId);

  // Different hashing scheme from UPI
  return BigNumber.from(poseidon.F.toString(poseidon(packedGarantiId))).toHexString();
}

export const calculateIbanHash = (iban: string): string => {
  return ethers.utils.solidityKeccak256(["string"], [iban]);
}

// Calculate packed ids

export const calculatePackedUPIId = (upiId: string): [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] => {
  const upiIdArray: number[] = upiId.split('').map(char => char.charCodeAt(0));

  // Pad with zeros until length is 56
  while (upiIdArray.length < 56) {
    upiIdArray.push(0);
  }

  return Bytes2Packed8(7, upiIdArray);
};

export const calculatePackedId = (venmoId: string): [BigNumber, BigNumber, BigNumber] => {
  const venmoIdArray: number[] = venmoId.split('').map(char => char.charCodeAt(0));

  // Pad with zeros until length is 21
  while (venmoIdArray.length < 21) {
    venmoIdArray.push(0);
  }

  return Bytes2Packed(7, venmoIdArray);
};

export const createTypedRegistrationProof = (
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
  const signals_fixed: [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] = [
    BigNumber.from(signals[0]), BigNumber.from(signals[1]), BigNumber.from(signals[2]), BigNumber.from(signals[3]), BigNumber.from(signals[4])
  ];
  
  return {
    a: a_fixed,
    b: b_fixed,
    c: c_fixed,
    signals: signals_fixed
  };
}

export const createTypedSendProof = (
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

export const createBlankGarantiBodyHashProof = (): any => {
  return {
    a: [ZERO, ZERO],
    b: [[ZERO, ZERO], [ZERO, ZERO]],
    c: [ZERO, ZERO],
    signals: [ZERO, ZERO, ZERO, ZERO]
  };
}

export const createTypedGarantiBodyHashProof = (
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
  const signals_fixed: [BigNumber, BigNumber, BigNumber, BigNumber] = [
    BigNumber.from(signals[0]), BigNumber.from(signals[1]), BigNumber.from(signals[2]), BigNumber.from(signals[3])
  ];
  
  return {
    a: a_fixed,
    b: b_fixed,
    c: c_fixed,
    signals: signals_fixed
  };
}

function Bytes2Packed(n: number, inArr: number[]) {
  let index = 0;
  const out: [BigNumber, BigNumber, BigNumber] = [ZERO, ZERO, ZERO];

  for (let i = 0; i < inArr.length; i += n) {
    let packedValue = BigInt(0);
    for (let k = 0; k < n; k++) {
      if (i + k < inArr.length) {
        packedValue += BigInt(inArr[i + k]) * (BigInt(2) ** BigInt(k * 8));
      }
    }

    out[index] = BigNumber.from(packedValue);
    index++
  }

  return out;
}

function Bytes2Packed8(n: number, inArr: number[]) {
  let index = 0;
  const out: [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] = [
    ZERO, ZERO, ZERO, ZERO, ZERO, ZERO, ZERO, ZERO
  ];

  for (let i = 0; i < inArr.length; i += n) {
    let packedValue = BigInt(0);
    for (let k = 0; k < n; k++) {
      if (i + k < inArr.length) {
        packedValue += BigInt(inArr[i + k]) * (BigInt(2) ** BigInt(k * 8));
      }
    }

    out[index] = BigNumber.from(packedValue);
    index++
  }

  return out;
}

export const unpackPackedGarantiId = (packedGarantiId: BigNumber[]): string => {
  const n = 7;
  let garantiIdArray: number[] = [];

  for (const packedValue of packedGarantiId) {
    let bigIntValue = BigInt(packedValue.toString());

    for (let k = 0; k < n; k++) {
      garantiIdArray.push(Number(bigIntValue & BigInt(0xFF)));
      bigIntValue >>= BigInt(8);
    }
  }

  // Remove padding zeros and convert back to string
  const firstNonZeroIndex = garantiIdArray.reverse().findIndex(value => value !== 0);
  if (firstNonZeroIndex !== -1) {
    garantiIdArray = garantiIdArray.slice(firstNonZeroIndex).reverse();
  }

  return String.fromCharCode(...garantiIdArray);
};

