// Export types
export * from './types';

// Export client
export { supabase } from './client';

// Export API functions
export * from './courses';
export * from './users';

// Export mock data (useful for development)
export * as mockData from './mockData';

// Helper function to determine if we should use mock data
// This allows us to switch between real and mock data easily
export const shouldUseMockData = (): boolean => {
  // Use mock data in development when there's no Supabase data available
  // or when explicitly requested via env var
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return true;
  }
  
  // In the future, we might want to add more conditions
  // For example, checking if we're in a test environment
  
  return false;
}; 