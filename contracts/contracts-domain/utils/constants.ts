import { BigNumber, constants } from "ethers";

export const ADDRESS_ZERO = constants.AddressZero;
export const ZERO = constants.Zero;
export const ONE = constants.One;
export const ONE_DAY_IN_SECONDS = BigNumber.from(86400);
export const THREE_MINUTES_IN_SECONDS = BigNumber.from(180);
export const ZERO_BYTES32 = constants.HashZero;
export const MAX_UINT_256 = BigNumber.from(2).pow(BigNumber.from(256)).sub(1);
export const PRECISE_UNIT = BigNumber.from(10).pow(18);