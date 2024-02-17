type SocketQuoteRequestParams = {
  toChainId: string,
  toTokenAddress: string,
  fromAmount: string,
  userAddress: string
  recipient?: string,
}

const API_KEY = process.env.SOCKET_API_KEY || "";
  
export default function useSocketBridge() {
  const getSocketQuote = async ({ fromAmount, recipient, toChainId, toTokenAddress, userAddress }: SocketQuoteRequestParams) => {
    const quotesRequest = {
      fromChainId: '8453',                                            // Always will be from Base
      toChainId,
      fromTokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Will always be USDC on Base
      fromAmount,
      toTokenAddress,
      userAddress,                                                    // 0x18Cc6F90512C6D95ACA0d57F98C727D61873c06a
      singleTxOnly: 'true',                                           // This is to toggle not allowing a swap AFTER bridging to the new chain
      sort: 'output',
      uniqueRoutesPerBridge: 'true'
    } as any;

    // defaultSwapSlippage - default?
    // defaultBridgeSlippage - default?

    if (recipient) {
      quotesRequest.recipient = recipient;
    }

    const apiUrl = 'https://api.socket.tech/v2/quote';
    const queryParams = new URLSearchParams(quotesRequest).toString();
    const urlWithParams = `${apiUrl}?${queryParams}`;

    console.log(urlWithParams)

    const response = await fetch(urlWithParams, {
      method: 'GET',
      headers: {
        'API-KEY': API_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();

      return data;
    } else {
      console.error('Failed to fetch quote:', response);

      throw new Error('Failed to fetch quote');
    }
  };

  const getSocketTransactionData = async (route: any) => {
    const apiUrl = 'https://api.socket.tech/v2/build-tx';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'API-KEY': API_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ "route": route })
    });

    if (response.ok) {
      const data = await response.json();

      return data;
    } else {
      console.error('Failed to fetch txn data:', response);

      throw new Error('Failed to fetch txn data');
    }
  };
  
  const getSocketTransactionStatus = async (transactionHash: string, toChainId: string) => {
    const apiUrl = `https://api.socket.tech/v2/bridge-status`;
    
    const urlWithParams = `${apiUrl}?transactionHash=${transactionHash}&toChainId=${toChainId}&fromChainId=8453`;

    const response = await fetch(urlWithParams, {
      method: 'GET',
      headers: {
        'API-KEY': API_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();

      return data;
    } else {
      console.error('Failed to fetch status:', response);

      throw new Error('Failed to fetch status');
    }
  }

  return { getSocketQuote, getSocketTransactionData, getSocketTransactionStatus };
};
