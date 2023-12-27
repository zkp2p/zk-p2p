import { PaymentPlatformType, PaymentPlatform } from '../../../contexts/common/PlatformSettings/types';
import { RawEmailResponse} from '@hooks/useGmailClient';


export const searchEmailsForMatchingIntent = (emails: RawEmailResponse[], paymentPlatform: PaymentPlatformType, intentTimestamp: bigint, intentAmount: string) => {
  let dateTimeRegex;
  let amountRegex;

  switch (paymentPlatform) {
    case PaymentPlatform.VENMO:
      amountRegex = /You paid .* \$(\d+\.\d{2})/;
      dateTimeRegex = /(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d{1,2} \w{3} \d{4} \d{2}:\d{2}:\d{2} \+\d{4})/;
      break;

    case PaymentPlatform.HDFC:
      amountRegex = /Rs\.(\d+\.\d+)/;
      dateTimeRegex = /(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d{1,2} \w{3} \d{4} \d{2}:\d{2}:\d{2} \+\d{4})/;
      break;

    default:
      throw new Error(`Unknown payment platform: ${paymentPlatform}`);
  }

  return searchEmails(emails, dateTimeRegex, amountRegex, intentTimestamp, intentAmount);
};

const searchEmails = (emails: RawEmailResponse[], dateTimeRegex: RegExp, amountRegex: RegExp, intentTimestamp: bigint, intentAmount: string) => {
  for (let i = 0; i < emails.length; i++) {
    const emailContents = emails[i].decodedContents;

    const contentTimestamp = emailContents.match(dateTimeRegex);
    const contentTimestampExtracted = contentTimestamp ? contentTimestamp[1] : null;
    const contentTimestampConverted = contentTimestampExtracted ? convertToUnixTimestampBigInt(contentTimestampExtracted) : null;
    const contentTimestampIsAfterIntentTimestamp = contentTimestampConverted && intentTimestamp && contentTimestampConverted > intentTimestamp;

    const contentAmount = emailContents.match(amountRegex);
    const contentAmountFloat = contentAmount ? parseFloat(contentAmount[1]) : null;
    const intentAmountFloat = parseFloat(intentAmount);
    const contentAmountIsEqualIntentAmount = contentAmountFloat !== null && contentAmountFloat === intentAmountFloat;

    if (contentTimestampIsAfterIntentTimestamp && contentAmountIsEqualIntentAmount) {
      return i;
    }
  }

  return null;
};

const convertToUnixTimestampBigInt = (dateString: string): bigint => {
  const date = new Date(dateString);

  return BigInt(date.getTime() / 1000);
};