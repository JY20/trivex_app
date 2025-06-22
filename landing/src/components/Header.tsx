import React from 'react';
import './Header.css';
import logo from '../assets/logo2.png';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="navbar">
          <div className="logo-container">
            <img src={logo} alt="Kavodax Logo" className="logo-img" />
            <h1 className="logo-text">Kavodax</h1>
          </div>
          <div className="nav-buttons">
            <a href="https://kavodax.gitbook.io/kavodax-docs/" target="_blank" rel="noopener noreferrer" className="btn">Docs</a>
            <a href="https://app.kavodax.com" className="btn btn-primary">Launch App</a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 