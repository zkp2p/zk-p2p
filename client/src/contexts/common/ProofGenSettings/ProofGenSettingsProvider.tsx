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
  const [isProvingTypeRemote, setIsProvingTypeRemote] = useState<boolean>(
    storedProvingTypeSetting !== null ? JSON.parse(storedProvingTypeSetting) : true
  );

  const storedEmailInputSetting = localStorage.getItem('isEmailInputPreferenceDrag');
  const [isEmailInputSettingDrag, setIsEmailInputSettingDrag] = useState<boolean>(
    storedEmailInputSetting !== null ? JSON.parse(storedEmailInputSetting) : false
  );

  const storedEmailModeSetting = localStorage.getItem('isEmailModeAuth');
  const [isEmailModeAuth, setIsEmailModeAuth] = useState<boolean>(
    storedEmailModeSetting !== null ? JSON.parse(storedEmailModeSetting) : true
  );

  const storedAutoSelectEmailEnabled = localStorage.getItem('isAutoSelectEmailEnabled');
  const [isAutoSelectEmailEnabled, setIsAutoSelectEmailEnabled] = useState<boolean>(
    storedAutoSelectEmailEnabled !== null ? JSON.parse(storedAutoSelectEmailEnabled) : true
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

  useEffect(() => {
    localStorage.setItem('isEmailModeAuth', JSON.stringify(isEmailModeAuth));
  }, [isEmailModeAuth]);

  useEffect(() => {
    localStorage.setItem('isAutoSelectEmailEnabled', JSON.stringify(isAutoSelectEmailEnabled));
  }, [isAutoSelectEmailEnabled]);

  return (
    <ProofGenSettingsContext.Provider
      value={{
        isEmailModeAuth,
        setIsEmailModeAuth,
        isProvingTypeFast: isProvingTypeRemote,
        setIsProvingTypeFast: setIsProvingTypeRemote,
        isInputModeDrag: isEmailInputSettingDrag,
        setIsInputModeDrag: setIsEmailInputSettingDrag,
        isAutoSelectEmailEnabled,
        setIsAutoSelectEmailEnabled,
      }}
    >
      {children}
    </ProofGenSettingsContext.Provider>
  );
};

export default ProofGenSettingsProvider
