#!/bin/bash
source circuit.env

if [ ! -d "$BUILD_DIR" ]; then
    echo "No build directory found. Creating build directory..."
    mkdir -p "$BUILD_DIR"
fi

echo '****COMPILING CIRCUIT****'
start=$(date +%s)
set -x
circom "../circuits/$CIRCUIT_DIR/$CIRCUIT_NAME".circom --r1cs --wasm --sym --c --wat --output "$BUILD_DIR" -l "../circuits/$CIRCUIT_DIR/node_modules"
{ set +x; } 2>/dev/null
end=$(date +%s)
echo "DONE ($((end - start))s)"
echo
