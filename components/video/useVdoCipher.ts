'use client';

import { useState, useEffect } from 'react';

export function useVdoCipher(maxRetries = 20, retryInterval = 300) {
  const [vdoPlayer, setVdoPlayer] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempted, setLoadAttempted] = useState(false);
  
  useEffect(() => {
    let retries = 0;
    let intervalId: NodeJS.Timeout | null = null;
    
    // Manual script loading function as a fallback
    const loadVdoCipherScriptManually = () => {
      console.log('Attempting to manually load VdoCipher script');
      setLoadAttempted(true);
      
      // Check if script already exists
      if (document.getElementById('vdocipher-script-manual')) {
        console.log('Manual script already exists, not creating a duplicate');
        return;
      }
      
      const script = document.createElement('script');
      script.id = 'vdocipher-script-manual';
      script.src = 'https://player.vdocipher.com/v2/api.js';
      script.async = true;
      script.onload = () => {
        console.log('VdoCipher script manually loaded successfully');
        window.vdoCipherScriptLoaded = true;
      };
      script.onerror = (e) => {
        console.error('Failed to manually load VdoCipher script:', e);
        setError('Failed to load VdoCipher script manually');
      };
      
      document.head.appendChild(script);
    };
    
    // Function to check if VdoPlayer is available
    const checkVdoPlayerAvailability = () => {
      // Check if the script has been loaded via our flag
      if (window.vdoCipherScriptLoaded && window.VdoPlayer) {
        if (intervalId) clearInterval(intervalId);
        console.log('VdoPlayer found via script loaded flag');
        setVdoPlayer(window.VdoPlayer);
        setIsLoaded(true);
        return;
      }
      
      // Check directly if VdoPlayer is available
      if (window.VdoPlayer) {
        if (intervalId) clearInterval(intervalId);
        console.log('VdoPlayer found directly');
        setVdoPlayer(window.VdoPlayer);
        setIsLoaded(true);
        return;
      }
      
      retries++;
      console.log(`VdoPlayer check attempt ${retries}/${maxRetries}`);
      
      // After a few retries, try loading the script manually if not already attempted
      if (retries === Math.floor(maxRetries / 2) && !loadAttempted) {
        loadVdoCipherScriptManually();
      }
      
      if (retries >= maxRetries) {
        if (intervalId) clearInterval(intervalId);
        console.error('Failed to load VdoCipher player after maximum retries');
        setError('Failed to load VdoCipher player after maximum retries');
        
        // Last resort fallback - try one more manual load with a different version
        if (!document.getElementById('vdocipher-script-last-resort')) {
          console.log('Trying last resort script load with different version');
          const lastResortScript = document.createElement('script');
          lastResortScript.id = 'vdocipher-script-last-resort';
          lastResortScript.src = 'https://player.vdocipher.com/v2/api.js'; // Try older version
          lastResortScript.async = true;
          document.head.appendChild(lastResortScript);
        }
      }
    };
    
    // Start checking
    intervalId = setInterval(checkVdoPlayerAvailability, retryInterval);
    
    // Initial check
    checkVdoPlayerAvailability();
    
    // Cleanup
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [maxRetries, retryInterval, loadAttempted]);
  
  return { vdoPlayer, isLoaded, error };
}