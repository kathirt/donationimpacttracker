import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', ariaLabel: 'Navigate to Dashboard' },
    { path: '/map', label: 'Impact Map', icon: '🗺️', ariaLabel: 'Navigate to Impact Map' },
    { path: '/donors', label: 'Donors', icon: '👥', ariaLabel: 'Navigate to Donors page' },
    { path: '/campaigns', label: 'Campaigns', icon: '🎯', ariaLabel: 'Navigate to Campaigns page' },
  ];

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-brand">
        <h2>
          <span role="img" aria-label="Heart">💝</span>
          {' '}Donation Impact Tracker
        </h2>
      </div>
      <ul className="navbar-menu" role="menubar">
        {navItems.map((item) => (
          <li key={item.path} role="none">
            <Link
              to={item.path}
              className={`navbar-item ${location.pathname === item.path ? 'active' : ''}`}
              role="menuitem"
              aria-label={item.ariaLabel}
              aria-current={location.pathname === item.path ? 'page' : undefined}
            >
              <span className="navbar-icon" role="img" aria-hidden="true">
                {item.icon}
              </span>
              <span className="navbar-label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};