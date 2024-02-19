import { createContext } from 'react'


interface DenyListValues {
  hdfcDepositorDenyList: string[] | null;
  fetchHdfcDepositoryDenyList: () => Promise<string[] | null>;
  garantiDepositorDenyList: string[] | null;
  fetchGarantiDepositoryDenyList: () => Promise<string[] | null>;
};

const defaultValues: DenyListValues = {
  hdfcDepositorDenyList: null,
  fetchHdfcDepositoryDenyList: async () => null,
  garantiDepositorDenyList: null,
  fetchGarantiDepositoryDenyList: async () => null
};

const DenyListContext = createContext<DenyListValues>(defaultValues);

export default DenyListContext;
