import React from 'react';

interface LowGasIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const LowGasIcon: React.FC<LowGasIconProps> = ({ width = 60, height = 60, className = '' }) => {
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
        <linearGradient id="gasGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9C27B0" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#9C27B0" stopOpacity="0.1" />
        </linearGradient>
        <filter id="gasShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>
      
      {/* Background Circle */}
      <circle cx="50" cy="50" r="45" fill="url(#gasGradient)" />
      
      {/* Gas Pump */}
      <path 
        d="M30,30 L30,75 L60,75 L60,30 Z" 
        fill="#FFF" 
        stroke="#9C27B0" 
        strokeWidth="2"
        filter="url(#gasShadow)"
      />
      
      {/* Gas Pump Top */}
      <path 
        d="M25,30 L65,30 L65,25 L25,25 Z" 
        fill="#FFF" 
        stroke="#9C27B0" 
        strokeWidth="2"
      />
      
      {/* Gas Nozzle */}
      <path 
        d="M60,45 L75,45 L75,60 L70,60" 
        fill="none" 
        stroke="#9C27B0" 
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Dollar Symbol */}
      <text 
        x="45" 
        y="55" 
        fontFamily="Arial" 
        fontSize="24" 
        fontWeight="bold" 
        textAnchor="middle" 
        fill="#9C27B0"
      >
        $
      </text>
      
      {/* Down Arrow */}
      <path 
        d="M45,50 L45,65 M40,60 L45,65 L50,60" 
        fill="none" 
        stroke="#9C27B0" 
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Sparkles */}
      <circle cx="75" cy="30" r="2" fill="#9C27B0" opacity="0.7" />
      <circle cx="70" cy="25" r="1" fill="#9C27B0" opacity="0.5" />
      <circle cx="80" cy="35" r="1.5" fill="#9C27B0" opacity="0.6" />
      
      {/* Text Label */}
      <text 
        x="50" 
        y="90" 
        fontFamily="Arial" 
        fontSize="10" 
        fontWeight="bold" 
        textAnchor="middle" 
        fill="#9C27B0"
      >
        LOW GAS
      </text>
    </svg>
  );
};

export default LowGasIcon; 