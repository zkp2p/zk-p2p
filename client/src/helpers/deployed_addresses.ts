type Contracts = {
  [network: string]: {
    [contract: string]: string;
  };
};

export const contractAddresses: Contracts = {
  "hardhat": {
    "ramp": '0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0',
    "fusdc": '0x5fbdb2315678afecb367f032d93f642f64180aa3',
    "receiveProcessor": '0x5fc8d32690cc91d4c39d9d3abcbd16989f875707',
    "sendProcessor": '0x0165878a594ca255338adfa4d48449f69242eb8f',
    "registrationProcessor": '0xdc64a140aa3e981100a9beca4e685f962f0cf6c9',
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
