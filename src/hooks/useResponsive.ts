'use client';

import { useEffect, useMemo, useState } from 'react';

const breakpoints = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
};

export const useResponsive = () => {
  const [matches, setMatches] = useState({
    mobile: false,
    tablet: false,
    desktop: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const queries = {
      mobile: window.matchMedia(breakpoints.mobile),
      tablet: window.matchMedia(breakpoints.tablet),
      desktop: window.matchMedia(breakpoints.desktop),
    };

    const update = () => {
      setMatches({
        mobile: queries.mobile.matches,
        tablet: queries.tablet.matches,
        desktop: queries.desktop.matches,
      });
    };

    update();

    Object.values(queries).forEach((mql) => {
      if (typeof mql.addEventListener === 'function') {
        mql.addEventListener('change', update);
      } else {
        mql.addListener(update);
      }
    });

    return () => {
      Object.values(queries).forEach((mql) => {
        if (typeof mql.removeEventListener === 'function') {
          mql.removeEventListener('change', update);
        } else {
          mql.removeListener(update);
        }
      });
    };
  }, []);

  return useMemo(
    () => ({
      isMobile: matches.mobile,
      isTablet: matches.tablet,
      isDesktop: matches.desktop,
      isSmallScreen: matches.mobile || matches.tablet,
    }),
    [matches],
  );
};
