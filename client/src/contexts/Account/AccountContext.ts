import { createContext } from 'react'


interface AccountValues {
  ethereumAddress: string;
  network: string;
  rampAddress: string;
  usdcAddress: string;
}

const defaultValues: AccountValues = {
  ethereumAddress: '',
  network: '',
  rampAddress: '',
  usdcAddress: ''
};

const AccountContext = createContext<AccountValues>(defaultValues)

export default AccountContext
