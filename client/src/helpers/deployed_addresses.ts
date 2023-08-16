type Contracts = {
  [network: string]: {
    [contract: string]: string;
  };
};

export const contractAddresses: Contracts = {
  "hardhat": {
    "ramp": '0xdc64a140aa3e981100a9beca4e685f962f0cf6c9',
    "fusdc": '0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9',
  },
  "goerli": {
    "ramp": '',
    "fusdc": '',
  },
  "optimism": {
    "ramp": '',
    "fusdc": '',
  },
};
