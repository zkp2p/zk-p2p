import { BigNumber, Signer, ethers } from "ethers";

import { Address } from "@utils/types";

import {
  ClaimVerifier,
  NullifierRegistry,
  DomainExchange,
  TransferDomainProcessor,
  TransferDomainProcessorMock,
  USDCMock,
  VerifyDomainProcessorMock,
  VerifyDomainProcessor,
  VerifiedDomainRegistry,
  DomainExchangeMock,
  ManagedKeyHashAdapterV2
} from "./contracts";

import {
  DomainExchange__factory,
  VerifyDomainProcessor__factory,
  TransferDomainProcessor__factory,
  VerifiedDomainRegistry__factory
} from "../typechain/factories/contracts/";
import {
  TransferDomainProcessorMock__factory,
  USDCMock__factory,
  VerifyDomainProcessorMock__factory,
  DomainExchangeMock__factory
} from "../typechain/factories/contracts/mocks";
import {
  ClaimVerifier__factory,
} from "../typechain/factories/contracts/external";
import {
  NullifierRegistry__factory,
  ManagedKeyHashAdapterV2__factory
} from "../typechain/factories/contracts/external";
import { ONE_DAY_IN_SECONDS } from "./constants";

export default class DeployHelper {
  private _deployerSigner: Signer;

  constructor(deployerSigner: Signer) {
    this._deployerSigner = deployerSigner;
  }

  // System Contracts
  public async deployDomainExchange(
    owner: Address,
    fee: BigNumber,
    feeRecipient: Address,
    minBidActivePeriod: BigNumber,
    bidRefundPeriod: BigNumber,
    allowedAddresses: Address[]
  ): Promise<DomainExchange> {
    return await new DomainExchange__factory(this._deployerSigner).deploy(
      owner,
      fee,
      feeRecipient,
      minBidActivePeriod,
      bidRefundPeriod,
      allowedAddresses
    );
  }

  public async deployVerifyDomainProcessor(
    exchange: Address,
    nullifierRegistry: Address,
    providerHashes: string[],
    claimVerifierLibraryName: string,
    claimVerifierLibraryAddress: Address
  ): Promise<VerifyDomainProcessor> {
    return await new VerifyDomainProcessor__factory(
      // @ts-ignore
      {
        [claimVerifierLibraryName]: claimVerifierLibraryAddress,
      },
      this._deployerSigner
    ).deploy(
      exchange,
      nullifierRegistry,
      providerHashes
    );
  }

  public async deployTransferDomainProcessor(
    exchange: Address,
    nullifierRegistry: Address,
    emailFromAddress: string,
    timestampBuffer: BigNumber = BigNumber.from(30)
  ): Promise<TransferDomainProcessor> {
    return await new TransferDomainProcessor__factory(this._deployerSigner).deploy(
      exchange,
      nullifierRegistry,
      emailFromAddress,
      timestampBuffer
    );
  }

  public async deployVerifiedDomainRegistry(): Promise<VerifiedDomainRegistry> {
    return await new VerifiedDomainRegistry__factory(this._deployerSigner).deploy();
  }

  public async deployNullifierRegistry(): Promise<NullifierRegistry> {
    return await new NullifierRegistry__factory(this._deployerSigner).deploy();
  }

  public async deployManagedKeyHashAdapterV2(keyHashes: string[]): Promise<ManagedKeyHashAdapterV2> {
    return await new ManagedKeyHashAdapterV2__factory(this._deployerSigner).deploy(keyHashes);
  }

  // Mocks
  public async deployUSDCMock(mintAmount: BigNumber, name: string, symbol: string): Promise<USDCMock> {
    return await new USDCMock__factory(this._deployerSigner).deploy(mintAmount.toString(), name, symbol);
  }

  public async deployVerifyDomainProcessorMock(): Promise<VerifyDomainProcessorMock> {
    return await new VerifyDomainProcessorMock__factory(this._deployerSigner).deploy();
  }

  public async deployTransferDomainProcessorMock(): Promise<TransferDomainProcessorMock> {
    return await new TransferDomainProcessorMock__factory(this._deployerSigner).deploy();
  }

  public async deployDomainExchangeMock(verifiedDomainRegistry: Address): Promise<DomainExchangeMock> {
    return await new DomainExchangeMock__factory(this._deployerSigner).deploy(verifiedDomainRegistry);
  }

  //Libraries
  public async deployClaimVerifier(): Promise<ClaimVerifier> {
    return await new ClaimVerifier__factory(this._deployerSigner).deploy();
  }
}
