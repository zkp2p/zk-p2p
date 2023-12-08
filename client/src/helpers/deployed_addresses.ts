type Contracts = {
  [network: string]: {
    [contract: string]: string;
  };
};

export const contractAddresses: Contracts = {
  'base_production': {
    'ramp': '0xB084f36C5B7193af8Dd17025b36FBe2DD496a06f',
    'fusdc': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    'sendProcessor': '0x9011fC66C34546511cf1e514F248fB98Af95b96d',
    'registrationProcessor': '0x71EAD6E8FC3331da65191BCbdD3BE81F04EAa3CA',
    'proofOfP2pNft': '0xaB6b0b5666DC2C8357fdcD8A1E96973932dd1545',
  },
  'base_staging': {
    'ramp': '0xa08d9952196ABECB2BaCD14188093314053f6335',
    'fusdc': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    'sendProcessor': '0x574ACe7463dD126D2D22825BAa846cf1B3d87D4F',
    'registrationProcessor': '0xEf15b6Fd708F35a85c19C30F78119Ff8595aD627',
    'proofOfP2pNft': '0x516Aba305CD1fd36c540D9EDc679e165EAB89e9F',
  },
  'goerli_staging': {
    'ramp': '0x9916fec54D428bAf38d43B9D91ac968b8DDA51Bd',
    'fusdc': '0x8374d6e81363fE432F98E46E8A6Fe0873e526FB8',
    'sendProcessor': '0xE231f5127859683C0FCb8eE5eBFfBdA1359b30Bb',
    'registrationProcessor': '0xCe2328d025fc779a144C7899b1462Cd3660A2EB2',
    'proofOfP2pNft': '0x102d57a3b5471ab2648f0f0ea8ed29325998251e',
    'hdfcRamp': '0xe6d21594014959395675c89d127A53070e774Cad',
    'hdfcSendProcessor': '0x0DbBA30DBF8b8ec9024D65179C82A1b46e50B87D',
    'hdfcRegistrationProcessor': '0x736409031878D48A90f240Fe17fdd6757FA81CA3',
  },
  'localhardhat': {
    'ramp': '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    'fusdc': '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    'sendProcessor': '0x0165878A594ca255338adfa4d48449f69242Eb8F',
    'registrationProcessor': '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    'proofOfP2pNft': '0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f',
    'hdfcRamp': '0x0B306BF915C4d645ff596e518fAf3F9669b97016',
    'hdfcSendProcessor': '0x68B1D87F95878fE05B998F19b66F4baba5De1aed',
    'hdfcRegistrationProcessor': '0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE',
  },
};

export const blockExplorerUrls: { [network: string]: string } = {
  'hardhat': 'https://etherscan.io',
  'goerli': 'https://goerli.etherscan.io',
  'base': 'https://basescan.org'
};
