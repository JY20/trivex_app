import React from 'react';

interface WBTCIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const WBTCIcon: React.FC<WBTCIconProps> = ({ width = 50, height = 50, className = '' }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={width} 
      height={height} 
      viewBox="0 0 80 80"
      className={className}
    >
      {/* Simple circular background */}
      <circle cx="40" cy="40" r="38" fill="#F7931A" />
      
      {/* Simple B symbol */}
      <path
        d="M47,33.5 C47,28 42,26 37,26 L29,26 L29,33.5 L37,33.5 C39,33.5 40,34.5 40,36 C40,37.5 39,38.5 37,38.5 L29,38.5 L29,46 L37,46 C39,46 40,47 40,48.5 C40,50 39,51 37,51 L29,51 L29,54 L37,54 C42,54 47,52 47,46.5 C47,43 45,41 42,40 C45,39 47,37 47,33.5 Z"
        fill="#FFFFFF"
      />
      
      {/* W badge */}
      <g>
        <circle cx="58" cy="22" r="15" fill="#FFFFFF" />
        <text
          x="58"
          y="27"
          fontFamily="Arial, sans-serif"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
          fill="#F7931A"
        >
          W
        </text>
      </g>
    </svg>
  );
};

export default WBTCIcon; 