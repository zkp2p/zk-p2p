import { createContext } from 'react';

import {
  NotaryConnectionStatusType,
  NotaryConnectionStatus,
  NotaryConfiguration
} from '@helpers/types';


interface NotarySettingsValues {
  configuration: NotaryConfiguration | null;
  connectionStatus: NotaryConnectionStatusType;
  determineFastestNotary: () => Promise<NotaryConfiguration | null>;
  uploadSpeedForNotary: number | null;
};

const defaultValues: NotarySettingsValues = {
  configuration: null,
  connectionStatus: NotaryConnectionStatus.DEFAULT,
  determineFastestNotary: async () => null,
  uploadSpeedForNotary: null,
};

const NotarySettingsContext = createContext<NotarySettingsValues>(defaultValues);

export default NotarySettingsContext;
