import { Deposit } from '../../helpers/types';

export default interface AccountInfo {
  venmoIdHash: string;
  deposits: Deposit[];
}
