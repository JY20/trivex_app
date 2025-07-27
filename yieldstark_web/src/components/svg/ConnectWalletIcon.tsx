import React from 'react';

interface ConnectWalletIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const ConnectWalletIcon: React.FC<ConnectWalletIconProps> = ({ width = 70, height = 70, className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 100 100"
      className={className}
    >
      {/* Background Circle */}
      <circle cx="50" cy="50" r="45" fill="#E3F2FD" />
      
      {/* Wallet */}
      <rect 
        x="20" 
        y="35" 
        width="45" 
        height="35" 
        rx="4" 
        fill="#FFFFFF" 
        stroke="#3F51B5" 
        strokeWidth="2"
      />
      
      {/* Wallet Top Flap */}
      <path 
        d="M20,40 L20,30 C20,27.8 21.8,26 24,26 L61,26 C63.2,26 65,27.8 65,30 L65,35" 
        fill="#FFFFFF" 
        stroke="#3F51B5" 
        strokeWidth="2"
      />
      
      {/* Connection Port */}
      <rect 
        x="55" 
        y="45" 
        width="20" 
        height="15" 
        rx="2" 
        fill="#3F51B5" 
      />
      
      {/* Starknet Logo */}
      <path 
        d="M30,45 L40,45 L40,55 L30,55 Z" 
        fill="none" 
        stroke="#3F51B5" 
        strokeWidth="1.5"
      />
      <path 
        d="M32,47 L38,53 M32,53 L38,47" 
        stroke="#3F51B5" 
        strokeWidth="1.5"
      />
      
      {/* Connection Waves */}
      <path 
        d="M70,52.5 C75,47.5 75,57.5 70,52.5" 
        stroke="#4CAF50" 
        strokeWidth="2" 
        fill="none"
        strokeLinecap="round"
      />
      <path 
        d="M75,52.5 C82,45.5 82,59.5 75,52.5" 
        stroke="#4CAF50" 
        strokeWidth="2" 
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
      
      {/* Connection Indicator */}
      <circle cx="65" cy="52.5" r="3" fill="#4CAF50" />
      
      {/* Text Label */}
      <text 
        x="50" 
        y="85" 
        fontFamily="Arial, sans-serif" 
        fontSize="10" 
        fontWeight="bold" 
        textAnchor="middle" 
        fill="#3F51B5"
      >
        CONNECT
      </text>
    </svg>
  );
};

export default ConnectWalletIcon; 