import React from "react";
import { MainPage } from "./pages/MainPage";
import "./styles.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useLocation } from "react-use";
import { BottomNav } from "./components/layouts/BottomNav";


const App = () => {
  return (
    <Router>
      <div>

        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/" element={<Navigate to={"/"} replace={true} />} />
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
