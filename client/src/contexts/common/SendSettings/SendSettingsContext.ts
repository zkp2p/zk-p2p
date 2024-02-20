import { createContext } from 'react';

import {
  ReceiveNetworkType,
  ReceiveNetwork,
  receiveNetworks,
  ReceiveTokenType,
} from '@helpers/types';


interface SendSettingsValues {
  receiveNetwork?: ReceiveNetworkType;
  setReceiveNetwork?: React.Dispatch<React.SetStateAction<ReceiveNetworkType>>;
  ReceiveNetwork: typeof ReceiveNetwork;
  receiveNetworks: ReceiveNetworkType[];
  receiveToken?: ReceiveTokenType;
  setReceiveToken?: React.Dispatch<React.SetStateAction<ReceiveTokenType>>;
};

const defaultValues: SendSettingsValues = {
  receiveNetworks,
  ReceiveNetwork,
};

const SendSettingsContext = createContext<SendSettingsValues>(defaultValues);

export default SendSettingsContext;
