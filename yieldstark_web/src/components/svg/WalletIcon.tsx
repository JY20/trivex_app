import React from 'react';

interface WalletIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const WalletIcon: React.FC<WalletIconProps> = ({ width = 60, height = 60, className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 64 64"
      className={className}
    >
      {/* Wallet Base */}
      <rect
        x="8"
        y="16"
        width="48"
        height="36"
        rx="4"
        fill="#333333"
      />
      
      {/* Wallet Inner */}
      <rect
        x="10"
        y="18"
        width="44"
        height="32"
        rx="3"
        fill="#444444"
      />
      
      {/* Wallet Flap */}
      <path
        d="M8,22 L8,16 C8,13.8 9.8,12 12,12 L52,12 C54.2,12 56,13.8 56,16 L56,22"
        fill="#333333"
        opacity="0.8"
      />
      
      {/* Connection Port */}
      <rect
        x="40"
        y="26"
        width="16"
        height="16"
        rx="2"
        fill="#555555"
      />
      
      {/* Connection Port Details */}
      <rect
        x="42"
        y="28"
        width="12"
        height="12"
        rx="1"
        fill="#222222"
      />
      
      {/* Connection Indicator */}
      <circle
        cx="48"
        cy="34"
        r="4"
        fill="#4CAF50"
      />
      
      {/* Connection Waves */}
      <path
        d="M54,34 C56,31 56,37 54,34 M58,34 C62,29 62,39 58,34"
        stroke="#4CAF50"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Card/Money Inside */}
      <rect
        x="14"
        y="26"
        width="20"
        height="12"
        rx="2"
        fill="#f5f5f5"
      />
      
      {/* Card Stripe */}
      <rect
        x="14"
        y="30"
        width="20"
        height="4"
        fill="#2196F3"
        opacity="0.7"
      />
      
      {/* Starknet Symbol */}
      <path
        d="M24,29 L22,31 L24,33 L26,31 Z"
        fill="#2196F3"
      />
    </svg>
  );
};

export default WalletIcon; 