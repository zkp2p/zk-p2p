export type NotaryConfiguration = {
  name: string;
  notary: string;
  proxy: string;
};

export const notaryConfigurations: NotaryConfiguration[] = [
  {
    name: 'North Virginia',
    notary: 'https://notary-us-east-1.zkp2p.xyz',
    proxy: 'wss://notary-us-east-1.zkp2p.xyz/proxy',
  },
  {
    name: 'Ohio',
    notary: 'https://notary-us-east-2.zkp2p.xyz',
    proxy: 'wss://notary-us-east-2.zkp2p.xyz/proxy',
  },
  {
    name: 'North California',
    notary: 'https://notary-us-west-1.zkp2p.xyz',
    proxy: 'wss://notary-us-west-1.zkp2p.xyz/proxy',
  },
  {
    name: 'Oregon',
    notary: 'https://notary-us-west-2.zkp2p.xyz',
    proxy: 'wss://notary-us-west-2.zkp2p.xyz/proxy',
  },
  {
    name: 'Ireland',
    notary: 'https://notary-eu-west-1.zkp2p.xyz',
    proxy: 'wss://notary-eu-west-1.zkp2p.xyz/proxy',
  },
  {
    name: 'London',
    notary: 'https://notary-eu-west-2.zkp2p.xyz',
    proxy: 'wss://notary-eu-west-2.zkp2p.xyz/proxy',
  },
  {
    name: 'Paris',
    notary: 'https://notary-eu-west-3.zkp2p.xyz',
    proxy: 'wss://notary-eu-west-3.zkp2p.xyz/proxy',
  },
  {
    name: 'Frankfurt',
    notary: 'https://notary-eu-central-1.zkp2p.xyz',
    proxy: 'wss://notary-eu-central-1.zkp2p.xyz/proxy',
  },
  {
    name: 'Zurich',
    notary: 'https://notary-eu-central-2.zkp2p.xyz',
    proxy: 'wss://notary-eu-central-2.zkp2p.xyz/proxy',
  },
  {
    name: 'Stockholm',
    notary: 'https://notary-eu-north-1.zkp2p.xyz',
    proxy: 'wss://notary-eu-north-1.zkp2p.xyz/proxy',
  },
  {
    name: 'Milan',
    notary: 'https://notary-eu-south-1.zkp2p.xyz',
    proxy: 'wss://notary-eu-south-1.zkp2p.xyz/proxy',
  },
  {
    name: 'Spain',
    notary: 'https://notary-eu-south-2.zkp2p.xyz',
    proxy: 'wss://notary-eu-south-2.zkp2p.xyz/proxy',
  },
  {
    name: 'Mumbai',
    notary: 'https://notary-ap-south-1.zkp2p.xyz',
    proxy: 'wss://notary-ap-south-1.zkp2p.xyz/proxy',
  },
  {
    name: 'Singapore',
    notary: 'https://notary-ap-southeast-1.zkp2p.xyz',
    proxy: 'wss://notary-ap-southeast-1.zkp2p.xyz/proxy',
  },
];

export const NotaryConnectionStatus = {
  GREEN: "green",
  YELLOW: "yellow",
  RED: "red",
  DEFAULT: "default",
};

export type NotaryConnectionStatusType = typeof NotaryConnectionStatus[keyof typeof NotaryConnectionStatus];
