import React, { createContext, useState, useContext } from 'react';
import WaitlistPopup from '../components/WaitlistPopup';

interface PopupContextType {
  openWaitlistPopup: () => void;
  closeWaitlistPopup: () => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};

export const PopupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isWaitlistPopupOpen, setIsWaitlistPopupOpen] = useState(false);

  const openWaitlistPopup = () => {
    setIsWaitlistPopupOpen(true);
  };

  const closeWaitlistPopup = () => {
    setIsWaitlistPopupOpen(false);
  };

  return (
    <PopupContext.Provider value={{ openWaitlistPopup, closeWaitlistPopup }}>
      {children}
      <WaitlistPopup isOpen={isWaitlistPopupOpen} onClose={closeWaitlistPopup} />
    </PopupContext.Provider>
  );
};

export default PopupContext; 