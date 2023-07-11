import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import { useLocation } from "react-use";

import { MainPage } from "./pages/MainPage";
import { Registration } from "./pages/Registration";
import { Swap } from "./pages/Swap";
import { Permissions } from "./pages/Permissions";
import { TopNav } from "./components/layouts/TopNav";
import { BottomNav } from "./components/layouts/BottomNav";
import "./styles.css";


const App = () => {
  return (
    <Router>
      <div>
        <TopNav />

        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/swap" element={<Swap />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/permissions" element={<Permissions />} />
          <Route element={<>Not found</>} />
        </Routes>

        <BottomNav />
      </div>
    </Router>
  );
};

export default App;

const Main: React.FC = () => {
  const { search } = useLocation();

  return <MainPage key={search} />;
};
