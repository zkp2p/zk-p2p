type LifiRouteRequestParams = {
  toChain: string,
  toToken: string,
  fromAmount: string,
  fromAddress: string,
  toAddress?: string,
}

export default function useLifiBridge() {

  const getLifiQuote = async ({ fromAmount, fromAddress, toChain, toToken, toAddress }: LifiRouteRequestParams) => {
    const quotesRequest = {
      fromChain: '8453',                                       // Always will be from Base
      toChain,
      fromToken: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Will always be USDC on Base
      fromAmount,
      toToken,
      fromAddress,
      allowDestinationCall: 'false',                           // This is to toggle allowing a swap AFTER bridging to the new chain
      slippage: '0.005',                                       // 0.5% slippage
      integrator: 'ZKP2P',
      fee: '0',                                                // 0 fees
    } as any;

    if (toAddress) {
      quotesRequest.toAddress = toAddress;
    }

    const apiUrl = 'https://li.quest/v1/quote';
    const queryParams = new URLSearchParams(quotesRequest).toString();
    const urlWithParams = `${apiUrl}?${queryParams}`;

    const response = await fetch(urlWithParams, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();

      return data;
    } else {
      console.error('Failed to fetch quote:', response);

      // Lifi throws error if there is no valid route
      return null;
    }
  }

  const getLifiTransactionHistory = async (walletAddress: string) => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 10);
    
    const apiUrl = `https://li.quest/v1/analytics/wallets/${walletAddress}`;
    const queryParams = new URLSearchParams({
      fromTimestamp: (date.getTime() / 1000).toString(),
      toTimestamp: (Date.now() / 1000).toString(),
      integrator: 'ZKP2P',
    }).toString();
    const urlWithParams = `${apiUrl}?${queryParams}`;

    const response = await fetch(urlWithParams, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();

      return data;
    } else {
      console.error('Failed to fetch transaction history:', response);

      throw new Error('Failed to fetch transaction history');
    }
  }
  
  const getLifiTransactionStatus = async (txHash: string) => {
    const apiUrl = `https://li.quest/v1/status`;
    const urlWithParams = `${apiUrl}?txHash=${txHash}`;

    const response = await fetch(urlWithParams, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();

      return data;
    } else {
      console.error('Failed to fetch status:', response);

      throw new Error('Failed to fetch status');
    }
  }

  return { getLifiQuote, getLifiTransactionHistory, getLifiTransactionStatus };
};
