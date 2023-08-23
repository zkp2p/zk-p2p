import { Link } from "react-router-dom";
import React, { useState } from 'react';
import styled, { css } from 'styled-components';


type Nav = {
  name: string;
  href: string;
  children?: Nav[];
}

interface NavItemProps {
  vertical?: boolean;
  selectedItem: string;
  setSelectedItem: (item: string) => void;
}

export const NavItem: React.FC<NavItemProps> = ({ 
  vertical = false,
  selectedItem,
  setSelectedItem
}) => {
  const [navigationItems, setNavigationItems] = useState<Nav[]>([
    {
      name: 'Swap',
      href: '/swap',
      children: [
        {
          name: 'On-ramp',
          href: '/',
        },
        {
          name: 'Off-ramp',
          href: '/',
        },
      ],
    },
    {
      name: 'Pool',
      href: '/pool',
    },
    {
      name: 'Registration',
      href: '/register',
    },
    {
      name: 'Permission',
      href: '/permissions',
    },
  ]);

  return (
    <HeaderLinksBox vertical={vertical}>
      {navigationItems.map((item, idx) => (
        <StyledLink
          key={item.name}
          to={item.href}
          onClick={() => setSelectedItem(item.name)}
          selected={selectedItem === item.name}
        >
          {item.name}
        </StyledLink>
      ))}
    </HeaderLinksBox>
  );
};

const HeaderLinksBox = styled.div<{ vertical: boolean }>`
  display: flex;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  flex-direction: ${props => props.vertical ? 'column' : 'row'};
`;

const StyledLink = styled(Link)<{ selected: boolean }>`
  position: relative;
  display: inline-flex;
  margin-right: 24px;
  text-decoration: none;
  color: inherit;
  cursor: pointer;

  &:last-child {
    margin-right: 0;
  }

  ${props => props.selected && css`
    &::after {
      content: '';
      position: absolute;
      width: 32px;
      height: 4px;
      background: white;
      bottom: calc(50% - 24px);
      left: calc(50% - 16px);
      border-radius: 8px;
    }
  `}

  @media (max-width: 768px) {
    &.nav-item-sub {
      position: relative;
      display: inline-flex;
      line-height: 24px;
      margin-bottom: 12px;
      padding-bottom: 16px;

      ${props => props.selected && css`
        &::after {
          content: '';
          position: absolute;
          width: 40px;
          height: 6px;
          background: white;
          bottom: 0px;
          left: calc(50% - 20px);
          border-radius: 11px;
        }
      `}
    }
  }
`;
