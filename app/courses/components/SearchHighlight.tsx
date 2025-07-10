interface SearchHighlightProps {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
}

// Helper function to escape special regex characters
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Component that highlights search terms within text
 */
export function SearchHighlight({
  text,
  query,
  className = '',
  highlightClassName = 'bg-yellow-200 font-medium'
}: SearchHighlightProps) {
  // If there's no query or it's empty, just return the original text
  if (!query || !query.trim()) {
    return <span className={className}>{text}</span>;
  }
  
  try {
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <span className={className}>
        {parts.map((part, i) => {
          // Check if the current part matches the search query (case insensitive)
          const isMatch = part.toLowerCase() === query.toLowerCase();
          
          return isMatch ? (
            <span key={i} className={highlightClassName}>
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          );
        })}
      </span>
    );
  } catch (error) {
    // If there's an error with the regex, just return the original text
    console.error('Error in SearchHighlight:', error);
    return <span className={className}>{text}</span>;
  }
} 