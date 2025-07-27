import React from 'react';

interface AutomationIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const AutomationIcon: React.FC<AutomationIconProps> = ({ width = 70, height = 70, className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 200 200"
      className={className}
    >
      {/* Outer Circle */}
      <circle cx="100" cy="100" r="90" fill="none" stroke="#555555" strokeWidth="2" opacity="0.3" />
      
      {/* Inner Circle */}
      <circle cx="100" cy="100" r="70" fill="none" stroke="#555555" strokeWidth="2" opacity="0.5" />
      
      {/* Center Circle */}
      <circle cx="100" cy="100" r="15" fill="#333333" />
      
      {/* Gears */}
      <g>
        {/* Main Gear */}
        <circle cx="100" cy="100" r="40" fill="none" stroke="#555555" strokeWidth="3" />
        
        {/* Gear Teeth */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, index) => {
          const x1 = 100 + 40 * Math.cos(angle * Math.PI / 180);
          const y1 = 100 + 40 * Math.sin(angle * Math.PI / 180);
          const x2 = 100 + 50 * Math.cos(angle * Math.PI / 180);
          const y2 = 100 + 50 * Math.sin(angle * Math.PI / 180);
          
          return (
            <line 
              key={index}
              x1={x1} 
              y1={y1} 
              x2={x2} 
              y2={y2} 
              stroke="#555555" 
              strokeWidth="3" 
            />
          );
        })}
      </g>
      
      {/* Arrows for Rebalancing */}
      <g>
        {/* Arrow 1 */}
        <path
          d="M50,50 C30,70 30,130 50,150"
          fill="none"
          stroke="#2196F3"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <polygon points="50,40 55,55 45,55" fill="#2196F3" transform="rotate(-45, 50, 50)" />
        
        {/* Arrow 2 */}
        <path
          d="M150,50 C170,70 170,130 150,150"
          fill="none"
          stroke="#4CAF50"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <polygon points="150,40 155,55 145,55" fill="#4CAF50" transform="rotate(45, 150, 50)" />
      </g>
      
      {/* Small Nodes */}
      <circle cx="50" cy="50" r="8" fill="#2196F3" />
      <circle cx="50" cy="150" r="8" fill="#2196F3" />
      <circle cx="150" cy="50" r="8" fill="#4CAF50" />
      <circle cx="150" cy="150" r="8" fill="#4CAF50" />
    </svg>
  );
};

export default AutomationIcon; 