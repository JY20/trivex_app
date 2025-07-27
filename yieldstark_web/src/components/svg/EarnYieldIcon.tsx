import React from 'react';

interface EarnYieldIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const EarnYieldIcon: React.FC<EarnYieldIconProps> = ({ width = 70, height = 70, className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 100 100"
      className={className}
    >
      {/* Background Circle */}
      <circle cx="50" cy="50" r="45" fill="#E8F5E9" />
      
      {/* Money Bag */}
      <path 
        d="M35,45 C35,35 45,30 50,30 C55,30 65,35 65,45 C65,65 55,75 50,75 C45,75 35,65 35,45 Z" 
        fill="#FFFFFF" 
        stroke="#4CAF50" 
        strokeWidth="2"
      />
      
      {/* Money Bag Tie */}
      <path 
        d="M40,35 L60,35" 
        stroke="#4CAF50" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      
      {/* Dollar Symbol */}
      <path 
        d="M50,45 L50,65 M45,50 L55,50 M45,60 L55,60" 
        stroke="#4CAF50" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
      
      {/* Coin Stack */}
      <ellipse 
        cx="25" 
        cy="60" 
        rx="10" 
        ry="5" 
        fill="#FFC107" 
      />
      <ellipse 
        cx="25" 
        cy="57" 
        rx="10" 
        ry="5" 
        fill="#FFC107" 
        opacity="0.9"
      />
      <ellipse 
        cx="25" 
        cy="54" 
        rx="10" 
        ry="5" 
        fill="#FFC107" 
        opacity="0.8"
      />
      
      {/* Growth Arrow */}
      <path 
        d="M70,60 L70,40 L50,40" 
        fill="none" 
        stroke="#4CAF50" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M55,45 L70,40 L65,55" 
        fill="none" 
        stroke="#4CAF50" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Sparkles */}
      <circle cx="75" cy="30" r="2" fill="#FFD700" />
      <circle cx="80" cy="35" r="1" fill="#FFD700" />
      <circle cx="70" cy="25" r="1.5" fill="#FFD700" />
      
      {/* Text Label */}
      <text 
        x="50" 
        y="90" 
        fontFamily="Arial, sans-serif" 
        fontSize="10" 
        fontWeight="bold" 
        textAnchor="middle" 
        fill="#4CAF50"
      >
        EARN YIELD
      </text>
    </svg>
  );
};

export default EarnYieldIcon; 