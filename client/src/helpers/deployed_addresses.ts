type Contracts = {
  [network: string]: {
    [contract: string]: string;
  };
};

export const contractAddresses: Contracts = {
  'base_production': {
    'legacyRamp': '0xB084f36C5B7193af8Dd17025b36FBe2DD496a06f',
    'legacyNft': '0xaB6b0b5666DC2C8357fdcD8A1E96973932dd1545',
    'usdc': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    'venmoRamp': '',
    'venmoSendProcessor': '',
    'venmoRegistrationProcessor': '',
    'venmoNft': '',
    'hdfcRamp': '',
    'hdfcSendProcessor': '',
    'hdfcRegistrationProcessor': '',
    'hdfcNft': '',
  },
  'base_staging': {
    'legacyRamp': '0xa08d9952196ABECB2BaCD14188093314053f6335',
    'legacyNft': '0x516Aba305CD1fd36c540D9EDc679e165EAB89e9F',
    'usdc': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    'venmoRamp': '',
    'venmoSendProcessor': '',
    'venmoRegistrationProcessor': '',
    'venmoNft': '',
    'hdfcRamp': '',
    'hdfcSendProcessor': '',
    'hdfcRegistrationProcessor': '',
    'hdfcNft': '',
  },
  'goerli_staging': {
    'legacyRamp': '0x9916fec54D428bAf38d43B9D91ac968b8DDA51Bd',
    'legacyNft': '0x102d57a3b5471ab2648f0f0ea8ed29325998251e',
    'usdc': '0x8374d6e81363fE432F98E46E8A6Fe0873e526FB8',
    'venmoRamp': '0xfD04fb0538479ad70DFae539c875B2C180205012',
    'venmoSendProcessor': '0x3C754B95F72Aeb2447244402155779A8B69f3d70',
    'venmoRegistrationProcessor': '0xcE2f93E2f05Fc4B65E771e5b982d0dbD41cE307D',
    'venmoNft': '0x8dfb97f8401d5da4f5ac712863ec2d92757861d3',
    'hdfcRamp': '0x7edd66b19a22293af86a2d96761fd7146ba3ff6c',
    'hdfcSendProcessor': '0xEF14b8a0196002dA629c1eC585371274FA9Da7d8',
    'hdfcRegistrationProcessor': '0x8E9ca43089F380A904D2d121fAa021bb4fbb0f4a',
    'hdfcNft': '0x6b1e74b7e6145505eb529af36cb9a726abef1cdd',
  },
  'localhardhat': {
    'legacyRamp': '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    'legacyNft': '',
    'usdc': '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    'venmoRamp': '0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f',
    'venmoSendProcessor': '0x09635F643e140090A9A8Dcd712eD6285858ceBef',
    'venmoRegistrationProcessor': '0x7a2088a1bFc9d81c55368AE168C2C02570cB814F',
    'venmoNft': '',
    'hdfcRamp': '0x0B306BF915C4d645ff596e518fAf3F9669b97016',
    'hdfcSendProcessor': '0x68B1D87F95878fE05B998F19b66F4baba5De1aed',
    'hdfcRegistrationProcessor': '0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE',
    'hdfcNft': '',
  },
};

export const blockExplorerUrls: { [network: string]: string } = {
  'hardhat': 'https://etherscan.io',
  'goerli': 'https://goerli.etherscan.io',
  'base': 'https://basescan.org'
};
