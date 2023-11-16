type Contracts = {
  [network: string]: {
    [contract: string]: string;
  };
};

export const contractAddresses: Contracts = {
  "base_production": {
    "ramp": '0xB084f36C5B7193af8Dd17025b36FBe2DD496a06f',
    "fusdc": '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    "sendProcessor": '0x9011fC66C34546511cf1e514F248fB98Af95b96d',
    "registrationProcessor": '0x71EAD6E8FC3331da65191BCbdD3BE81F04EAa3CA',
  },
  "base_staging": {
    "ramp": '0xa08d9952196ABECB2BaCD14188093314053f6335',
    "fusdc": '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    "sendProcessor": '0x574ACe7463dD126D2D22825BAa846cf1B3d87D4F',
    "registrationProcessor": '0xEf15b6Fd708F35a85c19C30F78119Ff8595aD627',
  },
  "goerli_staging": {
    "ramp": '0x203A308F713e8638A3e782cECBC35e464Fc7a01d',
    "fusdc": '0x854284C8516Fa6c7d18422942465534bd7ee3382',
    "sendProcessor": '0x6AEd6eb9Ef152c95b55bF6d335ff68301E42f4f0',
    "registrationProcessor": '0x584DADC1a399967E2B573DCc10c5B1B6989B128e',
  },
  "localhardhat": {
    "ramp": '0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0',
    "fusdc": '0x5fbdb2315678afecb367f032d93f642f64180aa3',
    "sendProcessor": '0x0165878a594ca255338adfa4d48449f69242eb8f',
    "registrationProcessor": '0x5fc8d32690cc91d4c39d9d3abcbd16989f875707',
  },
};

export const blockExplorerUrls: { [network: string]: string } = {
  "hardhat": "https://etherscan.io",
  "goerli": "https://goerli.etherscan.io",
  "base": "https://basescan.org"
};
