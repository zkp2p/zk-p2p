import { createContext } from 'react'


interface ProofGenSettingsValues {
  isProvingTypeFast?: boolean;
  isInputModeDrag?: boolean;
  setIsProvingTypeFast?: React.Dispatch<React.SetStateAction<boolean>>;
  setIsInputModeDrag?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProofGenSettingsContext = createContext<ProofGenSettingsValues>({})

export default ProofGenSettingsContext
