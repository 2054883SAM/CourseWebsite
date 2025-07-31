'use client';

/**
 * Utility for diagnosing VdoCipher player loading issues
 */

// Check for basic browser capabilities
export const runVdoCipherDiagnostics = () => {
  console.group('VdoCipher Loading Diagnostics');
  
  // Check browser compatibility
  const userAgent = navigator.userAgent;
  console.log('Browser:', userAgent);
  
  // Check for content security policy
  try {
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (cspMeta) {
      console.log('CSP found:', cspMeta.getAttribute('content'));
      console.warn('Content Security Policy may be blocking script loading');
    } else {
      console.log('No explicit CSP meta tag found');
    }
  } catch (e) {
    console.log('Error checking CSP:', e);
  }
  
  // Check for existing scripts
  const scripts = document.querySelectorAll('script');
  const vdoScripts = Array.from(scripts).filter(s => 
    s.src && s.src.includes('vdo')
  );
  
  console.log(`Found ${vdoScripts.length} VdoCipher related script tags:`, 
    vdoScripts.map(s => ({ src: s.src, id: s.id }))
  );
  
  // Check for global VdoPlayer object
  console.log('window.VdoPlayer available:', !!window.VdoPlayer);
  console.log('window.vdoCipherScriptLoaded flag:', !!window.vdoCipherScriptLoaded);
  
  // Check for common script blocking extensions
  const commonBlockers = [
    'AdBlock', 'uBlock', 'Privacy Badger', 'Ghostery', 'NoScript'
  ];
  console.log('Possible content/script blockers that may affect loading:',
    commonBlockers.join(', ')
  );
  
  // Check CORS capabilities
  const corsSupported = 'XMLHttpRequest' in window && 'withCredentials' in new XMLHttpRequest();
  console.log('CORS supported by browser:', corsSupported);
  
  // Try a diagnostic fetch to the script URL
  fetch('https://player.vdocipher.com/v2/api.js', { 
    method: 'HEAD',
    mode: 'no-cors' // This is required for cross-origin requests
  })
    .then(response => {
      console.log('VdoCipher script URL responded (no-cors mode)');
    })
    .catch(error => {
      console.error('Error fetching VdoCipher script URL:', error);
    });
    
  console.groupEnd();
};

// Schedule diagnostics to run on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // Wait a bit to let other scripts load first
    setTimeout(runVdoCipherDiagnostics, 2000);
  });
}