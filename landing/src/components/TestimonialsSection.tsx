import React, { useState } from 'react';
import './TestimonialsSection.css';
import t1Image from '../assets/t1.jpg';
import t2Image from '../assets/t2.jpeg';
import t3Image from '../assets/t3.jpg';

const TestimonialsSection: React.FC = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  const handleVideoClick = () => {
    setIsVideoPlaying(true);
  };
  
  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="section-title">
          <h2>Customer Testimonials</h2>
          <p className="subtitle">See our products in <span className="highlight">action</span></p>
        </div>
        
        <div className="testimonials-grid">
          {/* Image testimonial - left column */}
          <div className="testimonial-image">
            <div className="image-placeholder customer-1" style={{ backgroundImage: `url(${t1Image})` }}></div>
          </div>
          
          {/* Center video testimonial - YouTube embed */}
          <div className="testimonial-video">
            <div className="youtube-embed">
              <iframe 
                src={`https://www.youtube.com/embed/dQw4w9WgXcQ${isVideoPlaying ? '?autoplay=1' : ''}`}
                title="See Kavodax in Action"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              {!isVideoPlaying && (
                <div className="video-overlay" onClick={handleVideoClick}>
                  <div className="play-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ffffff">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <p className="video-label">See Kavodax in Action</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Image testimonial - right column */}
          <div className="testimonial-image">
            <div className="image-placeholder customer-2" style={{ backgroundImage: `url(${t2Image})` }}></div>
          </div>
          
          {/* Text testimonial 1 */}
          <div className="testimonial-card">
            <p className="testimonial-text">
              "Kavodax has revolutionized how we handle international payments. We've cut our transfer fees by <a href="https://kavodax.gitbook.io/kavodax-docs/3.-solution" className="underline">85%</a> and now complete transactions in minutes instead of days."
            </p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">JM</div>
              <div className="testimonial-info">
                <h4>John Mitchell</h4>
                <p>CFO, TechGlobal Inc.</p>
              </div>
            </div>
          </div>
          
          {/* Image testimonial - small */}
          <div className="testimonial-image small">
            <div className="image-placeholder customer-3" style={{ backgroundImage: `url(${t3Image})` }}></div>
          </div>
          
          {/* Text testimonial 2 - wider */}
          <div className="testimonial-image wide-medium">
            <div className="testimonial-card blue-card">
              <p className="testimonial-text">
                "The transparency of Kavodax's platform gives us peace of mind. We can track every payment in real-time, and our partners receive funds faster than ever before. Their customer support team is also incredibly responsive and helpful."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">SP</div>
                <div className="testimonial-info">
                  <h4>Sarah Patel</h4>
                  <p>Operations Director, Global Trade</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Text testimonial 3 - wider */}
          <div className="testimonial-image wide">
            <div className="testimonial-card small-card">
              <p className="testimonial-text">
                "As a small business owner, Kavodax saved us thousands in fees annually while making our payment process more efficient. The platform is intuitive and the customer service is exceptional whenever we have questions."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">RL</div>
                <div className="testimonial-info">
                  <h4>Robert Lee</h4>
                  <p>CEO, Maple Imports Ltd.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 