// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, fill, sizes, width, height, className }) => {
    // Get props that were passed to the Image component
    const props = { src, alt, fill, sizes, width, height, className };
    
    return (
      <img 
        src={src} 
        alt={alt}
        width={width}
        height={height}
        className={className}
        data-testid="next-image"
        {...(fill && { style: { objectFit: 'cover' } })}
        data-mocked="true"
      />
    );
  }
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}));

// Mock localStorage
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(() => null),
      setItem: jest.fn(() => null),
      removeItem: jest.fn(() => null),
      clear: jest.fn(() => null),
    },
    writable: true,
  });
} 