import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import * as readline from 'readline';

import {
  ManagedKeyHashAdapter__factory,
  ManagedKeyHashAdapterV2__factory
} from "../typechain/factories/contracts/processors/keyHashAdapters/index";
import { PaymentProviders } from "../utils/types"

task("genKeyUpdateCalldata", "Add a manufacturer to the ManufacturerRegistry")
  .addParam("hash", "Hash of the modulus of the new domain key")
  .setAction(async (taskArgs, hre: HRE) => {
    // Generate the calldata for adding a new domain key to the ManagedKeyHashAdapter
    const hash = taskArgs.hash;
    const [ defaultAccount ] = await hre.getUnnamedAccounts();

    // Allow script caller to select the payment provider they want to use
    const paymentNetwork = await getPaymentNetwork();

    let calldata;
    if (paymentNetwork === "Venmo") {
      calldata = ManagedKeyHashAdapter__factory.connect(
        defaultAccount,
        hre.ethers.provider
      ).interface.encodeFunctionData("setMailserverKeyHash", [hash]);
    } else {
      calldata = ManagedKeyHashAdapterV2__factory.connect(
        defaultAccount,
        hre.ethers.provider
      ).interface.encodeFunctionData("addMailServerKeyHash", [hash]);
    }
    
    console.log(calldata);
  });

// A utility function to prompt the user for input
async function getPaymentNetwork(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const paymentProviderList = Object.keys(PaymentProviders);

  const baseQuestion = `Type the name of the payment provider you want to use: \n`;
  const question = paymentProviderList.reduce((acc, curr) => {
    return `${acc} - ${curr}\n`;
  }, baseQuestion);
  const paymentNetwork = await queryUser(rl, question);

  if (!paymentProviderList.includes(paymentNetwork)) {
    console.log("Invalid payment provider. Please try again.");
    return await getPaymentNetwork();
  }

  return paymentNetwork;
};

// A utility function to prompt the user for input
function queryUser(rl: readline.ReadLine, question: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};
