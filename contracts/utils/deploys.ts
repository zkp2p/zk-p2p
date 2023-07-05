import { BigNumber, Signer } from "ethers";

import { Address } from "@utils/types";

import { Ramp, USDCMock } from "./contracts";
import { Ramp__factory } from "../typechain/factories/contracts";
import { USDCMock__factory } from "../typechain/factories/contracts/mocks";

export default class DeployHelper {
  private _deployerSigner: Signer;

  constructor(deployerSigner: Signer) {
    this._deployerSigner = deployerSigner;
  }

  public async deployRamp(owner: Address, usdc: Address): Promise<Ramp> {
    return await new Ramp__factory(this._deployerSigner).deploy(owner, usdc);
  }

  public async deployUSDCMock(mintAmount: BigNumber, name: string, symbol: string): Promise<USDCMock> {
    return await new USDCMock__factory(this._deployerSigner).deploy(mintAmount.toString(), name, symbol);
  }
}
