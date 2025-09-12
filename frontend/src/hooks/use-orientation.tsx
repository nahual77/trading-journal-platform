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
      // Try to lock orientation to portrait
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('portrait').catch((err) => {
          console.log('Orientation lock failed:', err);
        });
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
