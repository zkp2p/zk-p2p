import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { WagmiConfig, createClient, configureChains, chain } from "wagmi";
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from "wagmi/providers/public";
import { optimism } from 'wagmi/chains'
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";

import "./index.css";
import "@rainbow-me/rainbowkit/styles.css";


const { chains, provider, webSocketProvider } = configureChains(
  [chain.goerli, optimism],
  [
    alchemyProvider(
      // { apiKey: process.env.REACT_APP_ALCHEMY_API_KEY }
      { apiKey: '7OLNUah9mWjItVi7QiJWrlc6xVVdSGn3' }
    ),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: "ZK P2P On-Ramp",
  chains,
});

const client = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

ReactDOM.render(
  <React.StrictMode>
    <WagmiConfig client={client}>
      <RainbowKitProvider chains={chains} theme={darkTheme()}>
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>,
  document.getElementById("root")
);
