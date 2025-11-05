import { useState, useEffect } from 'react';

export default function useImage(url) {
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!url) {
      setImage(null);
      setStatus('idle');
      return;
    }

    const img = new window.Image();
    
    img.onload = () => {
      setImage(img);
      setStatus('loaded');
    };
    
    img.onerror = () => {
      setImage(null);
      setStatus('error');
    };
    
    img.src = url;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [url]);

  return [image, status];
}
