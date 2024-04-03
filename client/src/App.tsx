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
import { Send } from "./pages/Send";
import { Privacy } from "./pages/Privacy";
import { Tos } from "./pages/Tos";
import Modals from "./pages/Modals";
import { TopNav } from "@components/layouts/TopNav";
import { MobileLandingPage } from "@components/MobileLandingPage";
import { EnvironmentBanner } from '@components/layouts/EnvironmentBanner';

// Common Contexts
import AccountProvider from "./contexts/common/Account/AccountProvider";
import BalancesProvider from "./contexts/common/Balances/BalancesProvider";
import GoogleAuthProvider from './contexts/common/GoogleAuth/GoogleAuthProvider';
import PlatformSettingsProvider from './contexts/common/PlatformSettings/PlatformSettingsProvider';
import ProofGenSettingsProvider from "./contexts/common/ProofGenSettings/ProofGenSettingsProvider";
import SendSettingsProvider from './contexts/common/SendSettings/SendSettingsProvider';
import SmartContractsProvider from './contexts/common/SmartContracts/SmartContractsProvider';
import SwapQuoteProvider from './contexts/common/SwapQuote/SwapQuoteProvider';
import DenyListProvider from './contexts/common/DenyList/DenyListProvider';
import ExtensionNotarizationsProvider from './contexts/common/ExtensionNotarizations/ExtensionNotarizationsProvider';
import { ModalSettingsProvider } from 'contexts/common/ModalSettings';

// Legacy Contexts
import LegacyDepositsProvider  from './contexts/legacy/Deposits/DepositsProvider';

// Venmo Contexts
import VenmoDepositsProvider  from './contexts/venmo/Deposits/DepositsProvider';
import VenmoLiquidityProvider from './contexts/venmo/Liquidity/LiquidityProvider';
import VenmoOnRamperIntentsProvider  from './contexts/venmo/OnRamperIntents/OnRamperIntentsProvider';
import VenmoPermissionsProvider from './contexts/venmo/Permissions/PermissionsProvider';
import VenmoRegistrationProvider from './contexts/venmo/Registration/RegistrationProvider';
import VenmoRampProvider  from './contexts/venmo/Ramp/RampProvider';

// HDFC Contexts
import HdfcDepositsProvider from './contexts/hdfc/Deposits/DepositsProvider';
import HdfcLiquidityProvider from './contexts/hdfc/Liquidity/LiquidityProvider';
import HdfcOnRamperIntentsProvider  from './contexts/hdfc/OnRamperIntents/OnRamperIntentsProvider';
import HdfcRegistrationProvider from './contexts/hdfc/Registration/RegistrationProvider';
import HdfcRampProvider  from './contexts/hdfc/Ramp/RampProvider';

// Garanti Contexts
import GarantiDepositsProvider  from './contexts/garanti/Deposits/DepositsProvider';
import GarantiLiquidityProvider from './contexts/garanti/Liquidity/LiquidityProvider';
import GarantiOnRamperIntentsProvider  from './contexts/garanti/OnRamperIntents/OnRamperIntentsProvider';
import GarantiRampProvider from './contexts/garanti/Ramp/RampProvider';
import GarantiRegistrationProvider from './contexts/garanti/Registration/RegistrationProvider';

// Wise Contexts
import WiseDepositsProvider  from './contexts/wise/Deposits/DepositsProvider';
import WiseLiquidityProvider from './contexts/wise/Liquidity/LiquidityProvider';
import WiseOnRamperIntentsProvider  from './contexts/wise/OnRamperIntents/OnRamperIntentsProvider';
import WiseRampProvider from './contexts/wise/Ramp/RampProvider';
import WiseRegistrationProvider from './contexts/wise/Registration/RegistrationProvider';

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
                <Route path="/send" element={<MobileLandingPage />} />
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
            <Modals />
            <div className="app-content">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/swap" element={<Swap />} />
                <Route path="/liquidity" element={<Liquidity />} />
                <Route path="/deposits" element={<Deposit />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/permissions" element={<Permissions />} />
                <Route path="/withdraw" element={<Withdraw />} />
                <Route path="/send" element={<Send />} />
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
  [PlatformSettingsProvider, {}],
  [SendSettingsProvider, {}],
  [BalancesProvider, {}],

  [VenmoRampProvider, {}],
  [HdfcRampProvider, {}],
  [GarantiRampProvider, {}],
  [WiseRampProvider, {}],

  [VenmoRegistrationProvider, {}],
  [HdfcRegistrationProvider, {}],
  [GarantiRegistrationProvider, {}],
  [WiseRegistrationProvider, {}],

  [VenmoDepositsProvider, {}],
  [LegacyDepositsProvider, {}],
  [HdfcDepositsProvider, {}],
  [GarantiDepositsProvider, {}],
  [WiseDepositsProvider, {}],

  [ExtensionNotarizationsProvider, {}],

  [VenmoPermissionsProvider, {}],
  [DenyListProvider, {}],

  [VenmoLiquidityProvider, {}],
  [HdfcLiquidityProvider, {}],
  [GarantiLiquidityProvider, {}],
  [WiseLiquidityProvider, {}],

  [VenmoOnRamperIntentsProvider, {}],
  [HdfcOnRamperIntentsProvider, {}],
  [GarantiOnRamperIntentsProvider, {}],
  [WiseOnRamperIntentsProvider, {}],

  [SwapQuoteProvider, {}],
  [ProofGenSettingsProvider, {}],
  [ModalSettingsProvider, {}],
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
