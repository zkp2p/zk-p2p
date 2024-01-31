import { LiFi, GetStatusRequest } from '@lifi/sdk';

type LifiRouteRequestParams = {
  fromAmount: string;
  fromTokenAddress: string;
  fromAddress: string;
  toChainId: number;
  toTokenAddress: string,
  toAddress: string
}

export default function useLifiBridge() {
    const lifi = new LiFi({
      integrator: 'ZKP2P',
      defaultRouteOptions: {
        integrator: 'ZKP2P',
        fee: 0,
        insurance: true,
        slippage: 0.005,
        allowDestinationCall: false // Do not allow swapping on destination chain
      }
    });

    const getLifiRoutes = async ({fromAmount, fromTokenAddress, fromAddress, toChainId, toTokenAddress, toAddress }: LifiRouteRequestParams) => {
      const routesRequest = {
        fromChainId: 8453, // Always will be from Base
        fromAmount,
        fromTokenAddress,
        fromAddress,
        toChainId,
        toTokenAddress,
        toAddress,
      }
      const result = await lifi.getRoutes(routesRequest);
      return result.routes;
    }

    const getLifiTransactionHistory = async (walletAddress: string, fromTimestamp: number, toTimestamp: number) => {
      return await lifi.getTransactionHistory({
        walletAddress,
        fromTimestamp,
        toTimestamp
      });
    }
    
    const getLifiTransactionStatus = async ({ txHash, bridge, fromChain, toChain }: GetStatusRequest) => {
      return await lifi.getStatus({
        txHash,
        bridge,
        fromChain,
        toChain
      });
    }

  return { getLifiRoutes, getLifiTransactionHistory, getLifiTransactionStatus };
};
