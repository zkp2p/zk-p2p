import React from "react";
import ReactDOM from "react-dom";
import merge from 'lodash.merge';

import {
  WagmiConfig,
  createConfig,
  configureChains,
  useConnect,
} from "wagmi";
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from "wagmi/providers/public";
import { hardhat, goerli, optimism } from 'wagmi/chains'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

import {
  RainbowKitProvider,
  darkTheme,
  getDefaultWallets,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

import "./index.css";
import App from "./App";


const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    hardhat,
    goerli,
    optimism
  ],
  [
    alchemyProvider({ apiKey: '7OLNUah9mWjItVi7QiJWrlc6xVVdSGn3' }), // { apiKey: process.env.REACT_APP_ALCHEMY_API_KEY }
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'ZK P2P On-Ramp',
  projectId: '90b743df4b69334a4d02e3245fa7b79b',
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
