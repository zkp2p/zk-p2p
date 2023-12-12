import { PaymentPlatform, PaymentPlatformType } from '../../contexts/common/PlatformSettings/types';

import venmoCopy from './venmo';
import hdfcCopy from './hdfc';


// Platform strings
export interface PlatformStrings {
  // Proof Form
  PROOF_FORM_TITLE_REGISTRATION_INSTRUCTIONS: string,

  // Mail Instructions
  SIGN_IN_WITH_GOOGLE_INSTRUCTIONS: string,
  NO_EMAILS_ERROR: string

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

export class PlatformStringProvider {
  private strings: PlatformStrings;

  constructor(platformType: PaymentPlatformType) {
    if (platformType === PaymentPlatform.VENMO) {
      this.strings = venmoCopy;
    } else if (platformType === PaymentPlatform.HDFC) {
      this.strings = hdfcCopy;
    } else {
      throw new Error('Invalid platform type');
    }
  }

  get(key: keyof PlatformStrings): string {
    return this.strings[key];
  }

  static getForPlatform(platformType: PaymentPlatformType, key: keyof PlatformStrings): string {
    let strings: PlatformStrings;
    if (platformType === PaymentPlatform.VENMO) {
      strings = venmoCopy;
    } else if (platformType === PaymentPlatform.HDFC) {
      strings = hdfcCopy;
    } else {
      throw new Error('Invalid platform type');
    }
    return strings[key];
  }
};
