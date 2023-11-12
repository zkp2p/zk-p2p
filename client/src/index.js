import React from "react";
import ReactDOM from "react-dom";
import merge from 'lodash.merge';

import {
  WagmiConfig,
  createConfig,
  configureChains,
} from "wagmi";
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from "wagmi/providers/public";
import { hardhat, goerli, base } from 'wagmi/chains'

import {
  RainbowKitProvider,
  darkTheme,
  getDefaultWallets,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

import "./index.css";
import App from "./App";


const getChainsForEnvironment = (env) => {
  if (env === 'STAGING') {
    return [goerli, hardhat];
  } else if (env === 'PRODUCTION') {
    return [base];
  }
  return [base, goerli, hardhat];
};

const env = process.env.DEPLOYMENT_ENVIRONMENT;
const chains = getChainsForEnvironment(env);
const { publicClient } = configureChains(
  chains,
  [
    alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'ZK P2P On-Ramp',
  projectId: process.env.WALLET_CONNECT_PROJECT_ID,
  chains
});

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})

const zkp2pTheme = merge(darkTheme(), {
  colors: {
    accentColor: '#df2e2d',
  },
  radii: {
    connectButton: '20px',
  },
  fonts: {
    body: 'Graphik',
  },
  shadows: {
    connectButton: 'inset 0px -4px 0px rgba(0, 0, 0, 0.16)',
  }
});

ReactDOM.render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <RainbowKitProvider chains={chains} theme={zkp2pTheme}>
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>,
  document.getElementById("root")
);
