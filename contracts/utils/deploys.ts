import { BigNumber, Signer, ethers } from "ethers";

import { Address } from "@utils/types";

const circom = require("circomlibjs");

import { 
  Ramp,
  USDCMock,
  VenmoReceiveProcessorMock,
  VenmoReceiveProcessor,
  VenmoRegistrationProcessor,
  VenmoRegistrationProcessorMock,
  VenmoSendProcessorMock,
  VenmoSendProcessor
} from "./contracts";
import { Ramp__factory } from "../typechain/factories/contracts";
import { 
  USDCMock__factory,
  VenmoReceiveProcessorMock__factory,
  VenmoRegistrationProcessorMock__factory,
  VenmoSendProcessorMock__factory
} from "../typechain/factories/contracts/mocks";
import {
  VenmoReceiveProcessor__factory,
  VenmoRegistrationProcessor__factory,
  VenmoSendProcessor__factory
} from "../typechain/factories/contracts/processors";

export default class DeployHelper {
  private _deployerSigner: Signer;

  constructor(deployerSigner: Signer) {
    this._deployerSigner = deployerSigner;
  }

  public async deployRamp(
    owner: Address,
    usdc: Address,
    poseidon: Address,
    receiveVerifier: Address,
    registrationVerifier: Address,
    sendVerifier: Address,
    minDepositAmount: BigNumber,
    convenienceRewardTimePeriod: BigNumber = BigNumber.from(10),
  ): Promise<Ramp> {
    return await new Ramp__factory(this._deployerSigner).deploy(
      owner,
      usdc,
      poseidon,
      receiveVerifier,
      registrationVerifier,
      sendVerifier,
      minDepositAmount,
      convenienceRewardTimePeriod
    );
  }

  public async deployUSDCMock(mintAmount: BigNumber, name: string, symbol: string): Promise<USDCMock> {
    return await new USDCMock__factory(this._deployerSigner).deploy(mintAmount.toString(), name, symbol);
  }

  public async deployVenmoRegistrationProcessor(
    venmoKeys: string,
    emailFromAddress: string,
  ): Promise<VenmoRegistrationProcessor> {
    return await new VenmoRegistrationProcessor__factory(this._deployerSigner).deploy(venmoKeys, emailFromAddress);
  }

  public async deployVenmoReceiveProcessor(
    venmoKeys: string,
    emailFromAddress: string,
  ): Promise<VenmoReceiveProcessor> {
    return await new VenmoReceiveProcessor__factory(this._deployerSigner).deploy(venmoKeys, emailFromAddress);
  }

  public async deployVenmoSendProcessor(
    venmoKeys: string,
    emailFromAddress: string,
  ): Promise<VenmoSendProcessor> {
    return await new VenmoSendProcessor__factory(this._deployerSigner).deploy(venmoKeys, emailFromAddress);
  }

  public async deployVenmoReceiveProcessorMock(): Promise<VenmoReceiveProcessorMock> {
    return await new VenmoReceiveProcessorMock__factory(this._deployerSigner).deploy();
  }

  public async deployVenmoSendProcessorMock(): Promise<VenmoSendProcessorMock> {
    return await new VenmoSendProcessorMock__factory(this._deployerSigner).deploy();
  }

  public async deployVenmoRegistrationProcessorMock(): Promise<VenmoRegistrationProcessorMock> {
    return await new VenmoRegistrationProcessorMock__factory(this._deployerSigner).deploy();
  }

  public async deployPoseidon(): Promise<any> {
    const contract = new ethers.ContractFactory(
      circom.poseidonContract.generateABI(3),
      circom.poseidonContract.createCode(3),
      this._deployerSigner
    );

    return await contract.deploy();
  }
}
