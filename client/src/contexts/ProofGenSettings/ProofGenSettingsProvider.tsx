import React, { useEffect, useState, ReactNode } from 'react'

import ProofGenSettingsContext from './ProofGenSettingsContext'


interface ProvidersProps {
  children: ReactNode;
}

/*
 * Example with loading: https://github.com/upmostly/react-context-example/blob/master/src/Contexts/PostProvider.js
 */

const ProofGenSettingsProvider = ({ children }: ProvidersProps) => {
  /*
   * State
   */
  
  const storedProvingTypeSetting = localStorage.getItem('isProvingTypeRemote');
  const storedEmailInputSetting = localStorage.getItem('isEmailInputPreferenceDrag');
  
  const [isProvingTypeRemote, setIsProvingTypeRemote] = useState<boolean>(
    storedProvingTypeSetting !== null ? JSON.parse(storedProvingTypeSetting) : true
  );

  const [isEmailInputSettingDrag, setIsEmailInputSettingDrag] = useState<boolean>(
    storedEmailInputSetting !== null ? JSON.parse(storedEmailInputSetting) : true
  );

  /*
   * Hooks
   */

  useEffect(() => {
    localStorage.setItem('isProvingTypeRemote', JSON.stringify(isProvingTypeRemote));
  }, [isProvingTypeRemote]);

  useEffect(() => {
    localStorage.setItem('isEmailInputPreferenceDrag', JSON.stringify(isEmailInputSettingDrag));
  }, [isEmailInputSettingDrag]);

  return (
    <ProofGenSettingsContext.Provider
      value={{
        isProvingTypeFast: isProvingTypeRemote,
        isInputModeDrag: isEmailInputSettingDrag,
        setIsProvingTypeFast: setIsProvingTypeRemote,
        setIsInputModeDrag: setIsEmailInputSettingDrag
      }}
    >
      {children}
    </ProofGenSettingsContext.Provider>
  );
};

export default ProofGenSettingsProvider
