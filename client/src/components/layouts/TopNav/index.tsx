import React, { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";

import { CustomConnectButton } from "../../common/ConnectButton";
import { NavItem } from "./NavItem";


export const TopNav: React.FC = () => {
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState<string>('Swap');

  useEffect(() => {
    const routeName = location.pathname.split('/')[1];
    setSelectedItem(routeName || 'Swap');
  }, [location]);

  return (
    <NavBar>
      <LogoAndNavItems>
        <Logo to="/swap" onClick={() => setSelectedItem('Swap')}>
          <img src={`${process.env.PUBLIC_URL}/favicon.ico`} alt="logo" />
        </Logo>
        
        <NavItem selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
      </LogoAndNavItems>
        
      <CustomConnectButton height={40} />
    </NavBar>
  );
}

const NavBar = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30px;
`;

const Logo = styled(Link)`
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #ffffff;
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