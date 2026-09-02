import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './SidebarMenu.css';

/**
 * Vertical pill navigation menu.
 * Fixed on the left side. Uses same gray background as header pill nav.
 */
const SidebarMenu: React.FC = () => {
  const { pathname } = useLocation();

  const menuItems = [
    { label: 'Home', to: '/' },
    { label: 'Bugonia', to: '/projects/bugonia' },
    { label: 'Newsquest', to: '/projects/newsquest' },
  ];

  return (
    <nav className="sidebar-pill">
      {menuItems.map(item => {
        const isActive = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`sidebar-pill-item${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-pill-text">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default SidebarMenu;
