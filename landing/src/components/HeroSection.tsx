import React from 'react';
import './HeroSection.css';
import heroSvg from '../images/global-payments-illustration.svg';

const HeroSection: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Revolutionizing Cross-Border B2B Payments</h1>
            <p>
              Kavodax is a blockchain-powered platform enabling Canadian businesses to send money globally 
              in minutes with less than 1% fees. We use stablecoins for transparency and efficiency, 
              addressing slow and costly traditional transactions while fostering financial inclusion.
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-value">&lt;1%</span>
                <span className="stat-label">Transaction Fees</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">Minutes</span>
                <span className="stat-label">Not Days</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">Global</span>
                <span className="stat-label">Coverage</span>
              </div>
            </div>
            <div className="hero-cta">
              <a href="https://app.kavodax.com" className="btn btn-primary">Get Started</a>
              <a href="https://kavodax.gitbook.io/kavodax-docs/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">Learn More</a>
            </div>
          </div>
          <div className="hero-image">
            <img src={heroSvg} alt="Global Payment Solutions" className="hero-main-image" />
            <div className="floating-element card-element">
              <div className="card-content">
                <div className="card-chip"></div>
                <div className="card-number">•••• •••• •••• 4321</div>
              </div>
            </div>
            <div className="floating-element blockchain-element">
              <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="10" rx="2" />
                <path d="M6 10h4M6 14h2" />
              </svg>
            </div>
            <div className="floating-element globe-element">
              <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 