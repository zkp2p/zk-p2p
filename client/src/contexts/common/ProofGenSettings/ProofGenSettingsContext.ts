import { createContext } from 'react'


interface ProofGenSettingsValues {
  isEmailModeAuth?: boolean;
  isProvingTypeFast?: boolean;
  isInputModeDrag?: boolean;
  setIsEmailModeAuth?: React.Dispatch<React.SetStateAction<boolean>>;
  setIsProvingTypeFast?: React.Dispatch<React.SetStateAction<boolean>>;
  setIsInputModeDrag?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProofGenSettingsContext = createContext<ProofGenSettingsValues>({})

export default ProofGenSettingsContext
