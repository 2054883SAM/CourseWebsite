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
const RECENT_SEARCHES_KEY = 'ezioacademy_recent_searches';

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

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
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

  const addToRecentSearches = (search: string) => {
    const trimmedSearch = search.trim();
    if (!trimmedSearch) return;
    
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== trimmedSearch);
      const updated = [trimmedSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      
      // Save to localStorage
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving recent searches:', error);
      }
      
      return updated;
    });
  };

  const handleClearSearch = () => {
    setQuery('');
    searchInputRef.current?.focus();
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
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
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Rechercher des cours..."
            className="w-full px-6 py-4 pl-14 pr-12 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-gold-500/20 focus:border-gold-500 dark:focus:border-gold-400 transition-all duration-300 shadow-lg hover:shadow-xl"
            aria-label="Rechercher des cours"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
            <SearchIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
          </div>
          {query && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              onClick={handleClearSearch}
              aria-label="Effacer la recherche"
            >
              <XIcon className="w-5 h-5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="absolute right-2 top-2 px-6 py-2 font-semibold text-white bg-gradient-to-r from-gray-600 to-gray-800 rounded-xl hover:from-gray-700 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
          aria-label="Rechercher"
        >
          Rechercher
        </button>
      </form>
      
      {isFocused && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-2xl shadow-2xl backdrop-blur-sm z-[99999]"
        >
          {query.length >= 2 ? (
            <div className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold-600"></div>
                  <span className="ml-3 text-gray-500 dark:text-gray-400">Chargement des suggestions...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <div>
                  <div className="px-2 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Suggestions
                  </div>
                  <ul className="space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <li key={`suggestion-${index}`}>
                        <button
                          type="button"
                          className="w-full px-4 py-3 text-left rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          🔍 {suggestion}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <span className="text-2xl mb-2 block">🔍</span>
                  Aucune suggestion trouvée
                </div>
              )}
            </div>
          ) : (
            <div className="p-4">
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <div className="px-2 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Recherches récentes
                  </div>
                  <ul className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <li key={`recent-${index}`}>
                        <button
                          type="button"
                          className="w-full px-4 py-3 text-left rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                          onClick={() => handleSuggestionClick(search)}
                        >
                          ⏰ {search}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div>
                <div className="px-2 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Recherches populaires
                </div>
                <ul className="space-y-1">
                  {popularSearches.map((search, index) => (
                    <li key={`popular-${index}`}>
                      <button
                        type="button"
                        className="w-full px-4 py-3 text-left rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        onClick={() => handleSuggestionClick(search)}
                      >
                        🔥 {search}
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