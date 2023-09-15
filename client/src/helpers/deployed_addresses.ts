type Contracts = {
  [network: string]: {
    [contract: string]: string;
  };
};

export const contractAddresses: Contracts = {
  "hardhat": {
    "ramp": '0x5fc8d32690cc91d4c39d9d3abcbd16989f875707',
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
