import React from 'react';
import LogoutButton from './LogoutButton';

const Header = ({ title = 'My App' }) => {
  return (
    <header style={headerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h1>
        <div style={{ flex: 1 }} />
        <LogoutButton />
      </div>
    </header>
  );
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  background: '#fff',
  borderBottom: '1px solid #e6e6e6'
};

export default Header;
