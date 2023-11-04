import { BigNumber, Signer, ethers } from "ethers";

import { Address } from "@utils/types";

const circom = require("circomlibjs");

import {
  HDFCRamp,
  HDFCRegistrationProcessorMock,
  HDFCRegistrationProcessor,
  HDFCSendProcessorMock,
  HDFCSendProcessor,
  ManagedKeyHashAdapter,
  ManagedKeyHashAdapterV2,
  NullifierRegistry,
  Ramp,
  StringConversionUtilsMock,
  USDCMock,
  VenmoRegistrationProcessor,
  VenmoRegistrationProcessorMock,
  VenmoSendProcessorMock,
  VenmoSendProcessor,
} from "./contracts";
import { HDFCRamp__factory, Ramp__factory } from "../typechain/factories/contracts";
import {
  HDFCRegistrationProcessorMock__factory,
  HDFCSendProcessorMock__factory,
  StringConversionUtilsMock__factory,
  USDCMock__factory,
  VenmoRegistrationProcessorMock__factory,
  VenmoSendProcessorMock__factory
} from "../typechain/factories/contracts/mocks";
import {
  HDFCRegistrationProcessor__factory,
  HDFCSendProcessor__factory,
  VenmoRegistrationProcessor__factory,
  VenmoSendProcessor__factory
} from "../typechain/factories/contracts/processors";
import { ManagedKeyHashAdapter__factory } from "../typechain/factories/contracts/processors/keyHashAdapters";
import { ManagedKeyHashAdapterV2__factory } from "../typechain/factories/contracts/processors/keyHashAdapters";
import { NullifierRegistry__factory } from "../typechain/factories/contracts/processors/nullifierRegistries";

export default class DeployHelper {
  private _deployerSigner: Signer;

  constructor(deployerSigner: Signer) {
    this._deployerSigner = deployerSigner;
  }

  public async deployUSDCMock(mintAmount: BigNumber, name: string, symbol: string): Promise<USDCMock> {
    return await new USDCMock__factory(this._deployerSigner).deploy(mintAmount.toString(), name, symbol);
  }

  // Venmo Contracts
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

  // HDFC Contracts
  public async deployHDFCRamp(
    owner: Address,
    usdcToken: Address,
    poseidon3: Address,
    poseidon6: Address,
    minDepositAmount: BigNumber,
    maxOnRampAmount: BigNumber,
    intentExpirationPeriod: BigNumber,
    onRampCoolDownPeriod: BigNumber,
    sustainabilityFee: BigNumber,
    sustainabilityFeeRecipient: Address,
  ): Promise<HDFCRamp> {
    return await new HDFCRamp__factory(this._deployerSigner).deploy(
      owner,
      usdcToken,
      poseidon3,
      poseidon6,
      minDepositAmount,
      maxOnRampAmount,
      intentExpirationPeriod,
      onRampCoolDownPeriod,
      sustainabilityFee,
      sustainabilityFeeRecipient
    );
  }

  public async deployHDFCRegistrationProcessor(
    ramp: Address,
    keyHashAdapter: Address,
    nullifierRegistry: Address,
    emailFromAddress: string,
  ): Promise<HDFCRegistrationProcessor> {
    return await new HDFCRegistrationProcessor__factory(this._deployerSigner).deploy(
      ramp,
      keyHashAdapter,
      nullifierRegistry,
      emailFromAddress
    );
  }

  public async deployHDFCSendProcessor(
    ramp: Address,
    keyHashAdapter: Address,
    nullifierRegistry: Address,
    emailFromAddress: string,
  ): Promise<HDFCSendProcessor> {
    return await new HDFCSendProcessor__factory(this._deployerSigner).deploy(
      ramp,
      keyHashAdapter,
      nullifierRegistry,
      emailFromAddress
    );
  }

  public async deployManagedKeyHashAdapter(venmoKeyHash: string): Promise<ManagedKeyHashAdapter> {
    return await new ManagedKeyHashAdapter__factory(this._deployerSigner).deploy(venmoKeyHash);
  }

  public async deployManagedKeyHashAdapterV2(keyHashes: string[]): Promise<ManagedKeyHashAdapterV2> {
    return await new ManagedKeyHashAdapterV2__factory(this._deployerSigner).deploy(keyHashes);
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

  public async deployHDFCSendProcessorMock(): Promise<HDFCSendProcessorMock> {
    return await new HDFCSendProcessorMock__factory(this._deployerSigner).deploy();
  }

  public async deployHDFCRegistrationProcessorMock(): Promise<HDFCRegistrationProcessorMock> {
    return await new HDFCRegistrationProcessorMock__factory(this._deployerSigner).deploy();
  }

  public async deployPoseidon3(): Promise<any> {
    const contract = new ethers.ContractFactory(
      circom.poseidonContract.generateABI(3),
      circom.poseidonContract.createCode(3),
      this._deployerSigner
    );

    return await contract.deploy();
  }

  public async deployPoseidon6(): Promise<any> {
    const contract = new ethers.ContractFactory(
      circom.poseidonContract.generateABI(6),
      circom.poseidonContract.createCode(6),
      this._deployerSigner
    );

    return await contract.deploy();
  };

  public async deployStringConversionUtilsMock(): Promise<StringConversionUtilsMock> {
    return await new StringConversionUtilsMock__factory(this._deployerSigner).deploy();
  }
}
