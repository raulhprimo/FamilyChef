import { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import LandingPageMobile from './LandingPageMobile';

const MOBILE_BREAKPOINT = 768;

export default function LandingRouter() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <LandingPageMobile /> : <LandingPage />;
}
