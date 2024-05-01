import { createContext } from 'react';

import {
  NotaryConnectionStatusType,
  NotaryConnectionStatus,
  NotaryConfiguration
} from '@helpers/types';


interface NotarySettingsValues {
  configuration: NotaryConfiguration | null;
  connectionStatus: NotaryConnectionStatusType;
};

const defaultValues: NotarySettingsValues = {
  configuration: null,
  connectionStatus: NotaryConnectionStatus.DEFAULT,
};

const NotarySettingsContext = createContext<NotarySettingsValues>(defaultValues);

export default NotarySettingsContext;
