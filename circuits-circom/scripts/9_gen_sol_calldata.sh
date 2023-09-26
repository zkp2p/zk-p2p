#!/bin/bash
source circuit.env

echo "Generating solidity calldata..."
node ../node_modules/.bin/snarkjs zkey export soliditycalldata "$BUILD_DIR"/rapidsnark_public.json "$BUILD_DIR"/rapidsnark_proof.json