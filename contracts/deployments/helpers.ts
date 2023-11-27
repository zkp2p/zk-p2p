import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Address } from "../utils/types";

export function getDeployedContractAddress(network: string, contractName: string): string {
  return require(`./${network}/${contractName}.json`).address;
}

export async function setNewOwner(hre: HardhatRuntimeEnvironment, contract: any, newOwner: Address): Promise<void> {
  const currentOwner = await contract.owner();

  if (currentOwner != newOwner) {
    const data = contract.interface.encodeFunctionData("transferOwnership", [newOwner]);

    await hre.deployments.rawTx({
      from: currentOwner,
      to: contract.address,
      data
    });
  }
}
