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
  "base": {
    "ramp": '0xa08d9952196ABECB2BaCD14188093314053f6335',
    "fusdc": '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    "sendProcessor": '0x38074075e15057C83f9A6A7E31C2eB74E6362c57',
    "registrationProcessor": '0xC536C23C2dc76be96eb25A444c857053a591923E',
  },
  "goerli": {
    "ramp": '0x3AcFEeFF0d80929f00143490af1ed7bf2836fcBD',
    "fusdc": '0x4EA8130c89625AcFecdcac6CA2008967E31992e3',
    "sendProcessor": '0x8f2Bdd3343cAa489696dFDBCae7262cEb6C247be',
    "registrationProcessor": '0xbCC63C904898063fB04014189Ec1fB1628F7B6E1',
  },
  "goerli_0_0_8": {
    "ramp": '0x1A2dcc7AfC7Bf09bE718E54466aA18166C00E4FD',
    "fusdc": '0x0a5A6f847899e185a14e54266036CE8260142659',
    "sendProcessor": '0x0a7537A73079C45f64623D213Cd284E9b55Fe0b7',
    "registrationProcessor": '0x8D54b20922aEA549224D61501225a0DaB5bC3839',
  },
  "goerli_0_0_7": {
    "ramp": '0x75422735DD94dfD04b7ef5D7044Aba0ce4E3a7A6',
    "fusdc": '0xbba5c9bd54a4293f4261b38e5ad41820ec41ed86',
    "sendProcessor": '0x951E072a8eD9ad9F8dCe89a3Be274a96966097Bb',
    "registrationProcessor": '0xAf0196f22a1383B779E3f833AD35BFf38722c8AD',
  },
};
