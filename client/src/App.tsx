import React, { ReactNode, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';

import { Landing } from "./pages/Landing";
import { Permissions } from "./pages/Permissions";
import { Registration } from "./pages/Registration";
import { Swap } from "./pages/Swap";
import { Liquidity } from "./pages/Liquidity";
import { Deposit } from "./pages/Deposit";
import { TopNav } from "@components/layouts/TopNav";
import { MobileLandingPage } from "@components/MobileLandingPage";
import { EnvironmentBanner } from '@components/layouts/EnvironmentBanner';

import AccountProvider from "./contexts/Account/AccountProvider";
import SmartContractsProvider from './contexts/SmartContracts/SmartContractsProvider';
import BalancesProvider from "./contexts/Balances/BalancesProvider";
import RampProvider  from './contexts/Ramp/RampProvider';
import RegistrationProvider  from './contexts/Registration/RegistrationProvider';
import DepositsProvider  from './contexts/Deposits/DepositsProvider';
import PermissionsProvider from './contexts/Permissions/PermissionsProvider';
import OnRamperIntentsProvider  from './contexts/OnRamperIntents/OnRamperIntentsProvider';
import LiquidityProvider from './contexts/Liquidity/LiquidityProvider';
import ProofGenSettingsProvider from "./contexts/ProofGenSettings/ProofGenSettingsProvider";
import GoogleAuthProvider from './contexts/GoogleAuth/GoogleAuthProvider';

import "./App.css";
import "./styles.css";
import useMediaQuery from '@hooks/useMediaQuery';


const ExternalRedirect: React.FC<{ url: string }> = ({ url }) => {
  useEffect(() => {
    window.location.href = url;
  }, [url]);

  return null;
};

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
                <Route path="/pp" element={<ExternalRedirect url={process.env.PP_URL || ""} />} />
                <Route path="/tos" element={<ExternalRedirect url={process.env.TOS_URL || ""} />} />
                <Route element={<>Not found</>} />
              </Routes>
            </div>
          </div>
        </Providers>
      </Router>
    );
  }
};

interface ProvidersProps {
  children: ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <AccountProvider>
      <SmartContractsProvider>
        <BalancesProvider>
          <RampProvider>
            <RegistrationProvider>
              <DepositsProvider>
                <PermissionsProvider>
                  <LiquidityProvider>
                    <OnRamperIntentsProvider>
                      <ProofGenSettingsProvider>
                        <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID || ""}>
                          <GoogleAuthProvider>
                            { children }
                          </GoogleAuthProvider>
                        </GoogleOAuthProvider>
                      </ProofGenSettingsProvider>
                    </OnRamperIntentsProvider>
                  </LiquidityProvider>
                </PermissionsProvider>
              </DepositsProvider>
            </RegistrationProvider>
          </RampProvider>
        </BalancesProvider>
      </SmartContractsProvider>
    </AccountProvider>
  )
}

export default App;
