import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import styled from "styled-components";

import { NavItem } from "../TopNav/NavItem";


export const BottomNav: React.FC<{ withoutLinks?: boolean }> = ({ withoutLinks }) => {
  /*
   * State
   */

  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState<string>('Landing');

  /*
   * Hooks
   */

  useEffect(() => {
    const routeName = location.pathname.split('/')[1];
    setSelectedItem(routeName || 'Landing');
  }, [location]);

  return (
    <Wrapper>
      <NavItemWrapper>
        <NavItem selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
      </NavItemWrapper>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  z-index: 1000;
  padding-bottom: 1rem;
  position: fixed;
  bottom: 0;
`;

const NavItemWrapper = styled.div`
  background: #0D111C;
  border-radius: 16px;
  border: 1px solid #98a1c03d;
  padding: 16px 20px;
`;