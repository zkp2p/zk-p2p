import { createContext } from 'react';

import {
  NotaryConnectionStatusType,
  NotaryConnectionStatus,
  NotaryConfiguration
} from '@helpers/types';


interface NotarySettingsValues {
  configuration: NotaryConfiguration | null;
  connectionStatus: NotaryConnectionStatusType;
  determineFastestNotary: (notaries: NotaryConfiguration[]) => Promise<NotaryConfiguration | null>;
  uploadTimeForNotary: number | null;
};

const defaultValues: NotarySettingsValues = {
  configuration: null,
  connectionStatus: NotaryConnectionStatus.DEFAULT,
  determineFastestNotary: async () => null,
  uploadTimeForNotary: null,
};

const NotarySettingsContext = createContext<NotarySettingsValues>(defaultValues);

export default NotarySettingsContext;
