import arbitrumSvg from '../../assets/images/arbitrum.svg';
import avalancheSvg from '../../assets/images/avalanche.svg';
import baseSvg from '../../assets/images/base.svg';
import binanceSvg from '../../assets/images/bsc.svg';
import ethereumSvg from '../../assets/images/eth.svg';
import optimismSvg from '../../assets/images/optimism.svg';
import polygonSvg from '../../assets/images/polygon.svg';
import zksyncSvg from '../../assets/images/zksync-era.svg';


export const SendNetwork = {
  ARBITRUM: "arbitrum",
  AVALANCHE: "avalanche",
  BASE: "base",
  BINANCE: "binance",
  ETHEREUM: "ethereum",
  OPTIMISM: "optimism",
  POLYGON: "polygon",
  ZKSYNC: "zksync",
} as const;

export const sendNetworks = [
  SendNetwork.ZKSYNC,
  SendNetwork.BASE,
  SendNetwork.POLYGON,
  SendNetwork.AVALANCHE,
  SendNetwork.BINANCE,
  SendNetwork.ARBITRUM,
  SendNetwork.OPTIMISM,
  SendNetwork.ETHEREUM,
];

export type SendNetworkType = typeof SendNetwork[keyof typeof SendNetwork];

interface NetworksData {
  networkId: SendNetworkType;
  networkName: string;
  networkSvg: string;
  networkChainId: string;
}

export const networksInfo: Record<SendNetworkType, NetworksData> = {
  [SendNetwork.ARBITRUM]: {
    networkId: SendNetwork.ARBITRUM,
    networkName: 'Arbitrum',
    networkSvg: arbitrumSvg,
    networkChainId: '42161'
  },
  [SendNetwork.AVALANCHE]: {
    networkId: SendNetwork.AVALANCHE,
    networkName: 'Avalanche',
    networkSvg: avalancheSvg,
    networkChainId: '43114'
  },
  [SendNetwork.BASE]: {
    networkId: SendNetwork.BASE,
    networkName: 'Base',
    networkSvg: baseSvg,
    networkChainId: '8453'
  },
  [SendNetwork.BINANCE]: {
    networkId: SendNetwork.BINANCE,
    networkName: 'Binance',
    networkSvg: binanceSvg,
    networkChainId: '56'
  },
  [SendNetwork.ETHEREUM]: {
    networkId: SendNetwork.ETHEREUM,
    networkName: 'Ethereum Mainnet',
    networkSvg: ethereumSvg,
    networkChainId: '1'
  },
  [SendNetwork.OPTIMISM]: {
    networkId: SendNetwork.OPTIMISM,
    networkName: 'Optimism',
    networkSvg: optimismSvg,
    networkChainId: '10'
  },
  [SendNetwork.POLYGON]: {
    networkId: SendNetwork.POLYGON,
    networkName: 'Polygon',
    networkSvg: polygonSvg,
    networkChainId: '137'
  },
  [SendNetwork.ZKSYNC]: {
    networkId: SendNetwork.ZKSYNC,
    networkName: 'zkSync',
    networkSvg: zksyncSvg,
    networkChainId: '324'
  },
};
