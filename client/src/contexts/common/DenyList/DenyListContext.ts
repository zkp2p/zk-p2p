import { createContext } from 'react'


interface DenyListValues {
  hdfcDepositorDenyList: string[] | null;
  fetchHdfcDepositoryDenyList: (() => void) | null;
};

const defaultValues: DenyListValues = {
  hdfcDepositorDenyList: null,
  fetchHdfcDepositoryDenyList: null
};

const DenyListContext = createContext<DenyListValues>(defaultValues);

export default DenyListContext;
