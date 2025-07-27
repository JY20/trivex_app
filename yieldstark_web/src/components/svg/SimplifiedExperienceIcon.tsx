import React from 'react';

interface SimplifiedExperienceIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const SimplifiedExperienceIcon: React.FC<SimplifiedExperienceIconProps> = ({ width = 60, height = 60, className = '' }) => {
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
        <linearGradient id="automationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF9800" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#FF9800" stopOpacity="0.1" />
        </linearGradient>
        <filter id="automationShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>
      
      {/* Background Circle */}
      <circle cx="50" cy="50" r="45" fill="url(#automationGradient)" />
      
      {/* One-Click Concept */}
      <circle 
        cx="50" 
        cy="50" 
        r="22" 
        fill="#FFF" 
        stroke="#FF9800" 
        strokeWidth="2" 
        filter="url(#automationShadow)" 
      />
      
      {/* Check Mark */}
      <path 
        d="M40,50 L45,55 L60,40" 
        fill="none" 
        stroke="#FF9800" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Orbit Elements */}
      <g opacity="0.8">
        <ellipse 
          cx="50" 
          cy="50" 
          rx="35" 
          ry="15" 
          fill="none" 
          stroke="#FF9800" 
          strokeWidth="1" 
          strokeDasharray="3,2" 
          transform="rotate(30, 50, 50)" 
        />
        
        <circle cx="85" cy="50" r="3" fill="#FF9800" />
        <circle cx="15" cy="50" r="3" fill="#FF9800" />
        
        <ellipse 
          cx="50" 
          cy="50" 
          rx="35" 
          ry="15" 
          fill="none" 
          stroke="#FF9800" 
          strokeWidth="1" 
          strokeDasharray="3,2" 
          transform="rotate(-30, 50, 50)" 
        />
        
        <circle cx="50" cy="15" r="3" fill="#FF9800" />
        <circle cx="50" cy="85" r="3" fill="#FF9800" />
      </g>
      
      {/* Text Label */}
      <text 
        x="50" 
        y="85" 
        fontFamily="Arial" 
        fontSize="10" 
        fontWeight="bold" 
        textAnchor="middle" 
        fill="#FF9800"
      >
        SIMPLIFIED
      </text>
    </svg>
  );
};

export default SimplifiedExperienceIcon; 