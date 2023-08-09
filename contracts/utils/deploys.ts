import { BigNumber, Signer } from "ethers";

import { Address } from "@utils/types";

import { Ramp, USDCMock, VenmoReceiveProcessorMock, VenmoReceiveProcessor, VenmoSendProcessorMock, VenmoSendProcessor} from "./contracts";
import { Ramp__factory } from "../typechain/factories/contracts";
import { USDCMock__factory, VenmoReceiveProcessorMock__factory, VenmoSendProcessorMock__factory } from "../typechain/factories/contracts/mocks";
import { VenmoReceiveProcessor__factory, VenmoSendProcessor__factory } from "../typechain/factories/contracts/processors";

export default class DeployHelper {
  private _deployerSigner: Signer;

  constructor(deployerSigner: Signer) {
    this._deployerSigner = deployerSigner;
  }

  public async deployRamp(
    owner: Address,
    usdc: Address,
    receiveVerifier: Address,
    sendVerifier: Address
  ): Promise<Ramp> {
    return await new Ramp__factory(this._deployerSigner).deploy(owner, usdc, receiveVerifier, sendVerifier);
  }

  public async deployUSDCMock(mintAmount: BigNumber, name: string, symbol: string): Promise<USDCMock> {
    return await new USDCMock__factory(this._deployerSigner).deploy(mintAmount.toString(), name, symbol);
  }

  public async deployVenmoReceiveProcessor(
    venmoKeys: BigNumber[],
    emailFromAddress: string,
  ): Promise<VenmoReceiveProcessor> {
    return await new VenmoReceiveProcessor__factory(this._deployerSigner).deploy(venmoKeys, emailFromAddress);
  }

  public async deployVenmoSendProcessor(
    venmoKeys: BigNumber[],
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
}
