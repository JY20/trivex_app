import React, { useState } from 'react';
import './Header.css';
import logo from '../assets/logo_blue.png';
import { usePopup } from '../context/PopupContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { openWaitlistPopup } = usePopup();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="navbar">
          <div className="logo-container">
            <img src={logo} alt="Kavodax Logo" className="logo-img" />
            <h1 className="logo-text">Kavodax</h1>
          </div>
          
          {/* Mobile menu button */}
          <div className="mobile-menu-button" onClick={toggleMenu}>
            <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          
          {/* Navigation buttons - desktop and mobile */}
          <div className={`nav-buttons ${isMenuOpen ? 'show' : ''}`}>
            <a href="https://kavodax.gitbook.io/kavodax-docs/" target="_blank" rel="noopener noreferrer" className="btn">Docs</a>
            <button onClick={openWaitlistPopup} className="btn btn-primary">Get Started</button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 