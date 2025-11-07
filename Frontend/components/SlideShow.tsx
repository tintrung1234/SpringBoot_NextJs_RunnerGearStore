'use client';

import React, { useState, useEffect } from 'react';
import './SlideShow.css';
import axios from 'axios';

interface Banner {
  imageUrl: string;
}

export default function SlideShow() {
  const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [banners, setBanners] = useState<Banner[]>([]);

  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${DOMAIN}/api/banner`);
      if (Array.isArray(res.data)) {
        setBanners(res.data);
      } else {
        setBanners([]);
      }
    } catch (err) {
      console.error('Fetch banners failed', err);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        banners.length > 0 ? (prevIndex + 1) % banners.length : 0
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div
      data-aos="fade-up"
      data-aos-duration="600"
      data-aos-easing="ease-in-out"
      className="relative w-full slideshow mt-17 rounded-2xl"
    >
      <div className="relative w-full h-[20vh] sm:h-[20vh] md:h-[40vh] lg:h-[60vh] lg:h-[80vh]">
        {banners.map((banner, index) => (
          <img
            key={index}
            src={banner.imageUrl}
            alt={`Slide ${index + 1}`}
            className={`absolute top-0 left-0 w-full object-cover h-full rounded-[2vw] transition-opacity duration-500 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              index === currentIndex ? 'bg-white' : 'bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
