import { useEffect, useRef, useState } from 'react';
import './History.css';

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
              <h2>History {2024 - index}</h2>
              <p>Search your old memories...</p>
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

export default function History() {
  return (
    <div className="cinema-only-root">
      <div className="carousel-top-line" />

      <div className="page-content">
        <div className="cinema-carousels-container left-shift">
          <CinemaCarousel />
          <CinemaCarousel />
        </div>
      </div>
    </div>
  );
}
