import React from 'react';
import './WaitlistPopup.css';

interface WaitlistPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const WaitlistPopup: React.FC<WaitlistPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="waitlist-popup-overlay">
      <div className="waitlist-popup">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Join the waitlist</h2>
        <p>Contact us using email address:</p>
        <a href="mailto:Gharsa.amin@kavodax.com" className="email-link">Gharsa.amin@kavodax.com</a>
      </div>
    </div>
  );
};

export default WaitlistPopup; 