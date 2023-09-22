
source circuit.env

echo "Generating solidity verifier..."
node ../node_modules/.bin/snarkjs zkey export solidityverifier "$BUILD_DIR"/"$CIRCUIT_NAME".zkey ../contracts/"$CIRCUIT_NAME"_verifier.sol