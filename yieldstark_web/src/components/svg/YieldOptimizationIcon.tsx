import React from 'react';

interface YieldOptimizationIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const YieldOptimizationIcon: React.FC<YieldOptimizationIconProps> = ({ width = 60, height = 60, className = '' }) => {
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
        <linearGradient id="yieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#4CAF50" stopOpacity="0.1" />
        </linearGradient>
        <filter id="yieldShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>
      
      {/* Background Circle */}
      <circle cx="50" cy="50" r="45" fill="url(#yieldGradient)" />
      
      {/* Chart Base */}
      <rect x="20" y="65" width="60" height="2" rx="1" fill="#444" />
      <rect x="20" y="25" width="2" height="40" rx="1" fill="#444" />
      
      {/* Chart Bars */}
      <rect x="25" y="55" width="8" height="10" rx="1" fill="#4CAF50" opacity="0.7" />
      <rect x="37" y="45" width="8" height="20" rx="1" fill="#4CAF50" opacity="0.8" />
      <rect x="49" y="35" width="8" height="30" rx="1" fill="#4CAF50" opacity="0.9" />
      <rect x="61" y="25" width="8" height="40" rx="1" fill="#4CAF50" />
      
      {/* Growth Arrow */}
      <path 
        d="M20,40 Q35,35 50,25 T80,15" 
        fill="none" 
        stroke="#4CAF50" 
        strokeWidth="3" 
        strokeLinecap="round"
        filter="url(#yieldShadow)"
      />
      
      {/* Arrow Head */}
      <polygon 
        points="72,12 80,15 77,23" 
        fill="#4CAF50" 
        filter="url(#yieldShadow)"
      />
      
      {/* Sparkles */}
      <circle cx="30" cy="35" r="2" fill="#fff" opacity="0.7" />
      <circle cx="50" cy="25" r="2" fill="#fff" opacity="0.7" />
      <circle cx="70" cy="15" r="2" fill="#fff" opacity="0.7" />
      
      {/* Dollar Symbol */}
      <text 
        x="50" 
        y="80" 
        fontFamily="Arial" 
        fontSize="14" 
        fontWeight="bold" 
        textAnchor="middle" 
        fill="#4CAF50"
      >
        YIELD
      </text>
    </svg>
  );
};

export default YieldOptimizationIcon; 