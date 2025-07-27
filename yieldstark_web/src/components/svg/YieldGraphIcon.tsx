import React from 'react';

interface YieldGraphIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const YieldGraphIcon: React.FC<YieldGraphIconProps> = ({ width = 80, height = 80, className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 200 200"
      className={className}
    >
      {/* Background */}
      <rect x="10" y="10" width="180" height="180" rx="10" fill="#f5f5f5" opacity="0.1" />
      
      {/* Grid Lines */}
      <g stroke="#555555" strokeWidth="0.5" opacity="0.5">
        <line x1="10" y1="50" x2="190" y2="50" />
        <line x1="10" y1="90" x2="190" y2="90" />
        <line x1="10" y1="130" x2="190" y2="130" />
        <line x1="10" y1="170" x2="190" y2="170" />
        
        <line x1="50" y1="10" x2="50" y2="190" />
        <line x1="90" y1="10" x2="90" y2="190" />
        <line x1="130" y1="10" x2="130" y2="190" />
        <line x1="170" y1="10" x2="170" y2="190" />
      </g>
      
      {/* Axes */}
      <line x1="30" y1="170" x2="180" y2="170" stroke="#ffffff" strokeWidth="2" />
      <line x1="30" y1="170" x2="30" y2="30" stroke="#ffffff" strokeWidth="2" />
      
      {/* Primary Growth Line */}
      <path
        d="M30,150 C60,140 80,110 100,90 C120,70 140,60 180,30"
        fill="none"
        stroke="#4CAF50"
        strokeWidth="3"
      />
      
      {/* Secondary Growth Line */}
      <path
        d="M30,160 C70,150 100,130 130,120 C160,110 170,80 180,60"
        fill="none"
        stroke="#2196F3"
        strokeWidth="3"
        strokeDasharray="5,5"
      />
      
      {/* Data Points */}
      <circle cx="30" cy="150" r="4" fill="#4CAF50" />
      <circle cx="60" cy="140" r="4" fill="#4CAF50" />
      <circle cx="100" cy="90" r="4" fill="#4CAF50" />
      <circle cx="140" cy="60" r="4" fill="#4CAF50" />
      <circle cx="180" cy="30" r="4" fill="#4CAF50" />
      
      {/* Arrow */}
      <polygon points="180,25 185,30 175,30" fill="#4CAF50" />
    </svg>
  );
};

export default YieldGraphIcon; 