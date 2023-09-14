#!/bin/bash

source circuit.env
echo $UPLOAD_FOLDER

echo "Uploading partial keys to s3..."
python3 upload_to_s3.py --dirs ../build/$CIRCUIT_NAME/partial_zkeys/ --upload_dir $UPLOAD_FOLDER/$CIRCUIT_NAME

echo "Uploading wasm to s3..."
python3 upload_to_s3.py --dirs ../build/$CIRCUIT_NAME/$CIRCUIT_NAME_js/ --upload_dir $UPLOAD_FOLDER/$CIRCUIT_NAME
