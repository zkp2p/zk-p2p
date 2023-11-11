import { useState, useEffect } from 'react';
import { MediaSizeKey, MEDIA_SIZE } from 'theme/media';

const useMediaQuery = () => {
  const [deviceSize, setDeviceSize] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const sizesInDescending = Object.keys(MEDIA_SIZE).reverse();
      const newSize = sizesInDescending.find(size =>
        window.matchMedia(`(min-width: ${MEDIA_SIZE[size as MediaSizeKey]})`
      ).matches) as string || 'mobile'; // Default to mobile if smaller than smallest size
      setDeviceSize(newSize);
    };

    // Initial check on mount
    handleResize();

    // Listen for window resize events
    window.addEventListener('resize', handleResize);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return deviceSize;
};

export default useMediaQuery
