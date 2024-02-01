import ethereumSvg from '../../assets/images/eth.svg';
import baseSvg from '../../assets/images/base.svg';


export const Networks = {
  ETHEREUM: "ethereum",
  BASE: "base"
} as const;

export const withdrawNetworks = [Networks.ETHEREUM, Networks.BASE];

export type WithdrawNetworkType = typeof Networks[keyof typeof Networks];

interface NetworksData {
  platformId: WithdrawNetworkType;
  platformName: string;
  platformSvg: string;
}

export const networksInfo: Record<WithdrawNetworkType, NetworksData> = {
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
