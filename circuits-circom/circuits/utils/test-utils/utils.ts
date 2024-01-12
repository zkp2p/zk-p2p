export function bytesToPacked(arr) {
    // Convert into bigint from string
    let arrInt = arr.map(BigInt);
    let n = arrInt.length;
    let out = BigInt(0);
    for (let k = 0; k < n; k++) {
        out += arrInt[k] * BigInt(2 ** (8 * k));  // little endian
    }
    return out;
}

export function chunkArray(arr, chunkSize, length) {
    let chunks = [] as any[];
    for (let i = 0; i < length; i += chunkSize) {
        let chunk = arr.slice(i, i + chunkSize);
        if (chunk.length < chunkSize) {
            chunk = chunk.concat(new Array(chunkSize - chunk.length).fill('0'));
        }
        chunks.push(chunk);
    }
    return chunks;
}

export function chunkedBytesToBigInt(chunks: string[], bytesPerChunk: number): bigint {
    let result = BigInt(0);
    for (let i = 0; i < chunks.length; ++i) {
        // Convert each string chunk to a bigint and shift it to its proper position
        const chunkBigInt = BigInt(chunks[i]);
        result += chunkBigInt << BigInt(i * bytesPerChunk);
    }
    return result;
}

export function packNullifier(header_hash) {
    const field_pack_bits = 248;
    let header_hash_int = new Array(field_pack_bits + 1).fill(0n);  // Initialize to BigInt zeros

    // Initialize the first element to 0 as per the Circom code
    header_hash_int[0] = 0n;

    let currentBitIndex = 0;

    // Loop through each byte in header_hash
    for (let i = 0; i < header_hash.length; i++) {
        const byte = header_hash[i];

        // Convert the byte to its 8-bit binary representation
        const byteAsBinary = byte.toString(2).padStart(8, '0');

        // Loop through each bit in the binary representation
        for (let j = 0; j < 8; j++) {
            if (currentBitIndex >= field_pack_bits) {
                break;  // Stop if we've reached the target bit size
            }

            // Convert the current bit to a BigInt and use it in the packing operation
            const bit = BigInt(Number(byteAsBinary[j]));
            header_hash_int[currentBitIndex + 1] = 2n * header_hash_int[currentBitIndex] + bit;

            currentBitIndex++;
        }
    }

    // The packed integer is stored in header_hash_int[field_pack_bits]
    const packedNullifier = header_hash_int[field_pack_bits];

    return packedNullifier;
}


export function hashSignatureGenRand(signature, n, k, poseidon) {

    let k2_chunked_size = k >> 1;
    if (k % 2 == 1) {
        k2_chunked_size += 1;
    }

    let cm_rand_input = new Array(k2_chunked_size).fill(0n);
    for (let i = 0; i < k2_chunked_size; i++) {
        if (i == k2_chunked_size - 1 && k2_chunked_size % 2 == 1) {
            cm_rand_input[i] = BigInt(signature[2 * i]);
        } else {
            cm_rand_input[i] = BigInt(signature[2 * i]) + (1n << BigInt(n)) * BigInt(signature[2 * i + 1]);
        }
    }

    let cm_rand = poseidon(cm_rand_input);
    return cm_rand;
}