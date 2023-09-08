import { createContext } from 'react'
import { Address } from 'wagmi';

import { ZERO_ADDRESS } from '../../helpers/constants'


interface AccountValues {
  isLoggedIn: boolean;
  loggedInEthereumAddress: Address;
  network: string;
}

const defaultValues: AccountValues = {
  isLoggedIn: false,
  loggedInEthereumAddress: ZERO_ADDRESS,
  network: '',
};

const AccountContext = createContext<AccountValues>(defaultValues)

export default AccountContext
