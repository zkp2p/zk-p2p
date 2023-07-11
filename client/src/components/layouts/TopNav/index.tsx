import {
  Link,
} from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useLocation } from "react-use";
import styled from "styled-components";

import { NavItem } from "./NavItem";
import { SVGIconThemed } from "../../SVGIcon/SVGIconThemed";


export const TopNav: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <Nav>
      <NavItem />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10rem",
        }}
      >
        <ConnectButton />
      </div>
    </Nav>
  );
}

const Logo = styled(Link)`
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #fff;
  text-decoration: none;
  font-size: 1.2rem;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px;
`;
