import React from 'react';
import './App.css';
import Logo from './components/Logo';
import Navbar from './components/Navbar';
import AnimatedBackground from './components/AnimatedBackground';
import useScrollToSection from './hooks/useScrollToSection';
import WaveBackground from './components/svg/WaveBackground';
import HeroVisual from './components/HeroVisual';
import './components/HeroVisual.css';
import YieldOptimizationIcon from './components/svg/YieldOptimizationIcon';
import SimplifiedExperienceIcon from './components/svg/SimplifiedExperienceIcon';
import SecurityFirstIcon from './components/svg/SecurityFirstIcon';
import LowGasIcon from './components/svg/LowGasIcon';

function App() {
  const scrollToSection = useScrollToSection();

  const handleFooterLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    scrollToSection(sectionId);
  };

  return (
    <div className="App">
      <header className="App-header" role="banner">
        <Navbar />
        <div className="container tagline-container">
          <p className="tagline">Smart WBTC yield automation on Starknet</p>
        </div>
      </header>
      
      <main role="main">
        <section className="hero" id="home" aria-labelledby="hero-heading">
          <div className="hero-background">
            <AnimatedBackground />
          </div>
          <div className="container">
            <div className="hero-content">
              <div className="hero-text">
                <h1 id="hero-heading" className="h2-style">Maximize Your Crypto Returns</h1>
                <p>Deposit once, earn more through intelligent rebalancing across <a href="https://vesu.xyz" target="_blank" rel="noopener noreferrer">@vesuxyz</a> and <a href="https://ekubo.org" target="_blank" rel="noopener noreferrer">@EkuboProtocol</a></p>
                <button className="cta-button" onClick={() => scrollToSection('features')} aria-label="Get Started with YieldStark">Get Started</button>
              </div>
              <div className="hero-visual-container" aria-hidden="true">
                <HeroVisual />
              </div>
            </div>
          </div>
          <div className="wave-container">
            <WaveBackground />
          </div>
        </section>
        
        <section className="features" id="features" aria-labelledby="features-heading">
          <div className="container">
            <h2 id="features-heading">Why Choose YieldStark</h2>
            <div className="feature-grid">
              <article className="feature">
                <YieldOptimizationIcon width={80} height={80} className="feature-icon" aria-hidden="true" />
                <h3>Smart Yield Optimization</h3>
                <p>Intelligent rebalancing of your WBTC across multiple protocols for maximum returns</p>
              </article>
              <article className="feature">
                <SimplifiedExperienceIcon width={80} height={80} className="feature-icon" aria-hidden="true" />
                <h3>Simplified Experience</h3>
                <p>Deposit once and let our automation handle the rest - no need for manual rebalancing</p>
              </article>
              <article className="feature">
                <SecurityFirstIcon width={80} height={80} className="feature-icon" aria-hidden="true" />
                <h3>Security First</h3>
                <p>Built with security as a priority, leveraging the safety of Starknet's ZK infrastructure</p>
              </article>
              <article className="feature">
                <LowGasIcon width={80} height={80} className="feature-icon" aria-hidden="true" />
                <h3>Low Gas Fees</h3>
                <p>Benefit from Starknet's Layer 2 scaling with minimal transaction costs for yield optimization</p>
              </article>
            </div>
          </div>
        </section>
        
        <section className="how-it-works" id="how-it-works" aria-labelledby="how-it-works-heading">
          <div className="container">
            <h2 id="how-it-works-heading">How It Works</h2>
            <div className="process-flow">
              <div className="process-step">
                <div className="step-visual" aria-hidden="true">
                  <div className="step-circle">
                    <span>1</span>
                  </div>
                  <div className="step-icon-container">
                    <i className="fa-solid fa-wallet"></i>
                  </div>
                </div>
                <div className="step-content">
                  <h3>Connect Wallet</h3>
                  <p>Connect your Starknet wallet to our platform with a single click. We support all major Starknet wallets for a seamless connection experience.</p>
                </div>
              </div>
              
              <div className="flow-arrow" aria-hidden="true">
                <i className="fa-solid fa-chevron-down"></i>
              </div>
              
              <div className="process-step">
                <div className="step-visual" aria-hidden="true">
                  <div className="step-circle">
                    <span>2</span>
                  </div>
                  <div className="step-icon-container deposit-icon">
                    <i className="fa-solid fa-coins"></i>
                  </div>
                </div>
                <div className="step-content">
                  <h3>Deposit WBTC</h3>
                  <p>Make a single deposit of your WBTC into our smart vault. Your assets remain secure while our protocol manages them for optimal returns.</p>
                </div>
              </div>
              
              <div className="flow-arrow" aria-hidden="true">
                <i className="fa-solid fa-chevron-down"></i>
              </div>
              
              <div className="process-step">
                <div className="step-visual" aria-hidden="true">
                  <div className="step-circle">
                    <span>3</span>
                  </div>
                  <div className="step-icon-container earn-icon">
                    <i className="fa-solid fa-chart-line"></i>
                  </div>
                </div>
                <div className="step-content">
                  <h3>Earn Optimized Yield</h3>
                  <p>Our protocol automatically rebalances your assets between Vesu and Ekubo protocols to maximize your returns based on market conditions.</p>
                </div>
              </div>
              
              <div className="process-highlight">
                <div className="highlight-bubble">
                  <i className="fa-solid fa-robot" aria-hidden="true"></i>
                  <span>Automated Rebalancing</span>
                </div>
                <div className="highlight-bubble">
                  <i className="fa-solid fa-lock" aria-hidden="true"></i>
                  <span>Secure Storage</span>
                </div>
                <div className="highlight-bubble">
                  <i className="fa-solid fa-hand-holding-dollar" aria-hidden="true"></i>
                  <span>Maximum Yield</span>
                </div>
              </div>
            </div>
          </div>
          <div className="wave-container wave-bottom">
            <WaveBackground />
          </div>
        </section>
      </main>
      
      <footer id="contact" role="contentinfo">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <Logo size="small" />
              <p>© {new Date().getFullYear()} YieldStark. All rights reserved.</p>
            </div>
            <nav className="footer-links" aria-label="Footer Navigation">
              <h3>Links</h3>
              <ul>
                <li><a href="#home" onClick={(e) => handleFooterLinkClick(e, 'home')}>Home</a></li>
                <li><a href="#features" onClick={(e) => handleFooterLinkClick(e, 'features')}>Features</a></li>
                <li><a href="#how-it-works" onClick={(e) => handleFooterLinkClick(e, 'how-it-works')}>How It Works</a></li>
                <li><a href="#docs">Documentation</a></li>
              </ul>
            </nav>
            <div className="footer-social">
              <h3>Connect</h3>
              <div className="social-icons">
                <a href="https://x.com/YieldStark" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <i className="fa-brands fa-x-twitter" aria-hidden="true"></i> Twitter
                </a>
                <a href="mailto:yieldstark@gmail.com" aria-label="Email">
                  <i className="fa-regular fa-envelope" aria-hidden="true"></i> Email
                </a>
                <a href="https://github.com/YieldStark" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <i className="fa-brands fa-github" aria-hidden="true"></i> GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
