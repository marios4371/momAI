import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Blog.css';

function CinemaCarousel() {
  const totalSlides = 3;
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef(null);
  const viewportRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      if (trackRef.current && viewportRef.current) {
        const w = viewportRef.current.offsetWidth;
        trackRef.current.style.transform = `translateX(-${currentIndex * w}px)`;
      }
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [currentIndex]);

  const goToSlide = (index) => {
    clearInterval(intervalRef.current);
    setCurrentIndex(index);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 4000);
  };

  return (
    <div className="cinema-carousel-viewport" ref={viewportRef}>
      <div className="cinema-carousel-track" ref={trackRef}>
        {[...Array(totalSlides)].map((_, index) => (
          <div key={index} className="cinema-slide">
            <div className="slide-content">
              <h2>Slide {index + 1}</h2>
              <p>Explore different ways of parenting</p>
            </div>
          </div>
        ))}
      </div>

      <div className="carousel-indicators">
        {[...Array(totalSlides)].map((_, index) => (
          <div
            key={index}
            className={`indicator ${currentIndex === index ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default function Blog() {
  const [rightOpen, setRightOpen] = useState(false);

  const toggleRight = (e) => {
    // prevent overlay click propagation if any
    e && e.stopPropagation && e.stopPropagation();
    setRightOpen((v) => !v);
  };

  return (
    <div className={`cinema-only-root ${rightOpen ? 'right-open' : ''}`}>
      <div className="carousel-top-line" />

      {/* big right arrow */}
      <button
        className={`right-toggle ${rightOpen ? 'open' : ''}`}
        onClick={toggleRight}
        aria-label={rightOpen ? 'Close menu' : 'Open menu'}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M15 6 L9 12 L15 18"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </button>

      {/* overlay for click-to-close */}
      <div
        className={`right-menu-overlay ${rightOpen ? 'visible' : ''}`}
        onClick={() => setRightOpen(false)}
        aria-hidden={!rightOpen}
      />

      <aside className={`right-theme-menu ${rightOpen ? 'open' : ''}`}>
        <div className="right-menu-inner">
          <h3>Marios Kalogerakis</h3>
          <ul>
            <li>
              <Link to="/" onClick={() => setRightOpen(false)}>
                Posts
              </Link>
            </li>
            <li>
              <Link to="/blog" onClick={() => setRightOpen(false)}>
                Upload
              </Link>
            </li>
            <li>
              <Link to="/auth" onClick={() => setRightOpen(false)}>
                Settings
              </Link>
            </li>
          </ul>
        </div>
      </aside>

      <div
        className="page-content"
        onClick={() => rightOpen && setRightOpen(false)}
      >
        <div className="cinema-carousels-container left-shift">
          <CinemaCarousel />
          <CinemaCarousel />
        </div>
      </div>
    </div>
  );
}
