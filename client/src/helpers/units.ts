export const toBigInt = (amount: string): bigint => {
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = (fraction + '000000').slice(0, 6);  // Pad or truncate fraction to 6 decimal places
  const integerRepresentation = whole + paddedFraction;
  return BigInt(integerRepresentation);
}

export const toUsdcString = (amount: bigint): string => {
  let amountStr = amount.toString();
  // Pad with leading zeros if necessary
  amountStr = amountStr.padStart(7, '0');

  // Insert decimal point 6 places from the right
  const wholePart = amountStr.slice(0, -6);
  let fractionalPart = amountStr.slice(-6);
  
  // Trim trailing zeros from the fractional part
  fractionalPart = fractionalPart.replace(/0+$/, '');

  // If all digits were zeros, ensure at least one zero remains
  if (fractionalPart.length === 0) {
    fractionalPart = '0';
  }

  return `${wholePart}.${fractionalPart}`;
}

export const toUsdString = (amount: bigint): string => {
  const usdcString = toUsdcString(amount);
  const parts = usdcString.split('.');
  
  // Check if there's a decimal part
  if (parts.length === 2) {
    let wholePart = parts[0];
    let decimalPart = parts[1].substring(0, 2);  // Take only the first two decimal places
    
    // Check if we need to round up
    if (parts[1].length > 2 && parts[1][2] >= '5') {
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
  }
  
  return usdcString;
}
