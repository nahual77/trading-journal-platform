import { useState, useEffect } from 'react';

export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const updateOrientation = () => {
      if (window.innerHeight > window.innerWidth) {
        setOrientation('portrait');
      } else {
        setOrientation('landscape');
      }
    };

    // Initial check
    updateOrientation();

    // Listen for orientation changes
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return orientation;
};

export const useLockOrientation = (shouldLock: boolean) => {
  useEffect(() => {
    if (!shouldLock) return;

    const lockOrientation = () => {
      // Try to lock orientation to portrait using different methods
      try {
        // Method 1: Modern Screen Orientation API
        if (screen.orientation && 'lock' in screen.orientation) {
          (screen.orientation as any).lock('portrait').catch((err: any) => {
            console.log('Screen orientation lock failed:', err);
          });
        }
        // Method 2: Legacy fullscreen API (fallback)
        else if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().then(() => {
            // This can help prevent rotation in some cases
            console.log('Using fullscreen as orientation lock fallback');
          }).catch((err) => {
            console.log('Fullscreen fallback failed:', err);
          });
        }
      } catch (error) {
        console.log('Orientation lock not supported:', error);
      }
    };

    // Lock on mount
    lockOrientation();

    // Lock on orientation change
    const handleOrientationChange = () => {
      setTimeout(lockOrientation, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [shouldLock]);
};
