import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Listens to route changes via react-router-dom's useLocation hook
 * and automatically resets the scroll position to the top of the viewport.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset window scroll position instantly on route transition
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });

    // Cross-browser fallback for document element & body
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
