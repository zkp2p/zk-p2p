import boto3
import os
import tarfile
import time
import gzip
import argparse

# Set up the client for the AWS S3 service
s3 = boto3.client('s3')

parser = argparse.ArgumentParser(description='Upload files to S3 bucket')
parser.add_argument('--bucket_name', type=str, default='zk-p2p', help='Name of the S3 bucket')
# parser.add_argument('--build_dir', type=str, default='build', help='Name of the build directory directory with the circuitname/ folder')
# parser.add_argument('--circuit_name', type=str, default='venmo_send', help='Name of the circuit (i.e. the foldername in build_dir/)')
parser.add_argument('--prefix_to_tar', type=str, default='venmo_send.zkey,venmo_registration.zkey,hdfc_send.zkey,hdfc_registration.zkey', help='Prefix to match for files in order to compress to a .tar.gz and upload')
parser.add_argument('--prefix', type=str, default='venmo_send.wasm,venmo_registration.wasm,venmo_send_vkey.json,venmo_registration_vkey.json,hdfc_send.wasm,hdfc_registration.wasm,hdfc_send_vkey.json,hdfc_registration_vkey.json', help='Comma-seperated prefixes to upload without compression')
parser.add_argument('--dirs', type=str, default='', help='Comma-separated list of directories to upload from')
parser.add_argument('--upload_dir', type=str, default='', help='Directory to upload to')
args = parser.parse_args()
bucket_name = args.bucket_name
# build_dir = args.build_dir
# circuit_name = args.circuit_name
prefixes_to_tar = args.prefix_to_tar.split(',')
prefixes = args.prefix.split(',')
dirs = args.dirs.split(',')
upload_dir = args.upload_dir

# Set the name of the remote directory and the AWS bucket
# source = '~/Documents/projects/zk-email-verify'
# source = '.'
# zkey_dir = source + '/{build_dir}/{circuit_name}/'
# wasm_dir = source + '/{build_dir}/{circuit_name}/{circuit_name}_js/'

# Print dirs
# print("zkey_dir: ", zkey_dir)
# print("wasm_dir: ", wasm_dir)


def upload_to_s3(filename, dir=""):
    with open(dir + filename, 'rb') as file:
        print("Starting upload of ", filename, "...")
        s3.upload_fileobj(file, bucket_name, f"{upload_dir}/{filename}", ExtraArgs={
                          'ACL': 'public-read', 'ContentType': 'binary/octet-stream'})
        print("Done uploading ", filename, "!")


# Loop through the files in the remote directory
for dir in dirs:
    for file in os.listdir(dir):
        # Check if the file matches the pattern
        if any(file.startswith(prefix_to_tar) for prefix_to_tar in prefixes_to_tar):
            source_file_path = dir + file
            upload_to_s3(file, dir)  # Uncompressed file

            # Make a .gz file
            print("Compressing .gz: ", source_file_path)
            gz_file = file + ".gz"
            with open(source_file_path, 'rb') as f_in, gzip.open(gz_file, 'wb') as f_out:
                f_out.write(f_in.read())
            gz_file_name = file + '.gz'
            # Upload the zip file to the AWS bucket, overwriting any existing file with the same name
            upload_to_s3(gz_file)

            # Create a .tar.gz file for the file
            tar_file_name = file + '.tar.gz'
            print("Compressing .tar.gz: ", source_file_path)
            with tarfile.open(tar_file_name, 'w:gz') as tar_file:
                tar_file.add(source_file_path,
                             arcname=os.path.basename(source_file_path))

            # Upload the .tar.gz file to the AWS bucket, overwriting any existing file with the same name
            upload_to_s3(tar_file_name)

            os.remove(tar_file_name)
            os.remove(gz_file_name)

        # If file starts with any one of the prefixes
        if any(file.startswith(prefix) for prefix in prefixes):
            # Upload the zip file to the AWS bucket, overwriting any existing file with the same name
            upload_to_s3(file, dir)
        # if file.startswith('vkey.json') or file.startswith('email.wasm'):
        #     upload_to_s3(file, dir)
