import { useState, ReactNode } from 'react';

// import { esl } from '@helpers/constants';
import {
  NotaryConnectionStatusType,
  NotaryConnectionStatus,
  NotaryConfiguration
} from '@helpers/types';

import NotarySettingsContext from './NotarySettingsContext';


interface ProvidersProps {
  children: ReactNode;
};

const NotarySettingsProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  // no-op

  /*
   * State
   */

  const [connectionStatus, setConnectionStatus] = useState<NotaryConnectionStatusType>(NotaryConnectionStatus.DEFAULT);
  const [configuration, setConfiguration] = useState<NotaryConfiguration | null>(null);

  return (
    <NotarySettingsContext.Provider
      value={{
        configuration,
        connectionStatus,
      }}
    >
      {children}
    </NotarySettingsContext.Provider>
  );
};

export default NotarySettingsProvider;
