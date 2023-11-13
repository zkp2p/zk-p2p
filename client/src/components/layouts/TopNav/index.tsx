import React, { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";

import { CustomConnectButton } from "../../common/ConnectButton";
import { NavItem } from "./NavItem";


export const TopNav: React.FC<{ withoutLinks?: boolean }> = ({ withoutLinks }) => {
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState<string>('Landing');

  useEffect(() => {
    const routeName = location.pathname.split('/')[1];
    setSelectedItem(routeName || 'Landing');
  }, [location]);

  return (
    <NavBar>
      {withoutLinks ? (
        <NavBarCentered>
          <Logo size={48} to="/" onClick={() => setSelectedItem('Landing')}>
            <img src={`${process.env.PUBLIC_URL}/logo512.png`} alt="logo" />
          </Logo>
        </NavBarCentered>
      ) : (
        <LogoAndNavItems>
          <Logo to="/" onClick={() => setSelectedItem('Landing')}>
            <img src={`${process.env.PUBLIC_URL}/logo512.png`} alt="logo" />
          </Logo>

          <NavItem selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
        </LogoAndNavItems>
      )}

      {!withoutLinks && <CustomConnectButton height={40} />}
    </NavBar>
  );
}

const NavBarCentered = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
`;

const NavBar = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30px;
`;

const Logo = styled(Link)<{ size?: number }>`
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #ffffff;
  text-decoration: none;
  font-size: 1.2rem;

  img {
    width: ${({ size }) => size || 32}px;
    height: ${({ size }) => size || 32}px;
    object-fit: cover;
  }
`;

const LogoAndNavItems = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;
