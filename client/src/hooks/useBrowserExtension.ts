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
