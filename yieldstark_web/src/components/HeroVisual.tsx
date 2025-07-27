import React from 'react';

interface HeroVisualProps {
  className?: string;
}

const HeroVisual: React.FC<HeroVisualProps> = ({ className = '' }) => {
  return (
    <div className={`hero-visual ${className}`}>
      {/* 3D-style platform with WBTC */}
      <div className="platform">
        <div className="wbtc-coin">
          <div className="wbtc-front">
            <span className="bitcoin-symbol">₿</span>
            <span className="wbtc-label">WBTC</span>
          </div>
          <div className="wbtc-side"></div>
          <div className="wbtc-shine"></div>
        </div>
        <div className="platform-shadow"></div>
      </div>
      
      {/* Flow lines representing yield movement */}
      <div className="flow-lines">
        <div className="flow-line flow-line-1"></div>
        <div className="flow-line flow-line-2"></div>
        <div className="flow-line flow-line-3"></div>
      </div>
      
      {/* Protocol nodes */}
      <div className="protocol-nodes">
        <div className="protocol-node vesu-node">
          <span className="protocol-label">Vesu</span>
        </div>
        <div className="protocol-node ekubo-node">
          <span className="protocol-label">Ekubo</span>
        </div>
      </div>
      
      {/* Yield particles */}
      <div className="yield-particles">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
      </div>
      
      {/* Rebalancing arrow */}
      <div className="rebalance-arrow">
        <div className="arrow-body"></div>
        <div className="arrow-head"></div>
      </div>
    </div>
  );
};

export default HeroVisual; 