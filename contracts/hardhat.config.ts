import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import '@nomicfoundation/hardhat-chai-matchers'

import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  // @ts-ignore
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};

export default config;
