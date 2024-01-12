#!/bin/bash
# Tries to generate a chunked and non-chunked zkey
# You need to set entropy.env for this to work

source circuit.env

R1CS_FILE="$BUILD_DIR/$CIRCUIT_NAME.r1cs"
PARTIAL_ZKEYS="$BUILD_DIR"/partial_zkeys
PHASE1="$PTAU_DIR/powersOfTau28_hez_final_$PTAU.ptau"
source entropy.env

echo "****GENERATING ZKEY NONCHUNKED FINAL****"
start=$(date +%s)
set -x
NODE_OPTIONS='--max-old-space-size=112000' node ../circuits/$CIRCUIT_DIR/node_modules/.bin/snarkjs zkey new "$BUILD_DIR"/"$CIRCUIT_NAME".r1cs "$PHASE1" "$BUILD_DIR"/"$CIRCUIT_NAME".zkey -v
{ set +x; } 2>/dev/null
end=$(date +%s)
echo "DONE ($((end - start))s)"
echo

# Export the verification key to JSON
echo "Exporting verification key to JSON..."
node ../circuits/$CIRCUIT_DIR/node_modules/.bin/snarkjs zkey export verificationkey "$BUILD_DIR"/"$CIRCUIT_NAME".zkey "$BUILD_DIR"/"$CIRCUIT_NAME"_vkey.json
