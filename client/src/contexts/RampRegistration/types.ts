import { Deposit } from "../Deposits/types";

// struct AccountInfo {
//   bytes32 venmoIdHash;
//   uint256[] deposits;
// }
export interface AccountInfo {
  venmoIdHash: string;
  deposits: Deposit[];
}

// struct Intent {
//   address onramper;
//   uint256 deposit;
//   uint256 amount;
//   uint256 intentTimestamp;
// }
export interface Intent {
  onRamper: string;
  deposit: string;
  amount: number;
  timestamp: number;
}
