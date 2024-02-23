/**
 * Add opacity information to a hex color
 * @param amount opacity value from 0 to 100
 * @param hexColor
 */
export function opacify(amount: number, hexColor: string): string {
  if (!hexColor.startsWith('#')) {
    return hexColor;
  };

  if (hexColor.length !== 7) {
    throw new Error(`opacify: provided color ${hexColor} was not in hexadecimal format (e.g. #000000)`);
  };

  if (amount < 0 || amount > 100) {
    throw new Error('opacify: provided amount should be between 0 and 100');
  };

  const opacityHex = Math.round((amount / 100) * 255).toString(16);
  const opacifySuffix = opacityHex.length < 2 ? `0${opacityHex}` : opacityHex;

  return `${hexColor.slice(0, 7)}${opacifySuffix}`;
};

export const colors = {
  white: '#FFFFFF',
  black: '#000000',

  container: '#0D111C',

  buttonRed: '#DF2E2D',

  defaultBorderColor: '#98A1C03D',
  readOnlyBorderColor: '#98A1C03D',

  defaultInputColor: '#131A2A',
  readOnlyInputColor: '#101A2A',

  selectorColor: '#0D111C',
  selectorHover: '#1B1E29',
  selectorHoverBorder: 'rgba(255, 255, 255, 0.1)',
};
