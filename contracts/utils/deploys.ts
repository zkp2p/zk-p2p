import { BigNumber, Signer, ethers } from "ethers";

import { Address, TLSParams } from "@utils/types";

const circom = require("circomlibjs");

import {
  GarantiBodyHashVerifier,
  GarantiRamp,
  GarantiRegistrationProcessor,
  GarantiRegistrationProcessorMock,
  GarantiSendProcessor,
  GarantiSendProcessorMock,
  HDFCRamp,
  HDFCRegistrationProcessorMock,
  HDFCRegistrationProcessor,
  HDFCSendProcessorMock,
  HDFCSendProcessor,
  HDFCTimestampParsingMock,
  ManagedKeyHashAdapter,
  ManagedKeyHashAdapterV2,
  NullifierRegistry,
  Ramp,
  VenmoRampV2,
  StringConversionUtilsMock,
  USDCMock,
  VenmoRegistrationProcessor,
  VenmoRegistrationProcessorMock,
  VenmoRegistrationProcessorV2,
  VenmoSendProcessorMock,
  VenmoSendProcessor,
  VenmoSendProcessorV2,
  WiseAccountRegistrationProcessor,
  WiseAccountRegistrationProcessorMock,
  WiseAccountRegistry,
  WiseOffRamperRegistrationProcessor,
  WiseOffRamperRegistrationProcessorMock,
  WiseRamp,
  WiseSendProcessor,
  WiseSendProcessorMock,
} from "./contracts";
import {
  GarantiRamp__factory,
  GarantiRegistrationProcessor__factory,
  GarantiSendProcessor__factory,
  mocks as garantiMocks
} from "../typechain/factories/contracts/ramps/garanti";
import {
  Groth16Verifier__factory as GarantiBodyHashVerifier__factory,
} from "../typechain/factories/contracts/verifiers/garanti_body_suffix_hasher_verifier.sol";
import {
  HDFCRamp__factory,
  HDFCRegistrationProcessor__factory,
  HDFCSendProcessor__factory,
  mocks as hdfcMocks
} from "../typechain/factories/contracts/ramps/hdfc";
import {
  Ramp__factory,
  VenmoRegistrationProcessor__factory,
  VenmoSendProcessor__factory,
  mocks as venmoMocks
} from "../typechain/factories/contracts/ramps/venmo-v1";
import {
  VenmoRampV2__factory,
  VenmoRegistrationProcessorV2__factory,
  VenmoSendProcessorV2__factory,
} from "../typechain/factories/contracts/ramps/venmo-v2";
import {
  WiseRamp__factory,
  WiseAccountRegistrationProcessor__factory,
  WiseAccountRegistry__factory,
  WiseOffRamperRegistrationProcessor__factory,
  WiseSendProcessor__factory,
  mocks as wiseMocks
} from "../typechain/factories/contracts/ramps/wise";
import {
  StringConversionUtilsMock__factory,
  USDCMock__factory,
} from "../typechain/factories/contracts/mocks";
import {
  ManagedKeyHashAdapter__factory,
  ManagedKeyHashAdapterV2__factory
} from "../typechain/factories/contracts/processors/keyHashAdapters";
import { NullifierRegistry__factory } from "../typechain/factories/contracts/processors/nullifierRegistries";

export default class DeployHelper {
  private _deployerSigner: Signer;

  constructor(deployerSigner: Signer) {
    this._deployerSigner = deployerSigner;
  }

  public async deployUSDCMock(mintAmount: BigNumber, name: string, symbol: string): Promise<USDCMock> {
    return await new USDCMock__factory(this._deployerSigner).deploy(mintAmount.toString(), name, symbol);
  }

  // Venmo-V1 Contracts
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

