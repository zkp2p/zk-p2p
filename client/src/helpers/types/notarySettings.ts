export const NOTARY_CONFIGURATIONS = [
  {
    name: 'North Virginia',
    notary: 'https://notary-us-east-1.zkp2p.xyz',
    proxy: 'wss://notary-us-east-1.zkp2p.xyz/proxy',
    shouldPing: true,
  },
  {
    name: 'Ohio',
    notary: 'https://notary-us-east-2.zkp2p.xyz',
    proxy: 'wss://notary-us-east-2.zkp2p.xyz/proxy',
    shouldPing: true,
  },
  {
    name: 'North California',
    notary: 'https://notary-us-west-1.zkp2p.xyz',
    proxy: 'wss://notary-us-west-1.zkp2p.xyz/proxy',
    shouldPing: true,
  },
  {
    name: 'Oregon',
    notary: 'https://notary-us-west-2.zkp2p.xyz',
    proxy: 'wss://notary-us-west-2.zkp2p.xyz/proxy',
    shouldPing: true,
  },
  {
    name: 'Ireland',
    notary: 'https://notary-eu-west-1.zkp2p.xyz',
    proxy: 'wss://notary-eu-west-1.zkp2p.xyz/proxy',
    shouldPing: true,
  },
  {
    name: 'London',
    notary: 'https://notary-eu-west-2.zkp2p.xyz',
    proxy: 'wss://notary-eu-west-2.zkp2p.xyz/proxy',
    shouldPing: true,
  },
  {
    name: 'Paris',
    notary: 'https://notary-eu-west-3.zkp2p.xyz',
    proxy: 'wss://notary-eu-west-3.zkp2p.xyz/proxy',
    shouldPing: true,
  },
  {
    name: 'Frankfurt',
    notary: 'https://notary-eu-central-1.zkp2p.xyz',
    proxy: 'wss://notary-eu-central-1.zkp2p.xyz/proxy',
    shouldPing: true,
  },
  {
    name: 'Zurich',
    notary: 'https://notary-eu-central-2.zkp2p.xyz',
    proxy: 'wss://notary-eu-central-2.zkp2p.xyz/proxy',
    shouldPing: true,
  },
  {
    name: 'Stockholm',
    notary: 'https://notary-eu-north-1.zkp2p.xyz',
    proxy: 'wss://notary-eu-north-1.zkp2p.xyz/proxy',
    shouldPing: true,
  },
  {
    name: 'Milan',
    notary: 'https://notary-eu-south-1.zkp2p.xyz',
    proxy: 'wss://notary-eu-south-1.zkp2p.xyz/proxy',
    shouldPing: true,
  },
  {
    name: 'Spain',
    notary: 'https://notary-eu-south-2.zkp2p.xyz',
    proxy: 'wss://notary-eu-south-2.zkp2p.xyz/proxy',
    shouldPing: true,
  },
  {
    name: 'Mumbai',
    notary: 'https://notary-ap-south-1.zkp2p.xyz',
    proxy: 'wss://notary-ap-south-1.zkp2p.xyz/proxy',
    shouldPing: true,
  },
  {
    name: 'Singapore',
    notary: 'https://notary-ap-southeast-1.zkp2p.xyz',
    proxy: 'wss://notary-ap-southeast-1.zkp2p.xyz/proxy',
    shouldPing: true,
  },
];

export const NotaryConnectionStatus = {
  GREEN: 'green',
  YELLOW: 'yellow',
  RED: 'red',
} as const;

export type NotaryConnectionStatusType = keyof typeof NotaryConnectionStatus;
