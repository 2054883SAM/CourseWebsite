import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { SearchBar } from '../SearchBar';
import userEvent from '@testing-library/user-event';
import { useRouter, usePathname } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ suggestions: [] }),
  })
) as jest.Mock;

describe('SearchBar Component', () => {
  const mockRouter = {
    push: jest.fn(),
  };
  const mockPathname = '/courses';

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue(mockPathname);
    (global.fetch as jest.Mock).mockClear();
  });

  test('renders the search input', () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText(/search courses/i)).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  test('updates query parameter when search is submitted', async () => {
    render(<SearchBar initialQuery="" />);
    
    const input = screen.getByPlaceholderText(/search courses/i);
    
    await act(async () => {
      await userEvent.type(input, 'react');
    });
    
    const searchButton = screen.getByText('Search');
    
    await act(async () => {
      fireEvent.click(searchButton);
    });
    
    expect(mockRouter.push).toHaveBeenCalledWith('/courses?query=react');
  });

  test('shows auto-suggestions when typing', async () => {
    // Mock suggestions data
    const mockSuggestions = ['React Basics', 'React Advanced'];
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ suggestions: mockSuggestions }),
        ok: true,
      })
    );

    render(<SearchBar initialQuery="" />);
    
    const input = screen.getByPlaceholderText(/search courses/i);
    
    await act(async () => {
      await userEvent.type(input, 'react');
    });
    
    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeInTheDocument();
      expect(screen.getByText('React Advanced')).toBeInTheDocument();
    });
  });

  test('applies search when clicking on suggestion', async () => {
    // Mock suggestions data
    const mockSuggestions = ['React Basics', 'React Advanced'];
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ suggestions: mockSuggestions }),
        ok: true,
      })
    );

    render(<SearchBar initialQuery="" />);
    
    const input = screen.getByPlaceholderText(/search courses/i);
    
    await act(async () => {
      await userEvent.type(input, 'react');
    });
    
    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('React Basics'));
    });
    
    expect(mockRouter.push).toHaveBeenCalledWith('/courses?query=React+Basics');
  });

  test('preserves other URL parameters when searching', async () => {
    // Mock existing URL parameters
    const mockSearchParams = new URLSearchParams('view=grid&sort=price');
    jest.spyOn(require('next/navigation'), 'useSearchParams').mockReturnValue(mockSearchParams);
    
    render(<SearchBar initialQuery="" />);
    
    const input = screen.getByPlaceholderText(/search courses/i);
    
    await act(async () => {
      await userEvent.type(input, 'javascript');
    });
    
    const searchButton = screen.getByText('Search');
    
    await act(async () => {
      fireEvent.click(searchButton);
    });
    
    expect(mockRouter.push).toHaveBeenCalledWith(expect.stringContaining('query=javascript'));
    expect(mockRouter.push).toHaveBeenCalledWith(expect.stringContaining('view=grid'));
    expect(mockRouter.push).toHaveBeenCalledWith(expect.stringContaining('sort=price'));
  });
  
  test('shows recent searches when input is focused', async () => {
    // Mock local storage for recent searches
    const mockRecentSearches = ['python', 'javascript'];
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => JSON.stringify(mockRecentSearches)),
        setItem: jest.fn(),
      },
      writable: true,
    });

    render(<SearchBar initialQuery="" />);
    
    const input = screen.getByPlaceholderText(/search courses/i);
    
    await act(async () => {
      fireEvent.focus(input);
    });
    
    expect(screen.getByText('Recent Searches')).toBeInTheDocument();
    expect(screen.getByText('python')).toBeInTheDocument();
    expect(screen.getByText('javascript')).toBeInTheDocument();
  });
}); 