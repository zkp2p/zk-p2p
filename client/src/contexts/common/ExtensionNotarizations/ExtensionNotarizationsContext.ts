import { createContext } from 'react';

import { ExtensionNotaryProofRequest } from '@hooks/useBrowserExtension';


interface ExtensionNotarizationsValues {
  isSidebarInstalled: boolean;
  sideBarVersion: string | null;
  refetchExtensionVersion: () => void;
  refetchProfileRequests: () => void;
  refetchTransferRequests: () => void;
  profileProofs: ExtensionNotaryProofRequest[] | null;
  transferProofs: ExtensionNotaryProofRequest[] | null;
};

const defaultValues: ExtensionNotarizationsValues = {
  isSidebarInstalled: false,
  sideBarVersion: null,
  refetchExtensionVersion: () => {},
  refetchProfileRequests: () => {},
  refetchTransferRequests: () => {},
  profileProofs: null,
  transferProofs: null,
};

const ExtensionNotarizationsContext = createContext<ExtensionNotarizationsValues>(defaultValues);

export default ExtensionNotarizationsContext;
