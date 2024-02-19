import { PaymentPlatform } from '@helpers/types';

import { PlatformStringProvider }  from './platform';
import { CommonStringProvider } from './common';

export { PlatformStringProvider as platformStrings } from './platform';
export const venmoStrings = new PlatformStringProvider(PaymentPlatform.VENMO);
export const hdfcStrings = new PlatformStringProvider(PaymentPlatform.HDFC);
// CHANGE TO HAVE GARANTI PASSED IN
export const garantiStrings = new PlatformStringProvider(PaymentPlatform.HDFC);
export const exportStrings = new PlatformStringProvider(PaymentPlatform.HDFC);
export const commonStrings = new CommonStringProvider();
