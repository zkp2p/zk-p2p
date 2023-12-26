import React, { ReactNode } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';

import { Landing } from "./pages/Landing";
import { Permissions } from "./pages/Permissions";
import { Withdraw } from "./pages/Withdraw";
import { Registration } from "./pages/Registration";
import { Swap } from "./pages/Swap";
import { Liquidity } from "./pages/Liquidity";
import { Deposit } from "./pages/Deposit";
import { Privacy } from "./pages/Privacy";
import { Tos } from "./pages/Tos";
import { TopNav } from "@components/layouts/TopNav";
import { MobileLandingPage } from "@components/MobileLandingPage";
import { EnvironmentBanner } from '@components/layouts/EnvironmentBanner';

// Common Contexts
import AccountProvider from "./contexts/common/Account/AccountProvider";
import BalancesProvider from "./contexts/common/Balances/BalancesProvider";
import GoogleAuthProvider from './contexts/common/GoogleAuth/GoogleAuthProvider';
import PlatformSettings from './contexts/common/PlatformSettings/PlatformSettingsProvider';
import ProofGenSettingsProvider from "./contexts/common/ProofGenSettings/ProofGenSettingsProvider";
import SmartContractsProvider from './contexts/common/SmartContracts/SmartContractsProvider';
import SwapQuoteProvider from './contexts/common/SwapQuote/SwapQuoteProvider';

// Legacy Contexts
import LegacyDepositsProvider  from './contexts/legacy/Deposits/DepositsProvider';

// Venmo Contexts
import DepositsProvider  from './contexts/venmo/Deposits/DepositsProvider';
import LiquidityProvider from './contexts/venmo/Liquidity/LiquidityProvider';
import OnRamperIntentsProvider  from './contexts/venmo/OnRamperIntents/OnRamperIntentsProvider';
import PermissionsProvider from './contexts/venmo/Permissions/PermissionsProvider';
import RampProvider  from './contexts/venmo/Ramp/RampProvider';
import RegistrationProvider from './contexts/venmo/Registration/RegistrationProvider';

// HDFC Contexts
import HdfcDepositsProvider from './contexts/hdfc/Deposits/DepositsProvider';
import HdfcLiquidityProvider from './contexts/hdfc/Liquidity/LiquidityProvider';
import HdfcOnRamperIntentsProvider  from './contexts/hdfc/OnRamperIntents/OnRamperIntentsProvider';
import HdfcRegistrationProvider from './contexts/hdfc/Registration/RegistrationProvider';
import HdfcRampProvider  from './contexts/hdfc/Ramp/RampProvider';

import "./App.css";
import "./styles.css";
import useMediaQuery from '@hooks/useMediaQuery';


const App = () => {
  const currentDeviceSize = useMediaQuery();

  if (currentDeviceSize === 'mobile') {
    return (
      <Router>
        <Providers>
          <div className="app-container">
            <TopNav withoutLinks />
            <div className="app-content">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/swap" element={<MobileLandingPage />} />
                <Route path="/liquidity" element={<MobileLandingPage />} />
                <Route path="/deposits" element={<MobileLandingPage />} />
                <Route path="/register" element={<MobileLandingPage />} />
                <Route path="/permissions" element={<MobileLandingPage />} />
                <Route path="/withdraw" element={<MobileLandingPage />} />
                <Route path="/pp" element={<Privacy />} />
                <Route path="/tos" element={<Tos />} />
              </Routes>
            </div>
          </div>
        </Providers>
      </Router>
    )
  } else {
    return (
      <Router>
        <Providers>
          <div className="app-container">
            <EnvironmentBanner />
            <TopNav />
            <div className="app-content">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/swap" element={<Swap />} />
                <Route path="/liquidity" element={<Liquidity />} />
                <Route path="/deposits" element={<Deposit />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/permissions" element={<Permissions />} />
                <Route path="/withdraw" element={<Withdraw />} />
                <Route path="/pp" element={<Privacy />} />
                <Route path="/tos" element={<Tos />} />
                <Route element={<>Not found</>} />
              </Routes>
            </div>
          </div>
        </Providers>
      </Router>
    );
  }
};

type ProvidersType = [React.ElementType, Record<string, unknown>];
type ChildrenType = {
  children: Array<React.ElementType>;
};

export const buildProvidersTree = (
  componentsWithProps: Array<ProvidersType>,
) => {
  const initialComponent = ({children}: ChildrenType) => <>{children}</>;
  return componentsWithProps.reduce(
    (
      AccumulatedComponents: React.ElementType,
      [Provider, props = {}]: ProvidersType,
    ) => {
      return ({children}: ChildrenType) => {
        return (
          <AccumulatedComponents>
            <Provider {...props}>{children}</Provider>
          </AccumulatedComponents>
        );
      };
    },
    initialComponent,
  );
};

const providersWithProps: ProvidersType[] = [
  [AccountProvider, {}],
  [SmartContractsProvider, {}],
  [PlatformSettings, {}],
  [BalancesProvider, {}],
  [RampProvider, {}],
  [HdfcRampProvider, {}],
  [RegistrationProvider, {}],
  [HdfcRegistrationProvider, {}],
  [DepositsProvider, {}],
  [LegacyDepositsProvider, {}],
  [HdfcDepositsProvider, {}],
  [PermissionsProvider, {}],
  [LiquidityProvider, {}],
  [HdfcLiquidityProvider, {}],
  [OnRamperIntentsProvider, {}],
  [HdfcOnRamperIntentsProvider, {}],
  [SwapQuoteProvider, {}],
  [ProofGenSettingsProvider, {}],
  [GoogleOAuthProvider, { clientId: process.env.GOOGLE_CLIENT_ID || "" }],
  [GoogleAuthProvider, {}],
];

const ProviderTree = buildProvidersTree(providersWithProps);

interface ProvidersProps {
  children: ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return <ProviderTree>{children}</ProviderTree>;
}

export default App;
