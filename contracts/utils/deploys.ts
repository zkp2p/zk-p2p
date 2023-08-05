import { BigNumber, Signer } from "ethers";

import { Address } from "@utils/types";

import { Ramp, USDCMock, VenmoReceiveProcessorMock, VenmoReceiveVerifier, VenmoSendProcessorMock, VenmoSendVerifier} from "./contracts";
import { Ramp__factory } from "../typechain/factories/contracts";
import { USDCMock__factory, VenmoReceiveProcessorMock__factory, VenmoSendProcessorMock__factory } from "../typechain/factories/contracts/mocks";
import { VenmoReceiveVerifier__factory, VenmoSendVerifier__factory } from "../typechain/factories/contracts/verifiers";

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

  public async deployVenmoReceiveVerifier(): Promise<VenmoReceiveVerifier> {
    return await new VenmoReceiveVerifier__factory(this._deployerSigner).deploy();
  }

  public async deployVenmoSendVerifier(): Promise<VenmoSendVerifier> {
    return await new VenmoSendVerifier__factory(this._deployerSigner).deploy();
  }

  public async deployVenmoReceiveProcessorMock(): Promise<VenmoReceiveProcessorMock> {
    return await new VenmoReceiveProcessorMock__factory(this._deployerSigner).deploy();
  }

  public async deployVenmoSendProcessorMock(): Promise<VenmoSendProcessorMock> {
    return await new VenmoSendProcessorMock__factory(this._deployerSigner).deploy();
  }
}
