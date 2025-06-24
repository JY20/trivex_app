import React from 'react';
import './App.css';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import PartnerBanner from './components/PartnerBanner';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import TestimonialsSection from './components/TestimonialsSection';
import CtaSection from './components/CtaSection';
import NewsSection from './components/NewsSection';
import Footer from './components/Footer';
import { PopupProvider } from './context/PopupContext';

function App() {
  return (
    <PopupProvider>
      <div className="App">
        <Header />
        <main>
          <HeroSection />
          <PartnerBanner />
          <FeaturesSection />
          <HowItWorksSection />
          <TestimonialsSection />
          <CtaSection />
          <NewsSection />
        </main>
        <Footer />
      </div>
    </PopupProvider>
  );
}

export default App;
