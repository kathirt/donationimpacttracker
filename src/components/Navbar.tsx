import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/map', label: 'Impact Map', icon: '🗺️' },
    { path: '/donors', label: 'Donors', icon: '👥' },
    { path: '/campaigns', label: 'Campaigns', icon: '🎯' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>💝 Donation Impact Tracker</h2>
      </div>
      <div className="navbar-menu">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`navbar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="navbar-icon">{item.icon}</span>
            <span className="navbar-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};