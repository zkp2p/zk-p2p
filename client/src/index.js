import React from "react";
import ReactDOM from "react-dom";
import merge from 'lodash.merge';
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
import {
  RainbowKitProvider,
  darkTheme,
  getDefaultWallets,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

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

// const { connectors } = getDefaultWallets({
//   appName: 'ZK P2P On-Ramp',
//   projectId: process.env.WALLET_CONNECT_PROJECT_ID,
//   chains
// });

// const config = createConfig({
//   autoConnect: true,
//   connectors,
//   publicClient: configureChainsConfig.publicClient
// })

// const zkp2pTheme = merge(darkTheme(), {
//   colors: {
//     accentColor: '#df2e2d',
//   },
//   radii: {
//     connectButton: '20px',
//   },
//   fonts: {
//     body: 'Graphik',
//   },
//   shadows: {
//     connectButton: 'inset 0px -4px 0px rgba(0, 0, 0, 0.16)',
//   }
// });

const zeroDevOptions = {
  projectIds: [process.env.ZERODEV_APP_ID],
  projectId: process.env.ZERODEV_APP_ID,
  useSmartWalletForExternalEOA: false, // Only sponsor gas for embedded wallets
}

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      {/* <WagmiConfig config={config}> */}
        {/* <RainbowKitProvider chains={chains} theme={zkp2pTheme}> */}
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
              defaultChain: goerli, // TODO: Switch back to base
              supportedChains: [goerli, base, hardhat]
            }}
          >
            <ZeroDevPrivyWagmiProvider wagmiChainsConfig={configureChainsConfig} options={zeroDevOptions}>
              <App />
            </ZeroDevPrivyWagmiProvider>
          </PrivyProvider>
        {/* </RainbowKitProvider> */}
      {/* </WagmiConfig> */}
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById("root")
);
