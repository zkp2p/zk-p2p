import { createContext } from 'react'


interface ProofGenSettingsValues {
  isEmailModeAuth?: boolean;
  setIsEmailModeAuth?: React.Dispatch<React.SetStateAction<boolean>>;
  isProvingTypeFast?: boolean;
  setIsProvingTypeFast?: React.Dispatch<React.SetStateAction<boolean>>;
  isInputModeDrag?: boolean;
  setIsInputModeDrag?: React.Dispatch<React.SetStateAction<boolean>>;
  isAutoSelectEmailEnabled: boolean;
  setIsAutoSelectEmailEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProofGenSettingsContext = createContext<ProofGenSettingsValues>({
  isAutoSelectEmailEnabled: false,
  setIsAutoSelectEmailEnabled: () => {},
})

export default ProofGenSettingsContext
