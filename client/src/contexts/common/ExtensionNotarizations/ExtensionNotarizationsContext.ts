import { createContext } from 'react';

import { OnRamperIntent } from '@helpers/types';
import { ExtensionNotaryProofRequest } from '@hooks/useBrowserExtension';


interface ExtensionNotarizationsValues {
  isSidebarInstalled: boolean;
  sideBarVersion: string | null;
  postOnramperIntent: (paymentPlatform: string, onramperIntent: string, fiatToSend: string) => void;
  openSidebar: () => void;
  refetchExtensionVersion: () => void;
  refetchProfileRequests: () => void;
  refetchTransferRequests: () => void;
  profileProofs: ExtensionNotaryProofRequest[] | null;
  transferProofs: ExtensionNotaryProofRequest[] | null;
};

const defaultValues: ExtensionNotarizationsValues = {
  isSidebarInstalled: false,
  sideBarVersion: null,
  postOnramperIntent: () => {},
  openSidebar: () => {},
  refetchExtensionVersion: () => {},
  refetchProfileRequests: () => {},
  refetchTransferRequests: () => {},
  profileProofs: null,
  transferProofs: null,
};

const ExtensionNotarizationsContext = createContext<ExtensionNotarizationsValues>(defaultValues);

export default ExtensionNotarizationsContext;
