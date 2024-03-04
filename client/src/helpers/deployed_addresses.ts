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
    'venmoSendProcessor': '0xa14C825632601d5aC68d01e41dBF4387a9b64917',
    'venmoRegistrationProcessor': '0x7a0Ff42fCCc3e2A579A2Fa783cfcAA9E37191383',
    'venmoNft': '0x4281cee3ae43d19a2cf9a6002cb7ea90869ad4d5',
    'hdfcRamp': '0xf3c9a6CA0DF1950a62ea868704678b1e8C34918a',
    'hdfcSendProcessor': '0x03eB0ba3f7A4451C41278Af74E8384079Ae40170',
    'hdfcRegistrationProcessor': '0xD2B4CcA64Fc4B7588D6546780fEdb4c71A4b75D6',
    'hdfcNft': '0x94874b3a294becc3dea2c320c300d2d2a4b25451',
    'socketBridge': '0x3a23f943181408eac424116af7b7790c94cb97a5',
    'lifiBridge': '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'
  },
  'base_staging': {
    'legacyRamp': '0xa08d9952196ABECB2BaCD14188093314053f6335',
    'legacyNft': '0x516Aba305CD1fd36c540D9EDc679e165EAB89e9F',
    'usdc': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    'venmoRamp': '0x80e5aB2921e23192B2454f6a386Fd7032dad932E',
    'venmoSendProcessor': '0xABB08332794969f5CBE790930E96c80CFaA35119',
    'venmoRegistrationProcessor': '0x358fDD11e573fEE0a92B93AE7362D2B531B7Bc63',
    'venmoNft': '0xc0c2ad120c63b3c7d7e9c555352e42c2fc8bb50b',
    'hdfcRamp': '0xc137d22fa93316Df55b5F896F5180c722D02b01D',
    'hdfcSendProcessor': '0x3bCC71916d9d2BB5F52Fdb386814bd84C9312A04',
    'hdfcRegistrationProcessor': '0xC8d7C6a5a8B2158012FB679DB1c3d7fbC1cC2980',
    'hdfcNft': '0x6b64BC61cd03cdD7Ac3aF6Ad6A02977265d21ecB',
    'garantiRamp': '0x27a6Ecb917B4BbCb6450f50Fa873510Ac3077171',
    'garantiSendProcessor': '0x50A368DAF428dcA0e980F640C06A79D466E62a2C',
    'garantiRegistrationProcessor': '0x5ca44163d25d09198a3eb89c9AB82fA8074f6C0D',
    'garantiNft': '',
    'socketBridge': '0x3a23f943181408eac424116af7b7790c94cb97a5',
    'lifiBridge': '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'
  },
  'sepolia_staging': {
    'legacyRamp': '0x75422735DD94dfD04b7ef5D7044Aba0ce4E3a7A6',
    'legacyNft': '',
    'usdc': '0xBBA5C9bd54a4293f4261b38e5aD41820eC41ed86',
    'venmoRamp': '0x38637CD256d70994f2d5533BEAfe52eEfC2a96Ab',
    'venmoSendProcessor': '0x84ac07EfC0c7093416aCd6189a600AD479CFA045',
    'venmoRegistrationProcessor': '0x8374d6e81363fE432F98E46E8A6Fe0873e526FB8',
    'venmoNft': '0x73ca27fd61afa3823046f9f9101b17a0cfa5c1ad',
    'hdfcRamp': '0xb4A7486b0EFa264D5FC6A8181bfc7A150cD57849',
    'hdfcSendProcessor': '0x668109Fb6c6D2a563F9b7FB3dA3367CCb726B4af',
    'hdfcRegistrationProcessor': '0xE5e50A9F071DF9185183c6523c9a4162eB278583',
    'hdfcNft': '0x1bb5f399a50050d76ebffb52ae8a526493ef8916',
    'garantiRamp': '0xEfBDf422FA81071A04D2f89A70A0D938FEFA0795',
    'garantiSendProcessor': '0xd30087458186424C12BEAEbf1167142284E33437',
    'garantiRegistrationProcessor': '0xFbBdAa7354fB1d40B48130F026e6DD371474dB8D',
    'garantiNft': '',
    'socketBridge': '',
    'lifiBridge': '',
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
    'garantiRamp': '0x9E545E3C0baAB3E08CdfD552C960A1050f373042',
    'garantiSendProcessor': '0xf5059a5D33d5853360D16C683c16e67980206f36',
    'garantiRegistrationProcessor': '0x851356ae760d987E095750cCeb3bC6014560891C',
    'garantiNft': '',
    'socketBridge': '',
    'lifiBridge': '',
  },
};

export const blockExplorerUrls: { [network: string]: string } = {
  'hardhat': 'https://etherscan.io',
  'sepolia': 'https://sepolia.etherscan.io/',
  'base': 'https://basescan.org'
};
