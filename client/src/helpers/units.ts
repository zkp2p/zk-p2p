import { PRECISION } from "@helpers/constants";


export const toBigInt = (amount: string): bigint => {
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = (fraction + '000000').slice(0, 6);  // Pad or truncate fraction to 6 decimal places
  const integerRepresentation = whole + paddedFraction;
  return BigInt(integerRepresentation);
};

export const toUsdcString = (amount: bigint, includeCommas: boolean = false): string => {
  let amountString = amount.toString();
  // Pad with leading zeros if necessary
  amountString = amountString.padStart(7, '0');

  // Insert decimal point 6 places from the right
  const wholePart = amountString.slice(0, -6);
  let fractionalPart = amountString.slice(-6);

  // Trim trailing zeros from the fractional part
  fractionalPart = fractionalPart.replace(/0+$/, '');

  // If all digits were zeros, ensure at least one zero remains
  if (fractionalPart.length === 0) {
    fractionalPart = '0';
  }

  if (includeCommas) {
    const formattedWholePart = new Intl.NumberFormat().format(parseInt(wholePart, 10));
    if (fractionalPart === '0') {
      return formattedWholePart;
    }

    let result = `${formattedWholePart}.${fractionalPart}`;
    result = result.replace(/^,/, '');

    return result;
  } else {
    let result = `${wholePart}.${fractionalPart}`;

    return parseFloat(result).toString();
  }
};

export const toUsdString = (amount: bigint): string => {
  const usdcString = toUsdcString(amount);
  const parts = usdcString.split('.');

  let wholePart = parts[0];
  let decimalPart = parts.length > 1 ? parts[1].substring(0, 2) : '00';

  // Check if we need to round up
  if (parts.length > 1 && parts[1].length > 2 && parts[1][2] >= '5') {
    const decimalAsNumber = parseInt(decimalPart, 10) + 1;

    // Check if rounding up caused a carry-over
    if (decimalAsNumber === 100) {
      decimalPart = '00';
      wholePart = (parseInt(wholePart, 10) + 1).toString();
    } else {
      decimalPart = decimalAsNumber.toString().padStart(2, '0');
    }
  }

  return `${wholePart}.${decimalPart}`;
};

export function conversionRateToPercentageString(rate: bigint, premiumForOffRamper: boolean = false): string {
  const scaledValue = rate * PRECISION;
  const reciprocal = (PRECISION * (10000n * PRECISION)) / scaledValue;

  const adjustedRate = Number(reciprocal - 10000n);
  const percentage = Math.abs(adjustedRate / 100);

  let percentageSign;
  if (premiumForOffRamper) {
    percentageSign = adjustedRate >= 0 ? "+" : "–";
  } else {
    percentageSign = adjustedRate >= 0 ? "–" : "+";
  }

  let percentageString = percentageSign + percentage.toFixed(2);
  percentageString = percentageString.replace(/\.00$|0$/, '');

  return percentageString + '%';
};

export function conversionRateToMultiplierString(rate: bigint): string {
  const scaledValue = BigInt(rate) * PRECISION;
  const reciprocal = (PRECISION * (10000n * PRECISION)) / scaledValue;

  const adjustedRate = Number(reciprocal - 10000n);
  const percentage = adjustedRate / 10000;

  const conversionRatio = 1 + percentage;

  let ratioString = conversionRatio.toFixed(3);
  ratioString = ratioString.replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1');

  return ratioString;
};
