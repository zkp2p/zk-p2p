#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status.

source circuit.env

payment_type=$1
circuit_type=$2

echo "Please make sure you have the right upload folder set in circuit.env"

export CIRCUIT_NAME="${payment_type}_${circuit_type}"
echo "CIRCUIT_NAME: $CIRCUIT_NAME"

yarn gen-input:$payment_type:$circuit_type

cd ../circuits/$CIRCUIT_DIR
yarn compile:$payment_type:$circuit_type
yarn test:$payment_type:$circuit_type
yarn genkey:non-chunked:unsafe:$payment_type:$circuit_type
yarn uploadkeys:$payment_type:$circuit_type
yarn genverifier:$payment_type:$circuit_type
yarn genwitness:$payment_type:$circuit_type
yarn genproof:$payment_type:$circuit_type
yarn gencalldata:$payment_type:$circuit_type