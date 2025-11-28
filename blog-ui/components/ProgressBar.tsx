"use client";

import { useEffect, useState } from 'react';

export default function ProgressBar() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const percent = (scrollTop / scrollHeight) * 100;
      setWidth(percent);
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[10000]">
      <div 
        className="h-full bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400 transition-all duration-100 ease-out shadow-[0_0_10px_rgba(0,0,0,0.2)] dark:shadow-[0_0_10px_rgba(255,255,255,0.2)]"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
