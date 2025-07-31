import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChapterList from '@/components/video/ChapterList';
import { VideoChapter } from '@/lib/types/vdocipher';

const mockChapters: VideoChapter[] = [
  {
    id: 'chapter-1',
    title: 'Introduction',
    startTime: 0,
    duration: 180,
    description: 'Welcome to the course'
  },
  {
    id: 'chapter-2', 
    title: 'Getting Started',
    startTime: 180,
    duration: 240,
    description: 'Setting up the environment'
  },
  {
    id: 'chapter-3',
    title: 'Advanced Concepts',
    startTime: 420,
    duration: 300,
    description: 'Deep dive into advanced topics'
  }
];

describe('ChapterList', () => {
  const mockOnChapterClick = jest.fn();

  beforeEach(() => {
    mockOnChapterClick.mockClear();
  });

  it('should render all chapters', () => {
    render(
      <ChapterList
        chapters={mockChapters}
        currentTime={0}
        onChapterClick={mockOnChapterClick}
      />
    );

    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Advanced Concepts')).toBeInTheDocument();
  });

  it('should display chapter durations formatted correctly', () => {
    render(
      <ChapterList
        chapters={mockChapters}
        currentTime={0}
        onChapterClick={mockOnChapterClick}
      />
    );

    // Use more specific queries to avoid duplication issues
    const chapterElements = screen.getAllByText('3:00');
    expect(chapterElements.length).toBeGreaterThan(0); // 180 seconds duration
    
    expect(screen.getByText('4:00')).toBeInTheDocument(); // 240 seconds
    expect(screen.getByText('5:00')).toBeInTheDocument(); // 300 seconds
  });

  it('should display chapter start times formatted correctly', () => {
    render(
      <ChapterList
        chapters={mockChapters}
        currentTime={0}
        onChapterClick={mockOnChapterClick}
      />
    );

    expect(screen.getByText('0:00')).toBeInTheDocument(); // 0 seconds
    // For 3:00, there are multiple instances (start time and duration), so check both exist
    const timeElements = screen.getAllByText('3:00');
    expect(timeElements.length).toBe(2); // Start time of chapter 2 AND duration of chapter 1
    expect(screen.getByText('7:00')).toBeInTheDocument(); // 420 seconds
  });

  it('should highlight the current chapter based on currentTime', () => {
    render(
      <ChapterList
        chapters={mockChapters}
        currentTime={200} // Should be in chapter 2
        onChapterClick={mockOnChapterClick}
      />
    );

    const currentChapter = screen.getByTestId('chapter-chapter-2');
    expect(currentChapter).toHaveClass('bg-blue-50');
  });

  it('should call onChapterClick when a chapter is clicked', () => {
    render(
      <ChapterList
        chapters={mockChapters}
        currentTime={0}
        onChapterClick={mockOnChapterClick}
      />
    );

    const chapter2Button = screen.getByTestId('chapter-button-chapter-2');
    fireEvent.click(chapter2Button);

    expect(mockOnChapterClick).toHaveBeenCalledWith(mockChapters[1]);
  });

  it('should show chapter descriptions when available', () => {
    render(
      <ChapterList
        chapters={mockChapters}
        currentTime={0}
        onChapterClick={mockOnChapterClick}
      />
    );

    expect(screen.getByText('Welcome to the course')).toBeInTheDocument();
    expect(screen.getByText('Setting up the environment')).toBeInTheDocument();
    expect(screen.getByText('Deep dive into advanced topics')).toBeInTheDocument();
  });

  it('should handle chapters without descriptions', () => {
    const chaptersWithoutDescriptions: VideoChapter[] = [
      {
        id: 'chapter-1',
        title: 'No Description Chapter',
        startTime: 0,
        duration: 120
      }
    ];

    render(
      <ChapterList
        chapters={chaptersWithoutDescriptions}
        currentTime={0}
        onChapterClick={mockOnChapterClick}
      />
    );

    expect(screen.getByText('No Description Chapter')).toBeInTheDocument();
    expect(screen.queryByText('undefined')).not.toBeInTheDocument();
  });

  it('should handle chapters without durations', () => {
    const chaptersWithoutDuration: VideoChapter[] = [
      {
        id: 'chapter-1',
        title: 'No Duration Chapter',
        startTime: 0,
        description: 'A chapter without duration'
      }
    ];

    render(
      <ChapterList
        chapters={chaptersWithoutDuration}
        currentTime={0}
        onChapterClick={mockOnChapterClick}
      />
    );

    expect(screen.getByText('No Duration Chapter')).toBeInTheDocument();
    // Should not show duration if not provided
    expect(screen.queryByText('undefined')).not.toBeInTheDocument();
  });

  it('should apply custom className when provided', () => {
    const { container } = render(
      <ChapterList
        chapters={mockChapters}
        currentTime={0}
        onChapterClick={mockOnChapterClick}
        className="custom-chapter-list"
      />
    );

    expect(container.firstChild).toHaveClass('custom-chapter-list');
  });

  it('should handle empty chapters array', () => {
    render(
      <ChapterList
        chapters={[]}
        currentTime={0}
        onChapterClick={mockOnChapterClick}
      />
    );

    expect(screen.getByText('No chapters available')).toBeInTheDocument();
  });

  it('should handle edge case where currentTime matches chapter start time exactly', () => {
    render(
      <ChapterList
        chapters={mockChapters}
        currentTime={180} // Exactly at start of chapter 2
        onChapterClick={mockOnChapterClick}
      />
    );

    const currentChapter = screen.getByTestId('chapter-chapter-2');
    expect(currentChapter).toHaveClass('bg-blue-50');
  });

  it('should handle currentTime beyond all chapters', () => {
    render(
      <ChapterList
        chapters={mockChapters}
        currentTime={1000} // Beyond all chapters
        onChapterClick={mockOnChapterClick}
      />
    );

    // Last chapter should be highlighted
    const lastChapter = screen.getByTestId('chapter-chapter-3');
    expect(lastChapter).toHaveClass('bg-blue-50');
  });
});