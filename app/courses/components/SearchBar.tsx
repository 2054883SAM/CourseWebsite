'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { SearchIcon, XIcon } from './Icons';

interface SearchBarProps {
  initialQuery?: string;
  className?: string;
}

// Maximum number of recent searches to store
const MAX_RECENT_SEARCHES = 5;
// Local storage key
const RECENT_SEARCHES_KEY = 'coursewebsite_recent_searches';

export function SearchBar({ initialQuery = '', className = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState<string[]>([
    'JavaScript', 'React', 'Python', 'Web Development', 'Data Science'
  ]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const suggestionTimeout = useRef<NodeJS.Timeout>();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Load recent searches from localStorage on component mount
  useEffect(() => {
    try {
      const storedSearches = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (storedSearches) {
        setRecentSearches(JSON.parse(storedSearches));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  }, []);
  
  // Fetch suggestions when query changes
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    
    // Clear previous timeout
    if (suggestionTimeout.current) {
      clearTimeout(suggestionTimeout.current);
    }
    
    // Set a timeout to avoid too many requests while typing
    suggestionTimeout.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    
    return () => {
      if (suggestionTimeout.current) {
        clearTimeout(suggestionTimeout.current);
      }
    };
  }, [query]);
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Add to recent searches
    addToRecentSearches(query);
    
    // Create new URLSearchParams with existing parameters
    const params = new URLSearchParams(searchParams.toString());
    
    // Update or add the query parameter
    params.set('query', query);
    
    // Navigate to the search results
    router.push(`${pathname}?${params.toString()}`);
    
    // Close suggestions
    setIsFocused(false);
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    // Set the query to the selected suggestion
    setQuery(suggestion);
    
    // Add to recent searches
    addToRecentSearches(suggestion);
    
    // Create new URLSearchParams with existing parameters
    const params = new URLSearchParams(searchParams.toString());
    
    // Update or add the query parameter
    params.set('query', suggestion);
    
    // Navigate to the search results
    router.push(`${pathname}?${params.toString()}`);
    
    // Close suggestions
    setIsFocused(false);
  };
  
  // Add search to recent searches
  const addToRecentSearches = (search: string) => {
    try {
      // Get current searches
      const currentSearches = [...recentSearches];
      
      // Remove if already exists
      const filteredSearches = currentSearches.filter(
        (item) => item.toLowerCase() !== search.toLowerCase()
      );
      
      // Add to beginning
      const newSearches = [search, ...filteredSearches].slice(0, MAX_RECENT_SEARCHES);
      
      // Update state
      setRecentSearches(newSearches);
      
      // Save to localStorage
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  };
  
  // Clear search input
  const handleClearSearch = () => {
    setQuery('');
    setSuggestions([]);
    searchInputRef.current?.focus();
  };

  // Handle clicks outside the search component to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) && 
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="flex w-full">
        <div className="relative flex-grow">
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search courses..."
            className="w-full px-4 py-2 pl-10 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Search courses"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-400" />
          </div>
          {query && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 font-medium text-white bg-blue-600 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Search"
        >
          Search
        </button>
      </form>
      
      {isFocused && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg"
        >
          {query.length >= 2 ? (
            <div>
              {isLoading ? (
                <div className="p-3 text-gray-500">Loading suggestions...</div>
              ) : suggestions.length > 0 ? (
                <div>
                  <div className="p-2 text-xs font-semibold text-gray-500 uppercase">Suggestions</div>
                  <ul>
                    {suggestions.map((suggestion, index) => (
                      <li key={`suggestion-${index}`}>
                        <button
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-3 text-gray-500">No suggestions found</div>
              )}
            </div>
          ) : (
            <div>
              {recentSearches.length > 0 && (
                <div>
                  <div className="p-2 text-xs font-semibold text-gray-500 uppercase">Recent Searches</div>
                  <ul>
                    {recentSearches.map((search, index) => (
                      <li key={`recent-${index}`}>
                        <button
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                          onClick={() => handleSuggestionClick(search)}
                        >
                          {search}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div>
                <div className="p-2 text-xs font-semibold text-gray-500 uppercase">Popular Searches</div>
                <ul>
                  {popularSearches.map((search, index) => (
                    <li key={`popular-${index}`}>
                      <button
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        onClick={() => handleSuggestionClick(search)}
                      >
                        {search}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 