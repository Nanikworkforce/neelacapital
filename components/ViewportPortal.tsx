import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders children on document.body so fixed overlays stay viewport-centered
 * even when the opener lives inside a scrolled / overflow parent.
 */
const ViewportPortal: React.FC<{
  children: React.ReactNode;
  /** Lock background page scroll while mounted. Default true. */
  lockScroll?: boolean;
}> = ({ children, lockScroll = true }) => {
  useEffect(() => {
    if (!lockScroll) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [lockScroll]);

  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
};

export default ViewportPortal;
