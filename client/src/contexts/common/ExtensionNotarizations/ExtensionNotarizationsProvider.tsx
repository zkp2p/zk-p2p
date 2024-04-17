import React, { useEffect, useState, ReactNode } from 'react';

// import { esl } from '@helpers/constants';
import {
  ExtensionEventMessage,
  ExtensionNotaryProofRequest,
  ExtensionEventVersionMessage,
  ExtensionPostMessage,
  ExtensionReceiveMessage,
} from '@hooks/useBrowserExtension';

import ExtensionNotarizationsContext from './ExtensionNotarizationsContext';


interface ProvidersProps {
  children: ReactNode;
};

const ExtensionNotarizationsProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  // no-op

  /*
   * State
   */

  const [isSidebarInstalled, setIsSidebarInstalled] = useState<boolean>(false);
  const [sideBarVersion, setSideBarVersion] = useState<string | null>(null);

  const [profileProofs, setProfileProofs] = useState<ExtensionNotaryProofRequest[] | null>(null);
  const [transferProofs, setTransferProofs] = useState<ExtensionNotaryProofRequest[] | null>(null);

  /*
   * Extension Storage Reads
   */

  const refetchExtensionVersion = () => {
    window.postMessage({ type: ExtensionPostMessage.FETCH_EXTENSION_VERSION }, '*');

    // console.log('Posted Message: ', ExtensionPostMessage.FETCH_EXTENSION_VERSION);
  };

  const refetchProfileRequests = () => {
    window.postMessage({ type: ExtensionPostMessage.FETCH_PROFILE_REQUEST_HISTORY }, '*');

    // console.log('Posted Message: ', ExtensionPostMessage.FETCH_PROFILE_REQUEST_HISTORY);
  };

  const refetchTransferRequests = () => {
    window.postMessage({ type: ExtensionPostMessage.FETCH_TRANSFER_REQUEST_HISTORY }, '*');

    // console.log('Posted Message: ', ExtensionPostMessage.FETCH_TRANSFER_REQUEST_HISTORY);
  };

  const openSidebar = () => {
    window.postMessage({ type: ExtensionPostMessage.OPEN_SIDEBAR }, '*');

    // console.log('Posted Message: ', ExtensionPostMessage.OPEN_SIDEBAR);
  };

  /*
   * Handlers
   */

  const handleExtensionMessage = function(event: any) {
    if (event.origin !== window.location.origin) {
      return;
    };

    if (event.data.type && event.data.type === ExtensionReceiveMessage.EXTENSION_VERSION_RESPONSE) {
      handleExtensionVersionMessageReceived(event);
    };

    if (event.data.type && event.data.type === ExtensionReceiveMessage.PROFILE_REQUEST_HISTORY_RESPONSE) {
      handleExtensionProfileHistoryMessageReceived(event);
    };

    if (event.data.type && event.data.type === ExtensionReceiveMessage.TRANSFER_REQUEST_HISTORY_RESPONSE) {
      handleExtensionTransferHistoryMessageReceived(event);
    };
  };

  const handleExtensionVersionMessageReceived = function(event: ExtensionEventVersionMessage) {
    // console.log('Client received EXTENSION_VERSION_RESPONSE message');

    const version = event.data.version;

    // console.log('Extension Version: ', version);

    setSideBarVersion(version);
    setIsSidebarInstalled(true);
  };

  const handleExtensionProfileHistoryMessageReceived = function(event: ExtensionEventMessage) {
    // console.log('Client received REQUEST_PROFILE_HISTORY_RESPONSE message');

    if (event.data.requestHistory && event.data.requestHistory.notaryRequests) {
      const requestHistory = event.data.requestHistory.notaryRequests;

      setProfileProofs(requestHistory);
    } else {
      // console.log('REQUEST_HISTORY_RESPONSE was blank');

      setProfileProofs(null);
    }
  };

  const handleExtensionTransferHistoryMessageReceived = function(event: ExtensionEventMessage) {
    // console.log('Client received REQUEST_TRANSFER_RESPONSE message');

    if (event.data.requestHistory && event.data.requestHistory.notaryRequests) {
      const requestHistory = event.data.requestHistory.notaryRequests;

      setTransferProofs(requestHistory);
    } else {
      // console.log('REQUEST_TRANSFER_RESPONSE was blank');

      setTransferProofs(null);
    }
  };

  /*
   * Hooks
   */

  useEffect(() => {
    refetchExtensionVersion();
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleExtensionMessage);
  
    return () => {
      window.removeEventListener("message", handleExtensionMessage);
    };
  }, []);

  return (
    <ExtensionNotarizationsContext.Provider
      value={{
        isSidebarInstalled,
        sideBarVersion,
        openSidebar,
        refetchExtensionVersion,
        refetchProfileRequests,
        refetchTransferRequests,
        profileProofs,
        transferProofs,
      }}
    >
      {children}
    </ExtensionNotarizationsContext.Provider>
  );
};

export default ExtensionNotarizationsProvider;
