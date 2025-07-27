import React from 'react';

interface DepositWBTCIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const DepositWBTCIcon: React.FC<DepositWBTCIconProps> = ({ width = 70, height = 70, className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 100 100"
      className={className}
    >
      {/* Background Circle */}
      <circle cx="50" cy="50" r="45" fill="#FFF3E0" />
      
      {/* Vault */}
      <rect 
        x="25" 
        y="40" 
        width="50" 
        height="40" 
        rx="5" 
        fill="#FFFFFF" 
        stroke="#F7931A" 
        strokeWidth="2"
      />
      
      {/* Vault Door */}
      <rect 
        x="35" 
        y="50" 
        width="30" 
        height="30" 
        rx="3" 
        fill="#F7931A" 
        opacity="0.2" 
        stroke="#F7931A" 
        strokeWidth="1"
      />
      
      {/* Vault Dial */}
      <circle 
        cx="50" 
        cy="65" 
        r="5" 
        fill="#FFFFFF" 
        stroke="#F7931A" 
        strokeWidth="1.5"
      />
      <path 
        d="M50,65 L50,60" 
        stroke="#F7931A" 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
      
      {/* WBTC Coin */}
      <circle 
        cx="50" 
        cy="30" 
        r="15" 
        fill="#F7931A" 
      />
      
      {/* Bitcoin Symbol */}
      <path 
        d="M45,25 L55,25 C57,25 58,27 58,29 C58,31 57,33 55,33 L45,33 L45,25 Z M45,33 L55,33 C57,33 58,35 58,37 C58,39 57,41 55,41 L45,41 L45,33 Z" 
        fill="#FFFFFF" 
      />
      <path 
        d="M50,22 L50,25 M50,41 L50,44 M47,29 L47,37" 
        stroke="#FFFFFF" 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
      
      {/* W Badge */}
      <circle 
        cx="60" 
        cy="20" 
        r="6" 
        fill="#FFFFFF" 
        stroke="#F7931A" 
        strokeWidth="0.5"
      />
      <text
        x="60"
        y="23"
        fontFamily="Arial, sans-serif"
        fontSize="8"
        fontWeight="bold"
        textAnchor="middle"
        fill="#F7931A"
      >
        W
      </text>
      
      {/* Deposit Arrow */}
      <path 
        d="M50,35 L50,50 M45,45 L50,50 L55,45" 
        stroke="#F7931A" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Text Label */}
      <text 
        x="50" 
        y="90" 
        fontFamily="Arial, sans-serif" 
        fontSize="10" 
        fontWeight="bold" 
        textAnchor="middle" 
        fill="#F7931A"
      >
        DEPOSIT
      </text>
    </svg>
  );
};

export default DepositWBTCIcon; 