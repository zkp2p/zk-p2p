#!/bin/bash

source circuit.env
R1CS_FILE="$BUILD_DIR/$CIRCUIT_NAME.r1cs"
PHASE1="$PTAU_DIR/powersOfTau28_hez_final_$PTAU.ptau"

echo "****EXPORTING VKEY****"
start=$(date +%s)
set -x
NODE_OPTIONS='--max-old-space-size=644000' ../node_modules/.bin/snarkjs zkey export verificationkey "$BUILD_DIR"/"$CIRCUIT_NAME".zkey "$BUILD_DIR"/vkey.json
end=$(date +%s)
{ set +x; } 2>/dev/null
echo "DONE ($((end - start))s)"
echo
