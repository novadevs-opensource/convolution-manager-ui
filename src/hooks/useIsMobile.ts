// src/hooks/useIsMobile.ts
import { useState, useEffect } from 'react';

const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    // Incluye iPhone, iPad, Android y otros dispositivos móviles
    const mobileRegex = /Mobi|Android|iPhone|iPad/i;
    setIsMobile(mobileRegex.test(userAgent));
  }, []);

  return isMobile;
};

export default useIsMobile;
