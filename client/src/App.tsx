import React, { ReactNode } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";

import { Permissions } from "./pages/Permissions";
import { Registration } from "./pages/Registration";
import { Swap } from "./pages/Swap";
import { Deposit } from "./pages/Deposit";
import { TopNav } from "./components/layouts/TopNav";
import { BottomNav } from "./components/layouts/BottomNav";

import AccountProvider from "./contexts/Account/AccountProvider";
import BalancesProvider from "./contexts/Balances/BalancesProvider";
import ProofGenSettingsProvider from "./contexts/ProofGenSettings/ProofGenSettingsProvider";
import RampRegistrationProvider  from './contexts/RampRegistration/RampRegistrationProvider';

import "./App.css";
import "./styles.css";


const App = () => {
  return (
    <Router>
      <Providers>
        <div className="app-container">
          <TopNav />

          <div className="app-content">
            <Routes>
              <Route path="/" element={<Swap />} />
              <Route path="/swap" element={<Swap />} />
              <Route path="/deposit" element={<Deposit />} />
              <Route path="/register" element={<Registration />} />
              <Route path="/permissions" element={<Permissions />} />
              <Route element={<>Not found</>} />
            </Routes>
          </div>

          <div className="app-footer">
            <BottomNav />
          </div>
        </div>
      </Providers>
    </Router>
  );
};

interface ProvidersProps {
  children: ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <AccountProvider>
      <BalancesProvider>
        <RampRegistrationProvider>
          <ProofGenSettingsProvider>
            { children }
          </ProofGenSettingsProvider>
        </RampRegistrationProvider>
      </BalancesProvider>
    </AccountProvider>
  )
}

export default App;
