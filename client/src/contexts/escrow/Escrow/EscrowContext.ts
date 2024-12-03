import { createContext } from 'react'


interface EscrowValues {
  depositCounter: bigint | null;
  refetchDepositCounter: (() => void) | null;
  shouldFetchEscrowState: boolean;
}

const defaultValues: EscrowValues = {
  depositCounter: null,
  refetchDepositCounter: null,
  shouldFetchEscrowState: false
};

const EscrowContext = createContext<EscrowValues>(defaultValues)

export default EscrowContext  
