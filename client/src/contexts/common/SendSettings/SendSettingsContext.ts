import { createContext } from 'react';

import { SendNetworkType, SendNetwork, sendNetworks } from '@helpers/types';


interface SendSettingsValues {
  sendNetwork?: SendNetworkType;
  setSendNetwork?: React.Dispatch<React.SetStateAction<SendNetworkType>>;
  SendNetwork: typeof SendNetwork;
  sendNetworks: SendNetworkType[];
};

const defaultValues: SendSettingsValues = {
  sendNetworks,
  SendNetwork,
};

const SendSettingsContext = createContext<SendSettingsValues>(defaultValues);

export default SendSettingsContext;
