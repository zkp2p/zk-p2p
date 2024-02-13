import { createContext } from 'react';

import {
  SendNetworkType,
  SendNetwork,
  sendNetworks,
  ReceiveTokenType,
} from '@helpers/types';


interface SendSettingsValues {
  sendNetwork?: SendNetworkType;
  setSendNetwork?: React.Dispatch<React.SetStateAction<SendNetworkType>>;
  SendNetwork: typeof SendNetwork;
  sendNetworks: SendNetworkType[];
  receiveToken?: ReceiveTokenType;
};

const defaultValues: SendSettingsValues = {
  sendNetworks,
  SendNetwork,
};

const SendSettingsContext = createContext<SendSettingsValues>(defaultValues);

export default SendSettingsContext;
