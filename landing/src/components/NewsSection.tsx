import React from 'react';
import './NewsSection.css';
import k2Image from '../assets/k2.jpg';

const NewsSection: React.FC = () => {
  return (
    <section className="news-section">
      <div className="container">
        <div className="news-layout">
          <div className="section-title">
            <h2>Latest News</h2>
            <p>Stay updated with Kavodax's latest achievements and announcements</p>
          </div>
          
          <div className="news-container">
            <div className="news-card">
              <div className="news-image">
                <img src={k2Image} alt="Kavodax at CodeLaunch Accelerator Finals" />
              </div>
              <div className="news-content">
                <div className="news-date">May 22, 2025</div>
                <h3 className="news-headline">Kavodax is on fire! WE'RE GOING TO THE FINALS! The TOP 6 STARTUPS selected from across CANADA!🔥</h3>
                <a 
                  href="https://www.linkedin.com/posts/kavodax_torontotechweek-underserved-underbanked-activity-7331328961471238144-q26G/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-secondary"
                >
                  Read More
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsSection; 