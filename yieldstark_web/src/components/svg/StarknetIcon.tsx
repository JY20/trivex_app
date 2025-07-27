import React from 'react';

interface StarknetIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const StarknetIcon: React.FC<StarknetIconProps> = ({ width = 60, height = 60, className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 200 200"
      className={className}
    >
      {/* Starknet-inspired hexagon */}
      <g transform="translate(100, 100)">
        {/* Outer hexagon */}
        <path
          d="M86.6,50 L0,100 L-86.6,50 L-86.6,-50 L0,-100 L86.6,-50 Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
        />
        
        {/* Inner hexagon */}
        <path
          d="M60.6,35 L0,70 L-60.6,35 L-60.6,-35 L0,-70 L60.6,-35 Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          opacity="0.7"
        />
        
        {/* Center hexagon */}
        <path
          d="M34.6,20 L0,40 L-34.6,20 L-34.6,-20 L0,-40 L34.6,-20 Z"
          fill="#ffffff"
          opacity="0.3"
        />
        
        {/* Connecting lines */}
        <line x1="0" y1="-40" x2="0" y2="-100" stroke="#ffffff" strokeWidth="2" />
        <line x1="34.6" y1="-20" x2="86.6" y2="-50" stroke="#ffffff" strokeWidth="2" />
        <line x1="34.6" y1="20" x2="86.6" y2="50" stroke="#ffffff" strokeWidth="2" />
        <line x1="0" y1="40" x2="0" y2="100" stroke="#ffffff" strokeWidth="2" />
        <line x1="-34.6" y1="20" x2="-86.6" y2="50" stroke="#ffffff" strokeWidth="2" />
        <line x1="-34.6" y1="-20" x2="-86.6" y2="-50" stroke="#ffffff" strokeWidth="2" />
        
        {/* ZK proof representation */}
        <circle cx="0" cy="0" r="10" fill="#ffffff" opacity="0.8" />
        
        {/* Data points */}
        <circle cx="0" cy="-100" r="5" fill="#ffffff" />
        <circle cx="86.6" cy="-50" r="5" fill="#ffffff" />
        <circle cx="86.6" cy="50" r="5" fill="#ffffff" />
        <circle cx="0" cy="100" r="5" fill="#ffffff" />
        <circle cx="-86.6" cy="50" r="5" fill="#ffffff" />
        <circle cx="-86.6" cy="-50" r="5" fill="#ffffff" />
      </g>
    </svg>
  );
};

export default StarknetIcon; 