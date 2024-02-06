export const formatAddress = (address: string | undefined): string => {
  if (!address || address.length < 9) {
    return address || '';
  }
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const formatAddressLong = (address: string | undefined): string => {
  if (!address || address.length < 9) {
    return address || '';
  }
  return `${address.substring(0, 12)}...${address.substring(address.length - 10)}`;
};