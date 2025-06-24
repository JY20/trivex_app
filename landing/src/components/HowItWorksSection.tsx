import React from 'react';
import './HowItWorksSection.css';
import currencyFlowDiagram from '../images/currency-flow-diagram.svg';
import { usePopup } from '../context/PopupContext';

const HowItWorksSection: React.FC = () => {
  const { openWaitlistPopup } = usePopup();
  
  return (
    <section className="how-it-works-section">
      <div className="container">
        <div className="section-title">
          <h2>How It Works</h2>
          <p>Send money globally in just a few simple steps</p>
        </div>
        
        <div className="how-it-works-content">
          <div className="currency-flow-container">
            <img src={currencyFlowDiagram} alt="Currency Flow Diagram" className="currency-flow-diagram" />
          </div>
          
          <div className="steps-side">
            <div className="steps-container">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Sign Up</h3>
                  <p>Create your Kavodax account with a simple verification process that takes just minutes.</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Fund Your Wallet</h3>
                  <p>Add funds to your Kavodax wallet using bank transfer, credit card, or stablecoins.</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Select Recipient</h3>
                  <p>Choose your recipient and enter their details, or select from your saved contacts.</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Send Money</h3>
                  <p>Confirm the transaction details and send your payment. Funds arrive in minutes, not days.</p>
                </div>
              </div>
            </div>
            
            <div className="cta-container">
              <button onClick={openWaitlistPopup} className="btn btn-primary">Start Sending Money</button>
              <a href="https://kavodax.gitbook.io/kavodax-docs/#4.-how-it-works" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">Learn More</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection; 