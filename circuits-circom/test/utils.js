module.exports.bytesToPacked = function bytesToPacked(arr) {
    // Convert into bigint from string
    let arrInt = arr.map(BigInt);
    let n = arrInt.length;
    let out = BigInt(0);
    for (let k = 0; k < n; k++) {
        out += arrInt[k] * BigInt(2 ** (8 * k));  // little endian
    }
    return out;
}

module.exports.chunkArray = function chunkArray(arr, chunkSize, length) {
    let chunks = [];
    for (let i = 0; i < length; i += chunkSize) {
        let chunk = arr.slice(i, i + chunkSize);
        if (chunk.length < chunkSize) {
            chunk = chunk.concat(new Array(chunkSize - chunk.length).fill('0'));
        }
        chunks.push(chunk);
    }
    return chunks;
}