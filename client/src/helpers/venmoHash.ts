import { initializePoseidon, poseidon } from "./poseidonHash";

export async function generateVenmoIdHash(rawId: string) {
  const processedVenmoId = initializeRawVenmoId(rawId);

  const chunkSize = 7;
  const packedVenmoId = Bytes2Packed(chunkSize, processedVenmoId);

  await initializePoseidon();
  const hashedVenmoId = poseidon(packedVenmoId);

  return hashedVenmoId;
}

function initializeRawVenmoId(rawId: string): number[] {
  const venmoId = rawId.split('').map(char => char.charCodeAt(0));
  
  // Insert `=\r\n` after the 14th element
  venmoId.splice(14, 0, 61, 13, 10);

  // Pad with zeros until length is 28
  while (venmoId.length < 28) {
    venmoId.push(0);
  }

  return venmoId;
}

function Bytes2Packed(chunkSize: number, circuitFormattedVenmoId: number[]) {
    const out = [];
  
    for (let i = 0; i < circuitFormattedVenmoId.length; i += chunkSize) {
      let packedValue = BigInt(0);
      for (let k = 0; k < chunkSize; k++) {
        if (i + k < circuitFormattedVenmoId.length) {
          packedValue += BigInt(circuitFormattedVenmoId[i + k]) * (BigInt(2) ** BigInt(k * 8));
        }
      }

      out.push(packedValue);
    }
  
    return out;
}
