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
    'venmoRamp': '0xbcE0B9e082F6619411dd8d029DFf8116BA36A76D',
    'venmoSendProcessor': '0xf1B6087F02B3b6F7a15F834E7b3319AB4c4F774D',
    'venmoRegistrationProcessor': '0xBCB8EC43e89eC83130DB88783FF3e1A35AF10e00',
    'venmoNft': '0x4281cee3ae43d19a2cf9a6002cb7ea90869ad4d5',
    'hdfcRamp': '0xf3c9a6CA0DF1950a62ea868704678b1e8C34918a',
    'hdfcSendProcessor': '0xaBf83Bca8769498F558658861251122C6740d441',
    'hdfcRegistrationProcessor': '0xAEa884273Cd994Ea8C45c37990046900Ff3D8130',
    'hdfcNft': '0x94874b3a294becc3dea2c320c300d2d2a4b25451',
  },
  'base_staging': {
    'legacyRamp': '0xa08d9952196ABECB2BaCD14188093314053f6335',
    'legacyNft': '0x516Aba305CD1fd36c540D9EDc679e165EAB89e9F',
    'usdc': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    'venmoRamp': '0x80e5aB2921e23192B2454f6a386Fd7032dad932E',
    'venmoSendProcessor': '0x91D8C4CE84dF7A4e3253822236d14e7A623C61a8',
    'venmoRegistrationProcessor': '0xe4b53E766e67c0b5d8d2b4419189F53f00991E2F',
    'venmoNft': '0xc0c2ad120c63b3c7d7e9c555352e42c2fc8bb50b',
    'hdfcRamp': '0xc137d22fa93316Df55b5F896F5180c722D02b01D',
    'hdfcSendProcessor': '0x2C5a1C0C85BC271Acb1910e3D66D8472Cab62915',
    'hdfcRegistrationProcessor': '0xeBf794338D092fb9353F92fDcad3CB578E120A07',
    'hdfcNft': '0x6b64BC61cd03cdD7Ac3aF6Ad6A02977265d21ecB',
  },
  'sepolia_staging': {
    'legacyRamp': '0x75422735DD94dfD04b7ef5D7044Aba0ce4E3a7A6',
    'legacyNft': '',
    'usdc': '0xBBA5C9bd54a4293f4261b38e5aD41820eC41ed86',
    'venmoRamp': '0x38637CD256d70994f2d5533BEAfe52eEfC2a96Ab',
    'venmoSendProcessor': '0x8644C2B4293923BF60c909171F089f4c5F75474c',
    'venmoRegistrationProcessor': '0xD228a3DD033037306727bdC11097B43aA9d6e671',
    'venmoNft': '0x73ca27fd61afa3823046f9f9101b17a0cfa5c1ad',
    'hdfcRamp': '0xb4A7486b0EFa264D5FC6A8181bfc7A150cD57849',
    'hdfcSendProcessor': '0xe00f0e2f64F6FA7Eda3278CBD66347029C9848bc',
    'hdfcRegistrationProcessor': '0x6c90ae078d8a6009666ad061521C091f57C808db',
    'hdfcNft': '0x1bb5f399a50050d76ebffb52ae8a526493ef8916',
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
  'sepolia': 'https://sepolia.etherscan.io/',
  'base': 'https://basescan.org'
};
