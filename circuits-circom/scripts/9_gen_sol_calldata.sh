#!/bin/bash
source circuit.env

echo "Generating solidity calldata..."
node ../node_modules/.bin/snarkjs zkesc "$BUILD_DIR"/rapidsnark_proof.json "$BUILD_DIR"/rapidsnark_public.json