import { createContext } from 'react'


interface AccountValues {
  ethereumAddress: string;
}

const defaultValues: AccountValues = {
  ethereumAddress: '',
};

const AccountContext = createContext<AccountValues>(defaultValues)

export default AccountContext
