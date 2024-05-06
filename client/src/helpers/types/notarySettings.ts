export type NotaryConfiguration = {
  name: string;
  notary: string;
  proxy: string;
};

export const defaultNotaryConfigurations: NotaryConfiguration[] = [
  {
    name: 'North California',
    notary: 'https://notary-us-west-1.zkp2p.xyz',
    proxy: 'wss://notary-us-west-1.zkp2p.xyz/proxy',
  },
  {
    name: 'Tokyo',
    notary: 'https://notary-ap-northeast-1.zkp2p.xyz',
    proxy: 'wss://notary-ap-northeast-1.zkp2p.xyz/proxy',
  }
];

export const NotaryConnectionStatus = {
  GREEN: "green",
  YELLOW: "yellow",
  RED: "red",
  DEFAULT: "default",
};

export type NotaryConnectionStatusType = typeof NotaryConnectionStatus[keyof typeof NotaryConnectionStatus];
