type Contracts = {
  [network: string]: {
    [contract: string]: string;
  };
};

export const contractAddresses: Contracts = {
  "hardhat": {
    "ramp": '0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0',
    "fusdc": '0x5fbdb2315678afecb367f032d93f642f64180aa3',
    "sendProcessor": '0x0165878a594ca255338adfa4d48449f69242eb8f',
    "registrationProcessor": '0x5fc8d32690cc91d4c39d9d3abcbd16989f875707',
  },
  "goerli": {
    "ramp": '0x1A2dcc7AfC7Bf09bE718E54466aA18166C00E4FD',
    "fusdc": '0x0a5A6f847899e185a14e54266036CE8260142659',
    "sendProcessor": '0x0a7537A73079C45f64623D213Cd284E9b55Fe0b7',
    "registrationProcessor": '0x8D54b20922aEA549224D61501225a0DaB5bC3839',
  },
};
