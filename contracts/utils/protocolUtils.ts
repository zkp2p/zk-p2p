import { ethers } from "ethers";
import { BigNumber } from "ethers";
import { ZERO } from "./constants";
const buildPoseidon = require("circomlibjs").buildPoseidonOpt;

export const calculateIntentHash = (
  venmoId: string,
  depositId: BigNumber,
  timestamp: BigNumber
): string => {
  return ethers.utils.solidityKeccak256(
    ["bytes32", "uint256", "uint256"],
    [venmoId, depositId, timestamp]
  );
};

export const calculateVenmoIdHash = async(venmoId: string): Promise<string> => {
  const poseidon = await buildPoseidon();
  
  const packedVenmoId = calculatePackedVenmoId(venmoId);

  return BigNumber.from(poseidon.F.toString(poseidon(packedVenmoId))).toHexString();
}

export const calculatePackedVenmoId = (venmoId: string): [BigNumber, BigNumber, BigNumber] => {
  const venmoIdArray: number[] = venmoId.split('').map(char => char.charCodeAt(0));

  // Pad with zeros until length is 30
  while (venmoIdArray.length < 21) {
    venmoIdArray.push(0);
  }

  return Bytes2Packed(7, venmoIdArray);
};

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

