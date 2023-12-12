import { PaymentPlatform, PaymentPlatformType } from '../../contexts/common/PlatformSettings/types';

import venmoCopy from './venmo';
import hdfcCopy from './hdfc';


// Platform strings
export interface PlatformStrings {
  // Proof Form
  PROOF_FORM_TITLE_REGISTRATION_INSTRUCTIONS: string,

  // Mail Instructions
  SIGN_IN_WITH_GOOGLE_INSTRUCTIONS: string,

  // New Registration
  REGISTRATION_INSTRUCTIONS: string,

  // On Ramp Instructions
  PROOF_FORM_TITLE_SEND_INSTRUCTIONS: string,

  // New Deposit
  NEW_DEPOSIT_INSTRUCTIONS: string,
  NEW_DEPOSIT_ID_TOOLTIP: string,
  NEW_DEPOSIT_AMOUNT_TOOLTIP: string,
  NEW_DEPOSIT_RECEIVE_TOOLTIP: string,

  // Instruction Drawer
  INSTRUCTION_DRAWER_STEP_ONE: string,
  INSTRUCTION_DRAWER_STEP_TWO: string,
  INSTRUCTION_DRAWER_STEP_THREE: string,
  INSTRUCTION_DRAWER_STEP_FOUR: string,

  // Payment Requirements
  PAYMENT_REQUIREMENT_STEP_ONE: string,
  PAYMENT_REQUIREMENT_STEP_TWO: string,
  PAYMENT_REQUIREMENT_STEP_THREE: string,
}

class PlatformStringProvider {
  private platformType: PaymentPlatformType;
  private strings: PlatformStrings;

  constructor(platformType: PaymentPlatformType) {
    this.platformType = platformType;
    if (platformType === PaymentPlatform.VENMO) {
      this.strings = venmoCopy;
    } else if (platformType === PaymentPlatform.HDFC) {
      this.strings = hdfcCopy;
    } else {
      throw new Error('Invalid platform type');
    }
  }

  getString(key: keyof PlatformStrings): string {
    return this.strings[key];
  }
}

export const venmoStrings = new PlatformStringProvider(PaymentPlatform.VENMO);
export const hdfcStrings = new PlatformStringProvider(PaymentPlatform.HDFC);


// Common strings