#!/bin/bash
source circuit.env

echo "Generating solidity verifier..."
node ../circuits/$CIRCUIT_DIR/node_modules/.bin/snarkjs zkey export solidityverifier "$BUILD_DIR"/"$CIRCUIT_NAME".zkey ../circuits/$CIRCUIT_DIR/contracts/"$CIRCUIT_NAME"_verifier.sol