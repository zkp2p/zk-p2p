export const formatAddress = (address: string | undefined): string => {
  if (!address || address.length < 9) {
    return address || '';
  }
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};
