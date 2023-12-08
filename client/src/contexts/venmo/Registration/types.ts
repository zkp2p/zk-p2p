import { Deposit } from "../Deposits/types";

// struct AccountInfo {
//   bytes32 venmoIdHash;
//   uint256[] deposits;
// }
export interface AccountInfo {
  venmoIdHash: string;
  deposits: Deposit[];
}
