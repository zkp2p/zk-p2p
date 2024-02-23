import arbitrumSvg from '../../assets/images/arbitrum.svg';
import avalancheSvg from '../../assets/images/avalanche.svg';
import baseSvg from '../../assets/images/base.svg';
import binanceSvg from '../../assets/images/bsc.svg';
import ethereumSvg from '../../assets/images/eth.svg';
import optimismSvg from '../../assets/images/optimism.svg';
import polygonSvg from '../../assets/images/polygon.svg';
import solanaSvg from '../../assets/images/solana.svg';
import zksyncSvg from '../../assets/images/zksync-era.svg';



export const ReceiveNetwork = {
  ARBITRUM: "arbitrum",
  AVALANCHE: "avalanche",
  BASE: "base",
  BINANCE: "binance",
  ETHEREUM: "ethereum",
  OPTIMISM: "optimism",
  POLYGON: "polygon",
  SOLANA: "solana",
  ZKSYNC: "zksync",
} as const;

export const receiveNetworks = [
  ReceiveNetwork.ZKSYNC,
  ReceiveNetwork.BASE,
  ReceiveNetwork.SOLANA,
  ReceiveNetwork.POLYGON,
  ReceiveNetwork.ARBITRUM,
  ReceiveNetwork.AVALANCHE,
  ReceiveNetwork.BINANCE,
  ReceiveNetwork.OPTIMISM,
  ReceiveNetwork.ETHEREUM,
];

export type ReceiveNetworkType = typeof ReceiveNetwork[keyof typeof ReceiveNetwork];

interface NetworksData {
  networkId: ReceiveNetworkType;
  networkName: string;
  networkSvg: string;
  networkChainId: string;
  blockExplorer: string;
}

export const networksInfo: Record<ReceiveNetworkType, NetworksData> = {
  [ReceiveNetwork.ARBITRUM]: {
    networkId: ReceiveNetwork.ARBITRUM,
    networkName: 'Arbitrum',
    networkSvg: arbitrumSvg,
    networkChainId: '42161',
    blockExplorer: 'https://arbiscan.io'
  },
  [ReceiveNetwork.AVALANCHE]: {
    networkId: ReceiveNetwork.AVALANCHE,
    networkName: 'Avalanche',
    networkSvg: avalancheSvg,
    networkChainId: '43114',
    blockExplorer: 'https://snowtrace.io'
  },
  [ReceiveNetwork.BASE]: {
    networkId: ReceiveNetwork.BASE,
    networkName: 'Base',
    networkSvg: baseSvg,
    networkChainId: '8453',
    blockExplorer: 'https://basescan.org'
  },
  [ReceiveNetwork.BINANCE]: {
    networkId: ReceiveNetwork.BINANCE,
    networkName: 'Binance',
    networkSvg: binanceSvg,
    networkChainId: '56',
    blockExplorer: 'https://bscscan.com'
  },
  [ReceiveNetwork.ETHEREUM]: {
    networkId: ReceiveNetwork.ETHEREUM,
    networkName: 'Ethereum',
    networkSvg: ethereumSvg,
    networkChainId: '1',
    blockExplorer: 'https://etherscan.io'
  },
  [ReceiveNetwork.OPTIMISM]: {
    networkId: ReceiveNetwork.OPTIMISM,
    networkName: 'Optimism',
    networkSvg: optimismSvg,
    networkChainId: '10',
    blockExplorer: 'https://optimistic.etherscan.io'
  },
  [ReceiveNetwork.SOLANA]: {
    networkId: ReceiveNetwork.SOLANA,
    networkName: 'Solana',
    networkSvg: solanaSvg,
    networkChainId: '1151111081099710',
    blockExplorer: 'https://solscan.io'
  },
  [ReceiveNetwork.POLYGON]: {
    networkId: ReceiveNetwork.POLYGON,
    networkName: 'Polygon',
    networkSvg: polygonSvg,
    networkChainId: '137',
    blockExplorer: 'https://polygonscan.com'
  },
  [ReceiveNetwork.ZKSYNC]: {
    networkId: ReceiveNetwork.ZKSYNC,
    networkName: 'zkSync',
    networkSvg: zksyncSvg,
    networkChainId: '324',
    blockExplorer: 'https://explorer.zksync.io'
  },
};
