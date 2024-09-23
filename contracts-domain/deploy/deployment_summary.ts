import "module-alias/register";
import "module-alias/register";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

import {
  MULTI_SIG,
} from "../deployments/parameters";
import { getDeployedContractAddress } from "../deployments/helpers";

// Deployment Scripts
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = await hre.deployments
  const network = hre.deployments.getNetworkName();

  const [deployer] = await hre.getUnnamedAccounts();
  const multiSig = MULTI_SIG[network] ? MULTI_SIG[network] : deployer;

  console.log(
    `
    Deploment summary for ${network}:
    deployer:                   ${deployer}
    deployer nonce:             ${await hre.ethers.provider.getTransactionCount(deployer)}
    multiSig:                   ${multiSig}
    multiSig nonce:             ${await hre.ethers.provider.getTransactionCount(multiSig)}
    ----------------------------------------------------------------------
    DomainExchange:                       ${getDeployedContractAddress(network, "DomainExchange")}
    ClaimVerifier:                        ${getDeployedContractAddress(network, "ClaimVerifier")}
    VerifyDomainProcessor:                ${getDeployedContractAddress(network, "VerifyDomainProcessor")}
    TransferDomainProcessor:              ${getDeployedContractAddress(network, "TransferDomainProcessor")}
    VerifiedDomainRegistry:               ${getDeployedContractAddress(network, "VerifiedDomainRegistry")}
    NamecheapManagedKeyHashAdapter:       ${getDeployedContractAddress(network, "NamecheapManagedKeyHashAdapter")}
    NullifierRegistry:                    ${getDeployedContractAddress(network, "NullifierRegistry")}
    `
  );
};

func.runAtTheEnd = true;

export default func;
