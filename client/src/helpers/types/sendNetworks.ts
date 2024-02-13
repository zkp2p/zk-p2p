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
  SendNetwork.ARBITRUM,
  SendNetwork.BASE,
  SendNetwork.BINANCE,
  SendNetwork.ETHEREUM,
  SendNetwork.OPTIMISM,
  SendNetwork.POLYGON,
  SendNetwork.ZKSYNC
];

export type SendNetworkType = typeof SendNetwork[keyof typeof SendNetwork];

interface NetworksData {
  networkId: SendNetworkType;
  networkName: string;
  networkSvg: string;
}

export const networksInfo: Record<SendNetworkType, NetworksData> = {
  [SendNetwork.ARBITRUM]: {
    networkId: SendNetwork.ARBITRUM,
    networkName: 'Arbitrum',
    networkSvg: arbitrumSvg
  },
  [SendNetwork.AVALANCHE]: {
    networkId: SendNetwork.AVALANCHE,
    networkName: 'Avalanche',
    networkSvg: avalancheSvg
  },
  [SendNetwork.BASE]: {
    networkId: SendNetwork.BASE,
    networkName: 'Base',
    networkSvg: baseSvg
  },
  [SendNetwork.BINANCE]: {
    networkId: SendNetwork.BINANCE,
    networkName: 'Binance',
    networkSvg: binanceSvg
  },
  [SendNetwork.ETHEREUM]: {
    networkId: SendNetwork.ETHEREUM,
    networkName: 'Ethereum Mainnet',
    networkSvg: ethereumSvg
  },
  [SendNetwork.OPTIMISM]: {
    networkId: SendNetwork.OPTIMISM,
    networkName: 'Optimism',
    networkSvg: optimismSvg
  },
  [SendNetwork.POLYGON]: {
    networkId: SendNetwork.POLYGON,
    networkName: 'Polygon',
    networkSvg: polygonSvg
  },
  [SendNetwork.ZKSYNC]: {
    networkId: SendNetwork.ZKSYNC,
    networkName: 'zkSync',
    networkSvg: zksyncSvg
  },
};
