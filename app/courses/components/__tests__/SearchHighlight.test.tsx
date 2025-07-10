import React from 'react';
import { render, screen } from '@testing-library/react';
import { SearchHighlight } from '../SearchHighlight';

describe('SearchHighlight Component', () => {
  test('renders text without highlighting when no query is provided', () => {
    render(<SearchHighlight text="This is a test text" query="" />);
    expect(screen.getByText('This is a test text')).toBeInTheDocument();
    // No highlighting should occur when query is empty
    expect(screen.queryByText('test')?.classList.contains('bg-yellow-200')).toBeFalsy();
  });

  test('highlights matching text when query is provided', () => {
    render(<SearchHighlight text="This is a test text" query="test" />);
    
    // The component should split the text and highlight the matching part
    const highlightedElement = screen.getByText('test');
    expect(highlightedElement).toBeInTheDocument();
    expect(highlightedElement.classList.contains('bg-yellow-200')).toBeTruthy();
  });

  test('is case insensitive when highlighting', () => {
    render(<SearchHighlight text="This is a TEST text" query="test" />);
    
    // Should highlight "TEST" even though the query is "test"
    const highlightedElement = screen.getByText('TEST');
    expect(highlightedElement).toBeInTheDocument();
    expect(highlightedElement.classList.contains('bg-yellow-200')).toBeTruthy();
  });

  test('handles special regex characters in query', () => {
    render(<SearchHighlight text="This is a (test) text" query="(test)" />);
    
    // Should properly escape regex special characters
    const highlightedElement = screen.getByText('(test)');
    expect(highlightedElement).toBeInTheDocument();
    expect(highlightedElement.classList.contains('bg-yellow-200')).toBeTruthy();
  });

  test('applies custom className to the container', () => {
    render(
      <SearchHighlight 
        text="This is a test text" 
        query="test" 
        className="custom-class"
      />
    );
    
    // The container should have the custom class
    const container = screen.getByText(/This is a/i).parentElement;
    expect(container?.classList.contains('custom-class')).toBeTruthy();
  });

  test('applies custom highlightClassName to highlighted text', () => {
    render(
      <SearchHighlight 
        text="This is a test text" 
        query="test" 
        highlightClassName="custom-highlight"
      />
    );
    
    // The highlighted part should have the custom highlight class
    const highlightedElement = screen.getByText('test');
    expect(highlightedElement.classList.contains('custom-highlight')).toBeTruthy();
    expect(highlightedElement.classList.contains('bg-yellow-200')).toBeFalsy();
  });
}); 