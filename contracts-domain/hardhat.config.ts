import * as dotenv from 'dotenv';

import '@typechain/hardhat'
import 'solidity-coverage'
import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy';
import '@nomiclabs/hardhat-etherscan';
import '@nomicfoundation/hardhat-chai-matchers'
import 'hardhat-gas-reporter';

import { HardhatUserConfig } from "hardhat/config";
import { task } from "hardhat/config";


dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.18",
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 200,
            details: {
              yulDetails: {
                optimizerSteps: "u",
              },
            },
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      allowBlocksWithSameTimestamp: true,
      gas: 1000000000,
      hardfork: "cancun"
    },
    localhost: {
      allowBlocksWithSameTimestamp: true,
      hardfork: "cancun"
    },
    base_staging: {
      url: "https://developer-access-mainnet.base.org",
      // @ts-ignore
      accounts: [
        `0x${process.env.BASE_DEPLOY_PRIVATE_KEY}`,
      ],
      verify: {
        etherscan: {
          apiUrl: "https://api.basescan.org/",
          apiKey: process.env.BASESCAN_API_KEY
        }
      },
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/" + process.env.INFURA_TOKEN,
      // @ts-ignore
      accounts: [
        `0x${process.env.TESTNET_DEPLOY_PRIVATE_KEY}`,
      ],
      verify: {
        etherscan: {
          apiKey: process.env.ETHERSCAN_KEY
        }
      },
    },
    // goerli: {
    //   url: "https://goerli.infura.io/v3/" + process.env.INFURA_TOKEN,
    //   // @ts-ignore
    //   accounts: [
    //     `0x${process.env.TESTNET_DEPLOY_PRIVATE_KEY}`,
    //   ],
    //   verify: {
    //     etherscan: {
    //       apiKey: process.env.ETHERSCAN_KEY
    //     }
    //   },
    // },
    // base: {
    //   url: "https://developer-access-mainnet.base.org",
    //   // @ts-ignore
    //   accounts: [
    //     `0x${process.env.BASE_DEPLOY_PRIVATE_KEY}`,
    //   ],
    //   verify: {
    //     etherscan: {
    //       apiUrl: "https://api.basescan.org/",
    //       apiKey: process.env.BASESCAN_API_KEY
    //     }
    //   },
    // },
  },
  // @ts-ignore
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
  gasReporter: {
    enabled: true,
    reportPureAndViewMethods: true
  }
};


// npx hardhat update-bid-periods --refund <new_refund_period> --settlement <new_settlement_period> --network localhost

task("update-bid-periods", "Updates bidRefundPeriod and bidSettlementPeriod")
  .addParam("refund", "The new bid refund period")
  .addParam("settlement", "The new bid settlement period")
  .setAction(async (taskArgs, hre) => {
    const { refund, settlement } = taskArgs;
    const [owner] = await hre.ethers.getSigners();
    const DomainExchange = await hre.ethers.getContractFactory("DomainExchange");
    const domainExchangeAddress = await hre.deployments.get("DomainExchange").then(d => d.address);
    const domainExchange = await DomainExchange.attach(domainExchangeAddress).connect(owner);

    console.log("Updating bid periods...");

    const tx1 = await domainExchange.updateBidRefundPeriod(refund);
    await tx1.wait();
    console.log(`Bid refund period updated to ${refund}`);

    const tx2 = await domainExchange.updateBidSettlementPeriod(settlement);
    await tx2.wait();
    console.log(`Bid settlement period updated to ${settlement}`);

    console.log("Bid periods updated successfully!");
  });


task("get-block-timestamp", "Fetches the current block timestamp")
  .setAction(async (_, hre) => {
    const provider = hre.ethers.provider;
    const block = await provider.getBlock(await provider.getBlockNumber());
    const timestamp = block ? block.timestamp : 0;
    console.log(`Current block timestamp: ${timestamp}`);
  });


task("set-block-timestamp", "Sets the timestamp for the next block")
  .addParam("timestamp", "The new timestamp for the next block")
  .setAction(async (taskArgs, hre) => {
    const { timestamp } = taskArgs;
    const provider = hre.ethers.provider;
    await provider.send("evm_setNextBlockTimestamp", [timestamp]);
    await provider.send("evm_mine", []);
    console.log(`Next block timestamp set to: ${timestamp}`);
  });

export default config;
