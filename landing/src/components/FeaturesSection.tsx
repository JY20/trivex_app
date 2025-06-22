import React from 'react';
import './FeaturesSection.css';

const FeaturesSection: React.FC = () => {
  return (
    <section className="features-section">
      <div className="container">
        <div className="section-title">
          <h2>Why Choose Kavodax</h2>
          <p>Our blockchain-powered platform offers unparalleled advantages for cross-border payments</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M16 12l-4 4-4-4"></path>
                <path d="M12 8v8"></path>
              </svg>
            </div>
            <h3>Low Fees</h3>
            <p>Send money globally with less than 1% fees, compared to traditional 7%+ fees from banks and other providers.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"></path>
              </svg>
            </div>
            <h3>Fast Transfers</h3>
            <p>Complete transactions in minutes instead of waiting 3-7 days with traditional banking systems.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3>Secure & Transparent</h3>
            <p>Blockchain technology ensures every transaction is secure, traceable, and immutable for complete peace of mind.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                <path d="M16 3.13a4 4 0 010 7.75"></path>
              </svg>
            </div>
            <h3>Financial Inclusion</h3>
            <p>Empowering 1.5 billion unbanked individuals worldwide with access to modern financial services.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <h3>Stablecoin Technology</h3>
            <p>Using stablecoins for consistent value and protection against cryptocurrency volatility.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </div>
            <h3>Real-Time Tracking</h3>
            <p>Monitor your transfers at every step with complete visibility from sender to recipient.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 