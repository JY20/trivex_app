import React, { useEffect, useState, useRef } from 'react';
import './PartnerBanner.css';

// Import partner logos
import acceleratorCentreLogo from '../assets/partners/Accelerator Centre.png';
import marsLogo from '../assets/partners/MaRS discovery District.png';
import oslerLogo from '../assets/partners/Osler Law Firm.webp';
import bitsLogo from '../assets/partners/BITS (Business in The Streets).png';
import ySpaceLogo from '../assets/partners/Y Space.png';
import googleStartupsLogo from '../assets/partners/Google for Startups.png';
import ventureForCanadaLogo from '../assets/partners/Venture for Canada.png';
import riipenLogo from '../assets/partners/RiiPen.png';
import growClassLogo from '../assets/partners/Grow Class.png';
import codeLaunchLogo from '../assets/partners/CodeLaunch Accelerate.webp';
import postHogLogo from '../assets/partners/PostHog.png';
import ovhCloudLogo from '../assets/partners/OVHCloud.png';
import mldSolutionsLogo from '../assets/partners/MLD Solutions.png';
import yellowcardLogo from '../assets/partners/Yellowcard.svg';
import portalHQLogo from '../assets/partners/PortalHQ.png';

// Create SVG data URLs for missing partners
const createSvgLogo = (name: string, color: string = '#4A90E2') => {
  const nameInitials = name.split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="150" height="80" viewBox="0 0 150 80">
      <rect width="150" height="80" fill="#f8f9fa" rx="4" ry="4"/>
      <text x="75" y="45" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" fill="${color}">${nameInitials}</text>
      <text x="75" y="65" font-family="Arial" font-size="10" text-anchor="middle" fill="#333">${name}</text>
    </svg>
  `)}`;
};

// Partner list with their logos
const partners = [
  { 
    name: 'Accelerator Centre', 
    logo: acceleratorCentreLogo
  },
  { 
    name: 'MaRS Discovery District', 
    logo: marsLogo
  },
  { 
    name: 'Osler Law Firm', 
    logo: oslerLogo
  },
  { 
    name: 'BITS', 
    logo: bitsLogo
  },
  { 
    name: 'Y Space', 
    logo: ySpaceLogo
  },
  { 
    name: 'Google for Startups', 
    logo: googleStartupsLogo
  },
  { 
    name: 'Venture for Canada', 
    logo: ventureForCanadaLogo
  },
  // { 
  //   name: 'RiiPen', 
  //   logo: riipenLogo
  // },
  // { 
  //   name: 'Grow Class', 
  //   logo: growClassLogo
  // },
  { 
    name: 'CodeLaunch', 
    logo: codeLaunchLogo
  },
  // { 
  //   name: 'PostHog', 
  //   logo: postHogLogo
  // },
  { 
    name: 'OVHCloud', 
    logo: ovhCloudLogo
  },
  // { 
  //   name: 'MLD Solutions', 
  //   logo: mldSolutionsLogo
  // },
  // { 
  //   name: 'Yellowcard', 
  //   logo: yellowcardLogo
  // },
  { 
    name: 'PortalHQ', 
    logo: portalHQLogo
  }
];

const PartnerBanner: React.FC = () => {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const logosContainerRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Set up the animation for right-to-left movement
    if (logosContainerRef.current && bannerRef.current) {
      // Create the keyframes for the animation if they don't exist yet
      if (!document.getElementById('scrollBannerKeyframes')) {
        const style = document.createElement('style');
        style.id = 'scrollBannerKeyframes';
        style.innerHTML = `
          @keyframes scrollRightToLeft {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }
        `;
        document.head.appendChild(style);
      }
      
      // Calculate animation duration based on content width
      // Slower speed = longer duration
      const speed = 40; // pixels per second - adjust this for speed
      const contentWidth = logosContainerRef.current.scrollWidth / 2;
      const duration = contentWidth / speed;
      
      // Apply the animation
      logosContainerRef.current.style.animation = `scrollRightToLeft ${duration}s linear infinite`;
    }
    
    // Handle window resize
    const handleResize = () => {
      if (logosContainerRef.current) {
        const contentWidth = logosContainerRef.current.scrollWidth / 2;
        const speed = 40; // pixels per second
        const duration = contentWidth / speed;
        logosContainerRef.current.style.animation = `scrollRightToLeft ${duration}s linear infinite`;
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleImageError = (name: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null;
    
    // Mark this image as failed
    setFailedImages(prev => ({ ...prev, [name]: true }));
    
    // Apply fallback styling
    target.style.padding = '10px';
    target.style.backgroundColor = '#f0f0f0';
    
    // Create a text-based fallback
    const svgContent = encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="60">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" font-family="Arial" font-size="12" text-anchor="middle" dominant-baseline="middle" fill="#555">
          ${name}
        </text>
      </svg>
    `);
    
    target.src = `data:image/svg+xml;utf8,${svgContent}`;
  };

  // Create a duplicated array for continuous scrolling effect
  // We need to duplicate the partners to create a seamless loop
  const allPartners = [...partners, ...partners];

  return (
    <section className="partner-banner" ref={bannerRef}>
      <div className="container">
        <div className="partner-title">
          <h3>Supported By Channel Partners</h3>
        </div>
        <div className="partner-logos-container">
          <div className="partner-logos" ref={logosContainerRef}>
            {allPartners.map((partner, index) => (
              <div key={`${partner.name}-${index}`} className="partner-logo">
                {failedImages[partner.name] ? (
                  <div className="fallback-logo">
                    {partner.name}
                  </div>
                ) : (
                  <img 
                    src={partner.logo} 
                    alt={`${partner.name} logo`} 
                    className="logo-image"
                    onError={(e) => handleImageError(partner.name, e)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerBanner; 