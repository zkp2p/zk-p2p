import "module-alias/register";
import { BigNumber } from "ethers";
import { ONE_DAY_IN_SECONDS, THREE_MINUTES_IN_SECONDS, ZERO } from "@utils/constants";
import { ether, usdc } from "@utils/common/units";

// Deployment Parameters

// Global Parameters
export const MULTI_SIG: any = {
  "localhost": "",
  "sepolia": "",
  "base": "0x0bC26FF515411396DD588Abd6Ef6846E04470227",
  "base_staging": "0xdd93E0f5fC32c86A568d87Cb4f08598f55E980F3",
};

export const FEE_RECIPIENT: any = {
  "localhost": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "sepolia": "0x84e113087C97Cd80eA9D78983D4B8Ff61ECa1929",
  "base": "0x0bC26FF515411396DD588Abd6Ef6846E04470227",
  "base_staging": "0xdd93E0f5fC32c86A568d87Cb4f08598f55E980F3",
};

export const FEE_PERCENTAGE: any = {
  "localhost": ether(0.01),   // 1%
  "sepolia": ether(0.025),    // 2.5%
  "base": ether(0.01),       // 1%
  "base_staging": ether(0.01), // 1%
};

export const BID_SETTLEMENT_PERIOD: any = {
  "localhost": ONE_DAY_IN_SECONDS,
  "sepolia": THREE_MINUTES_IN_SECONDS,    // 3 minutes
  "base": ONE_DAY_IN_SECONDS,
  "base_staging": ONE_DAY_IN_SECONDS,
};

export const BID_REFUND_PERIOD: any = {
  "localhost": ONE_DAY_IN_SECONDS,
  "sepolia": THREE_MINUTES_IN_SECONDS,    // 3 minutes  
  "base": ONE_DAY_IN_SECONDS,
  "base_staging": ONE_DAY_IN_SECONDS,
};

export const VERIFY_DOMAIN_PROVIDER_HASHES: any = [
  '0xfd4622039be3e4286dd3285d36d772a71d580a9afa0a1718a7e643539c952cf9',   // 0
  '0x90a6489eff38140689a15133fb58906a7e847cc18271af036936c8eda91ddcc8',   // 1
  '0x14d26d02b3ae9f26f9e62a4d8d76ebfff0cd4a4d4629c08c909af99ec0eb41d7',   // 2
  '0x64558b4363c4f8d4e7c1ee1a75e4d82f8fa76640e174b06d4ed34e3b46ebc1a7',   // 3
  '0xe4ac93cf32a585897b300eec0d22fddaed70165948f7aafd1c44364805813057',   // 4
  '0x4a266fd63f550db6b79172325f33419df6d5d87bf924b175d8b1817f010a21cf',   // 5
  '0xdc0e66724fcf38e8519c7ab33ab9e6a047c758db35204b1d086500fe50333f71',   // 6
  '0x515a82e3326b985ca073d58a3ba9290e84ff8d021d072e7b420fd0616bc609e7',   // 7
  '0xb41a513fdd3e2b7a6b8e0c02f8a714aa3aca101cd32365de6cbac90fae308e06',   // 8
  '0x1fdc4738b323d4c38bf657a33f74f95618bc11933fcc4ce6e9f3f7c93f5a492e',   // 9
  '0x5f15231e57a2fa86f5e1eb1c2abdbd5485109ada65bb63bed87c72425dca8285',   // 10
  '0x5459ebbea646d1a4a0c93944e68600c9e355918a90b36d352a1291ba557e556c',   // 11
  '0xff66c7ec1f7c81fc833bafb9522cc15be4ef56462267c89879510501c1bc77fd',   // 12
  '0x5faa515009ca792805bdf03d951d753ab241c321066e3f0cbc0ee8f4c09ecb32',   // 13
  '0x804818b286e6c204b3f18282b1f7a0a40b1b555bc39dcf256342e0b4dc3f2992',   // 14
  '0x5ff169334a81b8b98ba9e7beb1ef2e3860f79f148cf07526524e829ecf6d6e5d',   // 15
  '0x38989329e5ced5859e6509da39f11f6344c10522c0193c0cb573e783e974fbd0',   // 16
  '0xac441d6d1e9962eb0abcbc819231e48614786c179507fd0faaec4cad0b5d1e0b',   // 17
  '0xe62e6329abefdee24fcecf37ca55b112fa9d0abacb2c99cd7f8c0da6c7ba46a8',   // 18
  '0x099b6726de138236fa7d3917f17caef42ebd19fa93de96b1b1faffc713265d30'    // 19
];

export const VERIFY_DOMAIN_WITNESS: any = {
  "localhost": "0x0636c417755E3ae25C6c166D181c0607F4C572A3",
  "sepolia": "0x0636c417755E3ae25C6c166D181c0607F4C572A3",
  "base": "",
  "base_staging": "",
};


export const ALLOWED_ADDRESSES_ENABLED: any = {
  "localhost": false,
  "sepolia": false,
  "base": false,
  "base_staging": false,
};

export const ALLOWED_ADDRESSES: any = {
  "localhost": [],
  "sepolia": [],
  "base": [],
  "base_staging": [],
};

// USDC
export const USDC: any = {
  "base": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "base_staging": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
};

// For Goerli and localhost
export const USDC_MINT_AMOUNT = usdc(1000000);
export const USDC_RECIPIENT = "0x1d2033DC6720e3eCC14aBB8C2349C7ED77E831ad";


export const FROM_EMAIL = {
  "namecheap": "support@namecheap.com",
};

// Deployment Parameters
export const SERVER_KEY_HASH = {
  "namecheap": [
    "0x0db7730bdd90c823601ed32395c8b2f3307fd4adc477ca22bf3ed406c1b3ae4a", // selector: s1
  ]
};