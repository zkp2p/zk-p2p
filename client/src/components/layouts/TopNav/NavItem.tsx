import {
  Link,
} from "react-router-dom";
import React, { useState } from 'react';

import './NavItem.css';


type Nav = {
  name: string;
  href: string;
  children?: Nav[];
}

interface NavItemProps {
  vertical?: boolean;
}

export const NavItem: React.FC<NavItemProps> = ({ 
  vertical = false
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
      name: 'Registration',
      href: '/register',
    },
    {
      name: 'Permission',
      href: '/permissions',
    },
  ]);

  const [selectedItem, setSelectedItem] = useState<string>('Swap');

  return (
    <div className={`header-links-box ${vertical ? 'column' : 'row'}`}>
      {navigationItems.map((item, idx) => (
        <Link
          key={item.name}
          to={item.href}
          onClick={() => setSelectedItem(item.name)}
          className={`nav-item center ${selectedItem === item.name ? 'selected' : ''}`}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
};
