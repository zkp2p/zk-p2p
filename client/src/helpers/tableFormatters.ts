import { OnRampOrder } from "./types";

export const formatAmountsForUSDC = (tokenAmount: number) => {
  const adjustedAmount = tokenAmount / (10 ** 6);
  return adjustedAmount;
};

export const getOrderStatusString = (order: OnRampOrder) => {
  switch (Number(order.status)) {
    case 1:
      return "Open";
    case 2:
      return "Filled";
    case 3:
      return "Cancelled";
    default:
      return "The order has an invalid status.";
  }
}
