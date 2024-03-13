export type ExtensionEventMessage = {
  origin: string;
  data: {
    type: string;
    status: string;
    requestHistory: {
      notaryRequests: ExtensionNotaryProofRequest[];
    };
  }
};

export type ExtensionEventVersionMessage = {
  origin: string;
  data: {
    type: string;
    status: string;
    version: string;
  }
};

export type ExtensionNotaryProofRequest = {
  body: string,
  headers: string,
  id: string,
  maxTranscriptSize: number,
  method: string,
  notaryUrl: string,
  proof: any, // returned as an object
  secretHeaders: string[],
  secretResps: string[],
  status: string,
  url: string,
  verification: any, // returned as an object
  websocketProxyUrl: string,
};

export type ExtensionNotaryProofRow = {
  proof: string;
  metadata: string;
  date: string;
};

export const ExtensionPostMessage = {
  FETCH_EXTENSION_VERSION: "fetch_extension_version",
  FETCH_PROFILE_REQUEST_HISTORY: "fetch_profile_request_history",
  FETCH_TRANSFER_REQUEST_HISTORY: "fetch_transfer_request_history",
};

export const ExtensionReceiveMessage = {
  EXTENSION_VERSION_RESPONSE: "extension_version_response",
  PROFILE_REQUEST_HISTORY_RESPONSE: "profile_request_history_response",
  TRANSFER_REQUEST_HISTORY_RESPONSE: "transfer_request_history_response",
};
