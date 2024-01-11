import { createContext } from 'react'


interface DenyListValues {
  hdfcDepositorDenyList: string[] | null;
  fetchHdfcDepositoryDenyList: () => Promise<string[] | null>;
};

const defaultValues: DenyListValues = {
  hdfcDepositorDenyList: null,
  fetchHdfcDepositoryDenyList: async () => null
};

const DenyListContext = createContext<DenyListValues>(defaultValues);

export default DenyListContext;
