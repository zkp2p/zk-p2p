import { BigNumber, Signer, ethers } from "ethers";

import { Address } from "@utils/types";

const circom = require("circomlibjs");

import { 
  Ramp,
  ManagedKeyHashAdapter,
  USDCMock,
  VenmoRegistrationProcessor,
  VenmoRegistrationProcessorMock,
  VenmoSendProcessorMock,
  VenmoSendProcessor,
  NullifierRegistry
} from "./contracts";
import { Ramp__factory } from "../typechain/factories/contracts";
import { 
  USDCMock__factory,
  VenmoRegistrationProcessorMock__factory,
  VenmoSendProcessorMock__factory
} from "../typechain/factories/contracts/mocks";
import {
  VenmoRegistrationProcessor__factory,
  VenmoSendProcessor__factory
} from "../typechain/factories/contracts/processors";
import { ManagedKeyHashAdapter__factory } from "../typechain/factories/contracts/processors/keyHashAdapters";
import { NullifierRegistry__factory } from "../typechain/factories/contracts/processors/nullifierRegistries";

export default class DeployHelper {
  private _deployerSigner: Signer;

  constructor(deployerSigner: Signer) {
    this._deployerSigner = deployerSigner;
  }

  public async deployRamp(
    owner: Address,
    usdcToken: Address,
    poseidon: Address,
    minDepositAmount: BigNumber,
    maxOnRampAmount: BigNumber,
    intentExpirationPeriod: BigNumber,
    onRampCoolDownPeriod: BigNumber,
    sustainabilityFee: BigNumber,
    sustainabilityFeeRecipient: Address,
  ): Promise<Ramp> {
    return await new Ramp__factory(this._deployerSigner).deploy(
      owner,
      usdcToken,
      poseidon,
      minDepositAmount,
      maxOnRampAmount,
      intentExpirationPeriod,
      onRampCoolDownPeriod,
      sustainabilityFee,
      sustainabilityFeeRecipient
    );
  }

  public async deployUSDCMock(mintAmount: BigNumber, name: string, symbol: string): Promise<USDCMock> {
    return await new USDCMock__factory(this._deployerSigner).deploy(mintAmount.toString(), name, symbol);
  }

  public async deployVenmoRegistrationProcessor(
    ramp: Address,
    keyHashAdapter: Address,
    nullifierRegistry: Address,
    emailFromAddress: string,
  ): Promise<VenmoRegistrationProcessor> {
    return await new VenmoRegistrationProcessor__factory(this._deployerSigner).deploy(
      ramp,
      keyHashAdapter,
      nullifierRegistry,
      emailFromAddress
    );
  }

  public async deployVenmoSendProcessor(
    ramp: Address,
    keyHashAdapter: Address,
    nullifierRegistry: Address,
    emailFromAddress: string,
  ): Promise<VenmoSendProcessor> {
    return await new VenmoSendProcessor__factory(this._deployerSigner).deploy(
      ramp,
      keyHashAdapter,
      nullifierRegistry,
      emailFromAddress
    );
  }

  public async deployManagedKeyHashAdapter(venmoKeyHash: string): Promise<ManagedKeyHashAdapter> {
    return await new ManagedKeyHashAdapter__factory(this._deployerSigner).deploy(venmoKeyHash);
  }

  public async deployNullifierRegistry(): Promise<NullifierRegistry> {
    return await new NullifierRegistry__factory(this._deployerSigner).deploy();
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
