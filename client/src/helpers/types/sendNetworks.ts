import ethereumSvg from '../../assets/images/eth.svg';
import baseSvg from '../../assets/images/base.svg';


export const Networks = {
  ETHEREUM: "ethereum",
  BASE: "base"
} as const;

export const sendNetworks = [Networks.ETHEREUM, Networks.BASE];

export type SendNetworkType = typeof Networks[keyof typeof Networks];

interface NetworksData {
  platformId: SendNetworkType;
  platformName: string;
  platformSvg: string;
}

export const networksInfo: Record<SendNetworkType, NetworksData> = {
  [Networks.ETHEREUM]: {
    platformId: Networks.ETHEREUM,
    platformName: 'Ethereum Mainnet',
    platformSvg: ethereumSvg
  },
  [Networks.BASE]: {
    platformId: Networks.BASE,
    platformName: 'Base',
    platformSvg: baseSvg
  }
};
