/**
 * Error handling utilities for the application
 */

/**
 * Determines if an error should be suppressed in the console
 * @param error The error to check
 * @returns boolean True if the error should be suppressed
 */
export function shouldSuppressError(error: unknown): boolean {
  // Convert error to string for checking
  const errorString = String(error || '');
  
  // List of error patterns to suppress
  const suppressPatterns = [
    'getErrorFromHlsErrorData',
    'hls.js',
    '@mux/playback-core',
    'Failed to load resource: net::ERR_INTERNET_DISCONNECTED', // Common network error
    'The play() request was interrupted by a call to pause()', // Common video player error
  ];
  
  // Check if error matches any pattern to suppress
  return suppressPatterns.some(pattern => errorString.includes(pattern));
}

/**
 * Creates a console error wrapper that suppresses specific errors
 * @returns A cleanup function to restore the original console.error
 */
export function setupErrorSuppression(): () => void {
  // Store the original console.error
  const originalConsoleError = console.error;
  
  // Override console.error to filter out specific errors
  console.error = (...args) => {
    // Check if this is an error we want to suppress
    if (args.length > 0 && shouldSuppressError(args[0])) {
      return; // Suppress this error
    }
    
    // Pass through all other errors to the original console.error
    originalConsoleError.apply(console, args);
  };
  
  // Return cleanup function
  return () => {
    console.error = originalConsoleError;
  };
} 