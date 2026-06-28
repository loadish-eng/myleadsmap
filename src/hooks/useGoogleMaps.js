import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

let apiKeyCache = null;
let scriptPromise = null;

export function useGoogleMaps() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        if (!apiKeyCache) {
          const res = await base44.functions.invoke('googlePlaces', { action: 'config' });
          apiKeyCache = res.data.apiKey;
        }
        if (!window.google?.maps) {
          if (!scriptPromise) {
            scriptPromise = new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKeyCache}&v=weekly`;
              script.async = true;
              script.defer = true;
              script.onload = () => resolve();
              script.onerror = () => reject(new Error('Failed to load Google Maps script'));
              document.head.appendChild(script);
            });
          }
          await scriptPromise;
        }
        setLoaded(true);
      } catch (err) {
        setError(err.message || 'Failed to load Google Maps');
      }
    }
    load();
  }, []);

  return { loaded, error };
}