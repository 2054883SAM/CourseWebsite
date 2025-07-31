/**
 * Dynamically loads a script with Promise-based resolution
 * @param src Script source URL
 * @param id Optional ID for the script tag
 * @returns Promise that resolves when script loads, rejects on error
 */
export const loadScript = (src: string, id?: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      console.log(`Script already loaded: ${src}`);
      resolve();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    if (id) script.id = id;

    // Set up load handlers
    script.onload = () => {
      console.log(`Script loaded successfully: ${src}`);
      resolve();
    };

    script.onerror = (error) => {
      console.error(`Error loading script ${src}:`, error);
      reject(new Error(`Failed to load script: ${src}`));
    };

    // Add to document
    document.head.appendChild(script);
  });
};

/**
 * Specifically loads the VdoCipher player script with fallback options
 * @returns Promise that resolves when VdoCipher script is loaded
 */
export function loadVdoCipherScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.VdoPlayer) return resolve();
    const script = document.createElement('script');
    console.time('vdo-script-load');
    script.src = 'https://player.vdocipher.com/v2/api.js';
    script.async = true;
    script.onload = () => {
      console.timeEnd('vdo-script-load');
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load VdoCipher API'));
    document.head.appendChild(script);
  });
};

/**
 * Polls for window.VdoPlayer to become available after script is loaded
 * @param maxRetries Maximum number of retry attempts
 * @param retryInterval Interval between retries in milliseconds
 * @returns Promise that resolves when window.VdoPlayer is available
 */
export const waitForVdoPlayerReady = (
  maxRetries = 20,
  retryInterval = 150
): Promise<void> => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const checkVdoPlayer = () => {
      attempts++;
      console.log(`Checking for window.VdoPlayer... (attempt ${attempts}/${maxRetries})`);
      
      // Check if VdoPlayer is available
      if (window.VdoPlayer) {
        console.log('window.VdoPlayer is now available!');
        resolve();
        return;
      }
      
      // If we've reached max retries, reject the promise
      if (attempts >= maxRetries) {
        reject(new Error(`window.VdoPlayer not available after ${maxRetries} attempts`));
        return;
      }
      
      // Try again after the retry interval
      setTimeout(checkVdoPlayer, retryInterval);
    };
    
    // Start checking
    checkVdoPlayer();
  });
};