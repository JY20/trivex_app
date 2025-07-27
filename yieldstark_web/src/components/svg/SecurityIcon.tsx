import React from 'react';

interface SecurityIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const SecurityIcon: React.FC<SecurityIconProps> = ({ width = 60, height = 60, className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 64 64"
      className={className}
    >
      {/* Shield Background */}
      <path
        d="M32,4 L8,12 L8,32 C8,45.3 18.3,57.3 32,60 C45.7,57.3 56,45.3 56,32 L56,12 L32,4 Z"
        fill="#333333"
        opacity="0.9"
      />
      
      {/* Shield Inner */}
      <path
        d="M32,8 L12,14.5 L12,32 C12,43 20.5,53 32,55.5 C43.5,53 52,43 52,32 L52,14.5 L32,8 Z"
        fill="#444444"
      />
      
      {/* Shield Gradient Overlay */}
      <path
        d="M32,8 L12,14.5 L12,32 C12,43 20.5,53 32,55.5 C43.5,53 52,43 52,32 L52,14.5 L32,8 Z"
        fill="url(#security-gradient)"
        opacity="0.7"
      />
      
      {/* Lock Body */}
      <rect
        x="22"
        y="26"
        width="20"
        height="16"
        rx="2"
        fill="#ffffff"
      />
      
      {/* Lock Shackle */}
      <path
        d="M26,26 L26,20 C26,16.7 28.7,14 32,14 C35.3,14 38,16.7 38,20 L38,26"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
      />
      
      {/* Keyhole */}
      <circle cx="32" cy="32" r="3" fill="#333333" />
      <rect x="31" y="32" width="2" height="6" rx="1" fill="#333333" />
      
      {/* ZK Proof Representation */}
      <g opacity="0.9">
        <circle cx="32" cy="32" r="14" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="2,2" />
        <path
          d="M32,24 L36,28 L32,32 L28,28 Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1"
        />
        <path
          d="M32,32 L36,36 L32,40 L28,36 Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1"
        />
      </g>
      
      {/* Definitions */}
      <defs>
        <linearGradient id="security-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#2196F3" stopOpacity="0.5" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default SecurityIcon; 