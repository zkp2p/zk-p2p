#!/bin/bash

source circuit.env
echo $UPLOAD_FOLDER

echo "Uploading wasm to s3..."
python3 upload_to_s3.py --dirs "$BUILD_DIR"/"$CIRCUIT_NAME"_js/ --upload_dir $UPLOAD_FOLDER/$CIRCUIT_NAME

echo "Uploading c++ dat file to s3"
python3 upload_to_s3.py --dirs "$BUILD_DIR"/"$CIRCUIT_NAME"_cpp/ --upload_dir $UPLOAD_FOLDER/$CIRCUIT_NAME

echo "Uploading zkey and vkey.json to s3..."
python3 upload_to_s3.py --dirs "$BUILD_DIR"/ --upload_dir $UPLOAD_FOLDER/$CIRCUIT_NAME