  // Venmo-V2 Contracts
  public async deployVenmoRampV2(
    owner: Address,
    ramp: Address,
    usdcToken: Address,
    poseidon: Address,
    minDepositAmount: BigNumber,
    maxOnRampAmount: BigNumber,
    intentExpirationPeriod: BigNumber,
    onRampCoolDownPeriod: BigNumber,
    sustainabilityFee: BigNumber,
    sustainabilityFeeRecipient: Address,
  ): Promise<VenmoRampV2> {
    return await new VenmoRampV2__factory(this._deployerSigner).deploy(
      owner,
      ramp,
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

  public async deployVenmoRegistrationProcessorV2(
    ramp: Address,
    keyHashAdapter: Address,
    nullifierRegistry: Address,
    emailFromAddress: string,
    timestampBuffer: BigNumber = BigNumber.from(30),
  ): Promise<VenmoRegistrationProcessorV2> {
    return await new VenmoRegistrationProcessorV2__factory(this._deployerSigner).deploy(
      ramp,
      keyHashAdapter,
      nullifierRegistry,
      emailFromAddress,
      timestampBuffer
    );
  }

  public async deployVenmoSendProcessorV2(
    ramp: Address,
    keyHashAdapter: Address,
    nullifierRegistry: Address,
    emailFromAddress: string,
    timestampBuffer: BigNumber = BigNumber.from(30),
  ): Promise<VenmoSendProcessorV2> {
    return await new VenmoSendProcessorV2__factory(this._deployerSigner).deploy(
      ramp,
      keyHashAdapter,
      nullifierRegistry,
      emailFromAddress,
      timestampBuffer
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
    timestampBuffer: BigNumber = BigNumber.from(30),
  ): Promise<HDFCRegistrationProcessor> {
    return await new HDFCRegistrationProcessor__factory(this._deployerSigner).deploy(
      ramp,
      keyHashAdapter,
      nullifierRegistry,
      emailFromAddress,
      timestampBuffer
    );
  }

  public async deployHDFCSendProcessor(
    ramp: Address,
    keyHashAdapter: Address,
    nullifierRegistry: Address,
    emailFromAddress: string,
    timestampBuffer: BigNumber = BigNumber.from(30),
  ): Promise<HDFCSendProcessor> {
    return await new HDFCSendProcessor__factory(this._deployerSigner).deploy(
      ramp,
      keyHashAdapter,
      nullifierRegistry,
      emailFromAddress,
      timestampBuffer
    );
  }

  // Garanti Contracts
  public async deployGarantiRamp(
    owner: Address,
    usdcToken: Address,
    minDepositAmount: BigNumber,
    maxOnRampAmount: BigNumber,
    intentExpirationPeriod: BigNumber,
    onRampCoolDownPeriod: BigNumber,
    sustainabilityFee: BigNumber,
    sustainabilityFeeRecipient: Address,
  ): Promise<GarantiRamp> {
    return await new GarantiRamp__factory(this._deployerSigner).deploy(
      owner,
      usdcToken,
      minDepositAmount,
      maxOnRampAmount,
      intentExpirationPeriod,
      onRampCoolDownPeriod,
      sustainabilityFee,
      sustainabilityFeeRecipient
    );
  }

  public async deployGarantiRegistrationProcessor(
    ramp: Address,
    keyHashAdapter: Address,
    nullifierRegistry: Address,
    bodyHashVerifier: Address,
    emailFromAddress: string,
    timestampBuffer: BigNumber = BigNumber.from(30),
  ): Promise<GarantiRegistrationProcessor> {
    return await new GarantiRegistrationProcessor__factory(this._deployerSigner).deploy(
      ramp,
      keyHashAdapter,
      nullifierRegistry,
      bodyHashVerifier,
      emailFromAddress,
      timestampBuffer
    );
  }

  public async deployGarantiSendProcessor(
    ramp: Address,
    keyHashAdapter: Address,
    nullifierRegistry: Address,
    bodyHashVerifier: Address,
    emailFromAddress: string,
    timestampBuffer: BigNumber = BigNumber.from(30),
  ): Promise<GarantiSendProcessor> {
    return await new GarantiSendProcessor__factory(this._deployerSigner).deploy(
      ramp,
      keyHashAdapter,
      nullifierRegistry,
      bodyHashVerifier,
      emailFromAddress,
      timestampBuffer
    );
  }

  public async deployGarantiBodyHashVerifier(): Promise<GarantiBodyHashVerifier> {
    return await new GarantiBodyHashVerifier__factory(this._deployerSigner).deploy();
  }

  // Wise Contracts
  public async deployWiseRamp(
    owner: Address,
    usdcToken: Address,
    minDepositAmount: BigNumber,
    maxOnRampAmount: BigNumber,
    intentExpirationPeriod: BigNumber,
    onRampCoolDownPeriod: BigNumber,
    sustainabilityFee: BigNumber,
    sustainabilityFeeRecipient: Address,
  ): Promise<WiseRamp> {
    return await new WiseRamp__factory(this._deployerSigner).deploy(
      owner,
      usdcToken,
      minDepositAmount,
      maxOnRampAmount,
      intentExpirationPeriod,
      onRampCoolDownPeriod,
      sustainabilityFee,
      sustainabilityFeeRecipient
    );
  }

  // Wise Contracts
  public async deployWiseAccountRegistry(
    owner: Address,
  ): Promise<WiseAccountRegistry> {
    return await new WiseAccountRegistry__factory(this._deployerSigner).deploy(
      owner
    );
  }

  public async deployWiseAccountRegistrationProcessor(
    ramp: Address,
    verifierSigningKey: Address,
    nullifierRegistry: Address,
    endpoint: string,
    host: string,
    timestampBuffer: BigNumber = BigNumber.from(30),
  ): Promise<WiseAccountRegistrationProcessor> {
    return await new WiseAccountRegistrationProcessor__factory(this._deployerSigner).deploy(
      ramp,
      verifierSigningKey,
      nullifierRegistry,
      timestampBuffer,
      endpoint,
      host
    );
  }

  public async deployWiseOffRamperRegistrationProcessor(
    ramp: Address,
    verifierSigningKey: Address,
    nullifierRegistry: Address,
    endpoint: string,
    host: string,
    timestampBuffer: BigNumber = BigNumber.from(30),
  ): Promise<WiseOffRamperRegistrationProcessor> {
    return await new WiseOffRamperRegistrationProcessor__factory(this._deployerSigner).deploy(
      ramp,
      verifierSigningKey,
      nullifierRegistry,
      timestampBuffer,
      endpoint,
      host
    );
  }

  public async deployWiseSendProcessor(
    ramp: Address,
    nullifierRegistry: Address,
    endpoint: string,
    host: string,
    timestampBuffer: BigNumber = BigNumber.from(30),
  ): Promise<WiseSendProcessor> {
    return await new WiseSendProcessor__factory(this._deployerSigner).deploy(
      ramp,
      nullifierRegistry,
      timestampBuffer,
      endpoint,
      host
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
    return await new venmoMocks.VenmoSendProcessorMock__factory(this._deployerSigner).deploy();
  }

  public async deployVenmoRegistrationProcessorMock(): Promise<VenmoRegistrationProcessorMock> {
    return await new venmoMocks.VenmoRegistrationProcessorMock__factory(this._deployerSigner).deploy();
  }

  public async deployHDFCSendProcessorMock(): Promise<HDFCSendProcessorMock> {
    return await new hdfcMocks.HDFCSendProcessorMock__factory(this._deployerSigner).deploy();
  }

  public async deployHDFCRegistrationProcessorMock(): Promise<HDFCRegistrationProcessorMock> {
    return await new hdfcMocks.HDFCRegistrationProcessorMock__factory(this._deployerSigner).deploy();
  }

  public async deployHDFCTimestampParsingMock(): Promise<HDFCTimestampParsingMock> {
    return await new hdfcMocks.HDFCTimestampParsingMock__factory(this._deployerSigner).deploy();
  }   

  public async deployGarantiSendProcessorMock(): Promise<GarantiSendProcessorMock> {
    return await new garantiMocks.GarantiSendProcessorMock__factory(this._deployerSigner).deploy();
  }

  public async deployGarantiRegistrationProcessorMock(): Promise<GarantiRegistrationProcessorMock> {
    return await new garantiMocks.GarantiRegistrationProcessorMock__factory(this._deployerSigner).deploy();
  }
  public async deployWiseSendProcessorMock(): Promise<WiseSendProcessorMock> {
    return await new wiseMocks.WiseSendProcessorMock__factory(this._deployerSigner).deploy();
  }

  public async deployWiseAccountRegistrationProcessorMock(): Promise<WiseAccountRegistrationProcessorMock> {
    return await new wiseMocks.WiseAccountRegistrationProcessorMock__factory(this._deployerSigner).deploy();
  }
  public async deployWiseOffRamperRegistrationProcessorMock(): Promise<WiseOffRamperRegistrationProcessorMock> {
    return await new wiseMocks.WiseOffRamperRegistrationProcessorMock__factory(this._deployerSigner).deploy();
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
