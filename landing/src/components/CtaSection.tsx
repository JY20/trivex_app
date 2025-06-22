import React from 'react';
import './CtaSection.css';
import k1Image from '../assets/k1.jpg';

const CtaSection: React.FC = () => {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-content">
          <div className="cta-image-container">
            <div className="cta-info-box">
              <h2>Transform Your Cross-Border Payments</h2>
              <p>Join thousands of Canadian businesses saving time and money with our blockchain-powered platform. Experience faster transfers with lower fees.</p>
              <div className="cta-contact">
                <a href="https://app.kavodax.com" className="btn btn-primary">Get Started Now <span className="arrow-icon">→</span></a>
              </div>
            </div>
            <div className="cta-image">
              <img src={k1Image} alt="Business professional using Kavodax payment system" className="cta-actual-image" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection; 