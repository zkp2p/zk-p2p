import { BigNumber, Signer, ethers } from "ethers";

import { Address } from "@utils/types";
import { usdc } from "@utils/common";

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
  VenmoSendProcessor,
  NullifierRegistry
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
import { NullifierRegistry__factory } from "../typechain/factories/contracts/processors/nullifierRegistries";
import { ONE_DAY_IN_SECONDS } from "./constants";

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
    maxOnRampAmount: BigNumber = usdc(999),
    intentExpirationPeriod: BigNumber = ONE_DAY_IN_SECONDS,
  ): Promise<Ramp> {
    return await new Ramp__factory(this._deployerSigner).deploy(
      owner,
      usdcToken,
      poseidon,
      minDepositAmount,
      maxOnRampAmount,
      intentExpirationPeriod
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

  public async deployVenmoReceiveProcessor(
    ramp: Address,
    keyHashAdapter: Address,
    nullifierRegistry: Address,
    emailFromAddress: string,
  ): Promise<VenmoReceiveProcessor> {
    return await new VenmoReceiveProcessor__factory(this._deployerSigner).deploy(
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
