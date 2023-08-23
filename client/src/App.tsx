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

import "./App.css";
import "./styles.css";


const App = () => {
  return (
    <Router>
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
    </Router>
  );
};

export default App;
