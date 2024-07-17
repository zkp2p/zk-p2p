import { BigNumber, Signer, ethers } from "ethers";

import { Address } from "@utils/types";

import {
  AddressAllowListMock,
  ClaimVerifier,
  EventRegistry,
  EventRegistryMock,
  NullifierRegistry,
  SwapTicketExchange,
  TMTimestampParsingMock,
  TransferTicketProcessor,
  TransferTicketProcessorMock,
  USDCMock,
  VerifyTicketProcessorMock,
  VerifiedTicketRegistry,
  VerifyTicketProcessor,
} from "./contracts";

import {
  EventRegistry__factory,
  SwapTicketExchange__factory,
  VerifiedTicketRegistry__factory,
  VerifyTicketProcessor__factory,
  TransferTicketProcessor__factory
} from "../typechain/factories/contracts/";
import {
  EventRegistryMock__factory,
  TransferTicketProcessorMock__factory,
  USDCMock__factory,
  VerifyTicketProcessorMock__factory,
} from "../typechain/factories/contracts/mocks";
import {
  AddressAllowListMock__factory,
  TMTimestampParsingMock__factory,
} from "../typechain/factories/contracts/mocks/lib";
import {
  ClaimVerifier__factory,
} from "../typechain/factories/contracts/lib/processors";
import {
  NullifierRegistry__factory,
} from "../typechain/factories/contracts/external";
import { ONE_DAY_IN_SECONDS } from "./constants";

export default class DeployHelper {
  private _deployerSigner: Signer;

  constructor(deployerSigner: Signer) {
    this._deployerSigner = deployerSigner;
  }

  // System Contracts
  public async deployVerifiedTicketRegistry(owner: Address): Promise<VerifiedTicketRegistry> {
    return await new VerifiedTicketRegistry__factory(this._deployerSigner).deploy(owner);
  }

  public async deploySwapTicketExchange(
    owner: Address,
    feeRecipient: Address,
    usdc: Address,
    ticketRegistry: Address,
    eventRegistry: Address,
    fee: BigNumber,
    allowedUsers: Address[] = [],
    orderSettlementPeriod: BigNumber = ONE_DAY_IN_SECONDS,
    refundSettlementPeriod: BigNumber = ONE_DAY_IN_SECONDS,
  ): Promise<SwapTicketExchange> {
    return await new SwapTicketExchange__factory(this._deployerSigner).deploy(
      owner,
      feeRecipient,
      usdc,
      ticketRegistry,
      eventRegistry,
      fee,
      orderSettlementPeriod,
      refundSettlementPeriod,
      allowedUsers,
    );
  }

  public async deployClaimVerifier(): Promise<ClaimVerifier> {
    return await new ClaimVerifier__factory(this._deployerSigner).deploy();
  }

  public async deployVerifyTicketProcessor(
    ticketRegistry: Address,
    nullifierRegistry: Address
  ): Promise<VerifyTicketProcessor> {
    return await new VerifyTicketProcessor__factory(this._deployerSigner).deploy(
      ticketRegistry,
      nullifierRegistry
    );
  }

  public async deployTransferTicketProcessor(
    ticketRegistry: Address,
    nullifierRegistry: Address
  ): Promise<TransferTicketProcessor> {
    return await new TransferTicketProcessor__factory(this._deployerSigner).deploy(
      ticketRegistry,
      nullifierRegistry
    );
  }

  public async deployEventRegistry(ticketRegistry: Address): Promise<EventRegistry> {
    return await new EventRegistry__factory(this._deployerSigner).deploy(ticketRegistry);
  }

  public async deployNullifierRegistry(): Promise<NullifierRegistry> {
    return await new NullifierRegistry__factory(this._deployerSigner).deploy();
  }

  // Mocks
  public async deployUSDCMock(mintAmount: BigNumber, name: string, symbol: string): Promise<USDCMock> {
    return await new USDCMock__factory(this._deployerSigner).deploy(mintAmount.toString(), name, symbol);
  }

  public async deployTMTimestampParsingMock(): Promise<TMTimestampParsingMock> {
    return await new TMTimestampParsingMock__factory(this._deployerSigner).deploy();
  }

  public async deployVerifyTicketProcessorMock(): Promise<VerifyTicketProcessorMock> {
    return await new VerifyTicketProcessorMock__factory(this._deployerSigner).deploy();
  }

  public async deployTransferTicketProcessorMock(): Promise<TransferTicketProcessorMock> {
    return await new TransferTicketProcessorMock__factory(this._deployerSigner).deploy();
  }

  public async deployEventRegistryMock(): Promise<EventRegistryMock> {
    return await new EventRegistryMock__factory(this._deployerSigner).deploy();
  }

  public async deployAddressAllowListMock(allowedUsers: Address[]): Promise<AddressAllowListMock> {
    return await new AddressAllowListMock__factory(this._deployerSigner).deploy(allowedUsers);
  }
}
