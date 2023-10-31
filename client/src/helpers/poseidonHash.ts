// @ts-ignore
import { buildPoseidon } from "circomlibjs";
import { BigNumber } from "ethers";

import { ZERO } from '@helpers/constants'


let poseidonHasher: any;
export async function initializePoseidon() {
  if (!poseidonHasher) {
    poseidonHasher = await buildPoseidon();
  }
}
export const poseidon = (arr: (number | bigint | string)[]): string =>
  poseidonHasher.F.toString(poseidonHasher(arr));

export const poseidonK = (ar: (number | bigint | string)[]): string => {
  let cur: (number | bigint | string)[] = [];
  for (const elt of ar) {
    cur.push(elt);
    if (cur.length === 16) {
      cur = [poseidon(cur)];
    }
  }
  if (cur.length === 1) return `${cur[0]}`;
  while (cur.length < 16) cur.push(0);
  return poseidon(cur);
};

export const isProvidedIdEqualToRegistration = async(input: string, registrationHash: string): Promise<boolean> => {
  const venmoHashFromInput = await calculateVenmoIdHash(input);
  const venmoHashFromInputNumber = BigNumber.from(venmoHashFromInput);

  const existingRegistrationNumber = BigNumber.from(registrationHash);

  return existingRegistrationNumber.eq(venmoHashFromInputNumber);
}

export const calculateVenmoIdHash = async(venmoId: string): Promise<string> => {
  const poseidon = await buildPoseidon();

  const packedVenmoId = calculatePackedVenmoId(venmoId);

  const bigIntResult = BigInt(poseidon.F.toString(poseidon(packedVenmoId)));
  return "0x" + bigIntResult.toString(16);
}

export const calculatePackedVenmoId = (venmoId: string): [bigint, bigint, bigint] => {
  const venmoIdArray: number[] = venmoId.split('').map(char => char.charCodeAt(0));

  // Pad with zeros until length is 21
  while (venmoIdArray.length < 21) {
    venmoIdArray.push(0);
  }

  return Bytes2Packed(7, venmoIdArray);
};

function Bytes2Packed(n: number, inArr: number[]) {
  let index = 0;
  const out: [bigint, bigint, bigint] = [ZERO, ZERO, ZERO];

  for (let i = 0; i < inArr.length; i += n) {
    let packedValue = BigInt(0);
    for (let k = 0; k < n; k++) {
      if (i + k < inArr.length) {
        packedValue += BigInt(inArr[i + k]) * (BigInt(2) ** BigInt(k * 8));
      }
    }

    out[index] = BigInt(packedValue);
    index++
  }

  return out;
}

export const unpackPackedVenmoId = (packedVenmoId: [bigint, bigint, bigint, bigint, bigint]): string => {
  const n = 7;
  let venmoIdArray: number[] = [];
  
  for (const packedValue of packedVenmoId) {
    let bigIntValue = BigInt(packedValue.toString());
    
    for (let k = 0; k < n; k++) {
      venmoIdArray.push(Number(bigIntValue & BigInt(0xFF)));
      bigIntValue >>= BigInt(8);
    }
  }
  
  // Remove padding zeros and convert back to string
  venmoIdArray = venmoIdArray.reverse();
  while (venmoIdArray[venmoIdArray.length - 1] === 0) {
    venmoIdArray.pop();
  }
  venmoIdArray = venmoIdArray.reverse();
  
  return String.fromCharCode(...venmoIdArray);
};
