import { createContext } from 'react';

import { ExtensionNotaryProofRequest } from '@hooks/useBrowserExtension';


interface ExtensionNotarizationsValues {
  isSidebarInstalled: boolean;
  sideBarVersion: string | null;
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
  openSidebar: () => {},
  refetchExtensionVersion: () => {},
  refetchProfileRequests: () => {},
  refetchTransferRequests: () => {},
  profileProofs: null,
  transferProofs: null,
};

const ExtensionNotarizationsContext = createContext<ExtensionNotarizationsValues>(defaultValues);

export default ExtensionNotarizationsContext;
