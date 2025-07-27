import React, { useState } from 'react';
import Logo from './Logo';
import useScrollToSection from '../hooks/useScrollToSection';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollToSection = useScrollToSection();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = (sectionId: string) => {
    scrollToSection(sectionId);
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Logo size="medium" />
        </div>
        
        <div className="mobile-menu-icon" onClick={toggleMenu}>
          <div className={`menu-icon ${isMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li className="navbar-item">
            <a href="#home" className="navbar-link" onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}>Home</a>
          </li>
          <li className="navbar-item">
            <a href="#features" className="navbar-link" onClick={(e) => { e.preventDefault(); handleNavClick('features'); }}>Features</a>
          </li>
          <li className="navbar-item">
            <a href="#how-it-works" className="navbar-link" onClick={(e) => { e.preventDefault(); handleNavClick('how-it-works'); }}>How It Works</a>
          </li>
          <li className="navbar-item">
            <a href="#docs" className="navbar-link">Docs</a>
          </li>
          <li className="navbar-item">
            <a href="#contact" className="navbar-link" onClick={(e) => { e.preventDefault(); handleNavClick('contact'); }}>Contact</a>
          </li>
          <li className="navbar-item">
            <a href="#app" className="navbar-button">Launch App</a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 