#!/bin/bash
source circuit.env

# Then, nonchunked snarkjs
yarn remove snarkjs
# mv ../yarn.lock ../yarn.lock_old2
# rm -rf ../node_modules_old2
# mv ../node_modules ../node_modules_old2
yarn add snarkjs@latest


echo "Generating solidity verifier..."
node ../node_modules/.bin/snarkjs zkey export solidityverifier "$BUILD_DIR"/"$CIRCUIT_NAME".zkey ../contracts/"$CIRCUIT_NAME"_verifier.sol

yarn remove snarkjs
# mv ../yarn.lock ../yarn.lock_old3
# rm -rf ../node_modules_old3
# mv ../node_modules ../node_modules_old3
yarn add snarkjs@git+https://github.com/vb7401/snarkjs.git#24981febe8826b6ab76ae4d76cf7f9142919d2b8
yarn
