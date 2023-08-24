import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import styled from "styled-components";

import { NavItem } from "./NavItem";


export const TopNav: React.FC = () => {

  const [selectedItem, setSelectedItem] = useState<string>('Swap');

  return (
    <NavBar>
      <LogoAndNavItems>
        <Logo to="/swap" onClick={() => setSelectedItem('Swap')}>
          <img src={`${process.env.PUBLIC_URL}/favicon.ico`} alt="logo" />
        </Logo>
        
        <NavItem selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
      </LogoAndNavItems>
        
      <ConnectButton />
    </NavBar>
  );
}

const NavBar = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 36px;
`;

const Logo = styled(Link)`
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #fff;
  text-decoration: none;
  font-size: 1.2rem;

  img {
    width: 32px;
    height: 32px;
    object-fit: cover;
  }
`;

const LogoAndNavItems = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;