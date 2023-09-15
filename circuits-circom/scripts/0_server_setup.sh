#!/bin/bash
# This script is used to setup the server for ZK app development.
# Required: OS: Ubuntu 20.04 LTS, Architecture: x86_64

# Time:
# Takes about 20 minutes to run on a 16 core machine with 128 GB RAM.
# Installing patched node takes about 15 minutes. Rest of the script takes about 5 minutes.

# Todo:
# This script uses node 14.8.0 but latest snarkjs and rapidsnark packages.
# These might become incompatible at some point in future. Although works right now.

SWAP_SIZE=$1
AWS_REGION=$4


if [ ! $# -eq 5 ]; # Check if there are 5 arguments
then
    echo "Wrong number of arguments"
    exit 1
fi

# Redirect standard output and standard error to both console and log file
exec &> >(tee -a setup_log.out)

echo -e "\n\n********** Updating the system **********"
sudo apt update -y


echo -e "\n\n********** Installing important packages **********"
sudo apt install build-essential libgmp-dev libsodium-dev nasm nlohmann-json3-dev unzip -y


echo -e "\n\n********** Setting up swap **********"
sudo fallocate -l $SWAP_SIZE /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Persist swap through reboots
sudo sh -c 'echo "/swapfile swap swap defaults 0 0" >> /etc/fstab'


echo -e "\n\n********** Removing system memory limit **********"
sudo sh -c 'echo "vm.max_map_count=10000000" >>/etc/sysctl.conf'
sudo sh -c 'echo 10000000 > /proc/sys/vm/max_map_count'


echo -e "\n\n********** Installing Rust **********"
cd $HOME
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- --default-toolchain=stable -y

# Configure current shell
source $HOME/.cargo/env


echo -e "\n\n********** Cloning circom **********"
cd $HOME
git clone https://github.com/iden3/circom.git


echo -e "\n\n********** Installing circom **********"
cd $HOME/circom
cargo build --release
cargo install --path circom
cd $HOME


echo -e "\n\n********** Installing nvm **********"
cd $HOME
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
source ~/.bashrc


echo -e "\n\n********** Installing node 14.8.0 **********"
nvm install v18


echo -e "\n\n********** Installing yarn **********"
npm install --global yarn

echo -e "\n\n********** Set yarn to berry mode **********"
yarn set version berry


echo -e "\n\n********** Installing rapidsnark from source **********"
cd $HOME
git clone https://github.com/iden3/rapidsnark.git
cd rapidsnark
npm install
git submodule init
git submodule update
npx task createFieldSources
npx task buildProver
export RAPIDSNARK_PATH=$HOME/rapidsnark/build/cli/cli.cjs
echo 'export RAPIDSNARK_PATH=$HOME/rapidsnark/build/cli/cli.cjs' >> ~/.bashrc


echo -e "\n\n********** Installing aws cli **********"
cd $HOME
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install


echo -e "\n\n********** Configuring aws cli **********"
mkdir -p ~/.aws
touch ~/.aws/config
echo "[default]
region=$AWS_REGION
output=json
" > ~/.aws/config

aws configure --profile default


echo -e "\n\n********** Creating workspace **********"
cd $HOME
mkdir -p workspace

echo -e "\n\n********** Run source ~/.bashrc and you should be good to go!! **********"