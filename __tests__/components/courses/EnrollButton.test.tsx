import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EnrollButton } from '@/components/courses/EnrollButton';

describe('EnrollButton Component', () => {
  it('renders in not enrolled state by default', () => {
    render(<EnrollButton />);
    expect(screen.getByRole('button', { name: /enroll now/i })).toBeInTheDocument();
  });

  it('renders in processing state when specified', () => {
    render(<EnrollButton status="processing" />);
    const button = screen.getByRole('button', { name: /processing/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('renders in enrolled state when specified', () => {
    render(<EnrollButton status="enrolled" />);
    expect(screen.getByRole('button', { name: /enrolled/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked in not-enrolled state', () => {
    const handleClick = jest.fn();
    render(<EnrollButton onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when clicked in processing state', () => {
    const handleClick = jest.fn();
    render(<EnrollButton status="processing" onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when clicked in enrolled state', () => {
    const handleClick = jest.fn();
    render(<EnrollButton status="enrolled" onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<EnrollButton disabled onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders custom text when provided', () => {
    render(
      <EnrollButton 
        notEnrolledText="Join Course" 
        processingText="Joining..." 
        enrolledText="Joined"
      />
    );
    expect(screen.getByText('Join Course')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    render(<EnrollButton className="test-class" />);
    expect(screen.getByRole('button').className).toContain('test-class');
  });

  // Note: Testing tooltip interaction would require additional setup 
  // for hovering events and checking DOM, which is more complex
}); 