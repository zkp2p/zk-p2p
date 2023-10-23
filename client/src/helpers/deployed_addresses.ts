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
    "ramp": '0x1A2dcc7AfC7Bf09bE718E54466aA18166C00E4FD',
    "fusdc": '0x0a5A6f847899e185a14e54266036CE8260142659',
    "receiveProcessor": '0x8E96C1c53bD6Ec2f54D4788629c423ac35fA6d75',
    "sendProcessor": '0x0a7537A73079C45f64623D213Cd284E9b55Fe0b7',
    "registrationProcessor": '0x8D54b20922aEA549224D61501225a0DaB5bC3839',
  },
  "goerli_legacy": {
    "ramp": '0x75422735DD94dfD04b7ef5D7044Aba0ce4E3a7A6',
    "fusdc": '0xbba5c9bd54a4293f4261b38e5ad41820ec41ed86',
    "receiveProcessor": '0xF05627d52F3b4b173002Ee64E90FEc169db77057',
    "sendProcessor": '0x951E072a8eD9ad9F8dCe89a3Be274a96966097Bb',
    "registrationProcessor": '0xAf0196f22a1383B779E3f833AD35BFf38722c8AD',
  },
  "optimism": {
    "ramp": '',
    "fusdc": '',
  },
};
