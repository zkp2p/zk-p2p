import { BigNumber, Signer, ethers } from "ethers";

import { Address } from "@utils/types";

const circom = require("circomlibjs");

import { 
  Ramp,
  ManagedKeyHashAdapter,
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
import { ManagedKeyHashAdapter__factory } from "../typechain/factories/contracts/processors/keyHashAdapters";

export default class DeployHelper {
  private _deployerSigner: Signer;

  constructor(deployerSigner: Signer) {
    this._deployerSigner = deployerSigner;
  }

  public async deployRamp(
    owner: Address,
    usdc: Address,
    poseidon: Address,
    minDepositAmount: BigNumber,
  ): Promise<Ramp> {
    return await new Ramp__factory(this._deployerSigner).deploy(
      owner,
      usdc,
      poseidon,
      minDepositAmount
    );
  }

  public async deployUSDCMock(mintAmount: BigNumber, name: string, symbol: string): Promise<USDCMock> {
    return await new USDCMock__factory(this._deployerSigner).deploy(mintAmount.toString(), name, symbol);
  }

  public async deployVenmoRegistrationProcessor(
    ramp: Address,
    venmoKeys: string,
    emailFromAddress: string,
  ): Promise<VenmoRegistrationProcessor> {
    return await new VenmoRegistrationProcessor__factory(this._deployerSigner).deploy(ramp, venmoKeys, emailFromAddress);
  }

  public async deployVenmoReceiveProcessor(
    ramp: Address,
    venmoKeys: string,
    emailFromAddress: string,
  ): Promise<VenmoReceiveProcessor> {
    return await new VenmoReceiveProcessor__factory(this._deployerSigner).deploy(ramp, venmoKeys, emailFromAddress);
  }

  public async deployVenmoSendProcessor(
    ramp: Address,
    venmoKeys: string,
    emailFromAddress: string,
  ): Promise<VenmoSendProcessor> {
    return await new VenmoSendProcessor__factory(this._deployerSigner).deploy(ramp, venmoKeys, emailFromAddress);
  }

  public async deployManagedKeyHashAdapter(venmoKeyHash: string): Promise<ManagedKeyHashAdapter> {
    return await new ManagedKeyHashAdapter__factory(this._deployerSigner).deploy(venmoKeyHash);
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
