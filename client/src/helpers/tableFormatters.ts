export const formatAmountsForUSDC = (tokenAmount: number) => {
  const adjustedAmount = tokenAmount / (10 ** 6);
  return adjustedAmount;
};
