import { useState, useEffect } from 'react';

const images = [
  'https://ossireland.ie/wp-content/uploads/2019/10/Pest-Control-Banner.jpg',
  'https://i.postimg.cc/kGYDtvzw/Pest-Control-4.jpg',
  'https://precisionteachingresource.net/wp-content/uploads/2025/02/side-view-of-pest-control-worker-spraying-pesticid-2024-11-17-14-09-44-utc-1.jpg'
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full h-full">
      {images.map((image, index) => (
        <div
          key={index}
          className={`hero-slide absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${image})`
          }}
        />
      ))}
      
      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-opacity ${
              index === currentSlide ? 'bg-white opacity-100' : 'bg-white opacity-50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
