import React from "react";
import ReactDOM from "react-dom";
import { ethers } from 'ethers';
import { PrivyProvider } from '@privy-io/react-auth';
import { ZeroDevPrivyWagmiProvider } from '@zerodev/wagmi/privy';
import {
  WagmiConfig,
  createConfig,
  configureChains,
} from "wagmi";
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from "wagmi/providers/public";
import { hardhat, sepolia, base } from 'wagmi/chains'

import "./index.css";
import ErrorBoundary from './ErrorBoundary';
import App from "./App";


const getChainsForEnvironment = (env) => {
  if (env === 'STAGING' || env === 'PRODUCTION') {
    return [base];
  } else {
    return [sepolia]; // TODO: add back hardhat and base. Disabled because we need zerodev project ids for each chain
  }
};

const env = process.env.DEPLOYMENT_ENVIRONMENT;
const chains = getChainsForEnvironment(env);
const configureChainsConfig = configureChains(
  chains,
  [
    alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY }),
    publicProvider()
  ]
);

export const alchemyMainnetEthersProvider =
  new ethers.providers.AlchemyProvider('mainnet', process.env.ALCHEMY_API_KEY)

const zeroDevOptions = {
  projectIds: [process.env.ZERODEV_APP_ID],
  projectId: process.env.ZERODEV_APP_ID,
  useSmartWalletForExternalEOA: true, // TODO: BUG need to set to true to use zerodev. Might be due to race conditions
}

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <PrivyProvider
        appId={process.env.PRIVY_APP_ID}
        config={{
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
            noPromptOnSignature: true // TODO: Any custom logic we want here
          },
          appearance: {
            theme: "#0E111C",
            accentColor: "#df2e2d",
            showWalletLoginFirst: false,
          },
          defaultChain: sepolia, // TODO: Switch back to base
          supportedChains: [sepolia, base, hardhat]
        }}
      >
        <ZeroDevPrivyWagmiProvider wagmiChainsConfig={configureChainsConfig} options={zeroDevOptions}>
          <App />
        </ZeroDevPrivyWagmiProvider>
      </PrivyProvider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById("root")
);
