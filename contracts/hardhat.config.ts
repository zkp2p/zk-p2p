import * as dotenv from 'dotenv';

import '@typechain/hardhat'
import 'solidity-coverage'
import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy';
import '@nomiclabs/hardhat-etherscan';
import '@nomicfoundation/hardhat-chai-matchers'

import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      allowBlocksWithSameTimestamp: true,
    },
    localhost: {
      allowBlocksWithSameTimestamp: true,
    },
    goerli: {
      url: "https://goerli.infura.io/v3/" + process.env.INFURA_TOKEN,
      // @ts-ignore
      accounts: [
        `0x${process.env.GOERLI_DEPLOY_PRIVATE_KEY}`,
      ],
    },
  },
  verify: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY
    }
  },
  // @ts-ignore
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};

export default config;
