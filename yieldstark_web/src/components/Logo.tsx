import React from 'react';
import logoImage from '../assets/logo.jpg';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

const Logo: React.FC<LogoProps> = ({ size = 'medium' }) => {
  const sizeMap = {
    small: { width: '30px', height: '30px' },
    medium: { width: '40px', height: '40px' },
    large: { width: '60px', height: '60px' },
  };

  const styles = {
    container: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
    },
    logoImage: {
      width: sizeMap[size].width,
      height: sizeMap[size].height,
      borderRadius: '8px',
      objectFit: 'cover' as const,
    },
    text: {
      fontWeight: 'bold' as const,
      fontSize: size === 'small' ? '14px' : size === 'medium' ? '18px' : '24px',
      color: 'white',
    }
  };

  return (
    <div style={styles.container}>
      <img src={logoImage} alt="YieldStark Logo" style={styles.logoImage} />
      <div style={styles.text}>YieldStark</div>
    </div>
  );
};

export default Logo; 