import React from 'react';

interface SecurityFirstIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const SecurityFirstIcon: React.FC<SecurityFirstIconProps> = ({ width = 60, height = 60, className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 100 100"
      className={className}
    >
      {/* Background */}
      <defs>
        <linearGradient id="securityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2196F3" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#2196F3" stopOpacity="0.1" />
        </linearGradient>
        <filter id="securityShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>
      
      {/* Background Circle */}
      <circle cx="50" cy="50" r="45" fill="url(#securityGradient)" />
      
      {/* Shield */}
      <path 
        d="M50,15 L25,25 L25,50 C25,65 35,77.5 50,85 C65,77.5 75,65 75,50 L75,25 L50,15 Z" 
        fill="#FFF" 
        stroke="#2196F3" 
        strokeWidth="2"
        filter="url(#securityShadow)"
      />
      
      {/* Shield Inner */}
      <path 
        d="M50,25 L35,31 L35,50 C35,60 41,68 50,72 C59,68 65,60 65,50 L65,31 L50,25 Z" 
        fill="none" 
        stroke="#2196F3" 
        strokeWidth="1.5"
        strokeDasharray="2,1"
      />
      
      {/* Checkmark */}
      <path 
        d="M40,50 L45,55 L60,40" 
        fill="none" 
        stroke="#2196F3" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* ZK Proof Representation */}
      <g opacity="0.7">
        <path 
          d="M50,35 L45,40 L50,45 L55,40 Z" 
          fill="none" 
          stroke="#2196F3" 
          strokeWidth="1"
        />
        <path 
          d="M50,55 L45,60 L50,65 L55,60 Z" 
          fill="none" 
          stroke="#2196F3" 
          strokeWidth="1"
        />
      </g>
      
      {/* Text Label */}
      <text 
        x="50" 
        y="95" 
        fontFamily="Arial" 
        fontSize="10" 
        fontWeight="bold" 
        textAnchor="middle" 
        fill="#2196F3"
      >
        SECURITY
      </text>
    </svg>
  );
};

export default SecurityFirstIcon; 