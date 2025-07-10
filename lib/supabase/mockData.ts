import { User, Course, Section, Subtitle, Enrollment } from './types';

/**
 * Mock data for development purposes
 * This will be used when Supabase data is not available or for local development
 */

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    role: 'admin',
    name: 'Admin User',
    email: 'admin@example.com',
    photo_url: 'https://i.pravatar.cc/150?u=admin@example.com',
    created_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    role: 'creator',
    name: 'Jane Smith',
    email: 'jane@example.com',
    photo_url: 'https://i.pravatar.cc/150?u=jane@example.com',
    created_at: '2023-01-02T00:00:00Z'
  },
  {
    id: '3',
    role: 'creator',
    name: 'John Doe',
    email: 'john@example.com',
    photo_url: 'https://i.pravatar.cc/150?u=john@example.com',
    created_at: '2023-01-03T00:00:00Z'
  },
  {
    id: '4',
    role: 'student',
    name: 'Student User',
    email: 'student@example.com',
    photo_url: 'https://i.pravatar.cc/150?u=student@example.com',
    created_at: '2023-01-04T00:00:00Z'
  }
];

// Mock Courses
export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    description: 'A comprehensive introduction to HTML, CSS, and JavaScript for beginners.',
    thumbnail_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
    price: 49.99,
    creator_id: '2',
    created_at: '2023-02-01T00:00:00Z',
    creator: mockUsers.find(user => user.id === '2'),
    section_count: 3
  },
  {
    id: '2',
    title: 'Advanced React Patterns',
    description: 'Deep dive into advanced React patterns, hooks, and state management.',
    thumbnail_url: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2',
    price: 79.99,
    creator_id: '2',
    created_at: '2023-02-15T00:00:00Z',
    creator: mockUsers.find(user => user.id === '2'),
    section_count: 4
  },
  {
    id: '3',
    title: 'Node.js Backend Development',
    description: 'Learn server-side JavaScript with Node.js, Express, and MongoDB.',
    thumbnail_url: 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3',
    price: 59.99,
    creator_id: '3',
    created_at: '2023-03-01T00:00:00Z',
    creator: mockUsers.find(user => user.id === '3'),
    section_count: 5
  },
  {
    id: '4',
    title: 'Python for Data Science',
    description: 'Introduction to Python programming for data analysis and visualization.',
    thumbnail_url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935',
    price: 69.99,
    creator_id: '3',
    created_at: '2023-03-15T00:00:00Z',
    creator: mockUsers.find(user => user.id === '3'),
    section_count: 4
  },
  {
    id: '5',
    title: 'Full Stack JavaScript Development',
    description: 'Build complete web applications with modern JavaScript frameworks.',
    thumbnail_url: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613',
    price: 99.99,
    creator_id: '2',
    created_at: '2023-04-01T00:00:00Z',
    creator: mockUsers.find(user => user.id === '2'),
    section_count: 6
  }
];

// Mock Sections
export const mockSections: Section[] = [
  // Course 1 Sections
  {
    id: '101',
    course_id: '1',
    title: 'HTML Fundamentals',
    order: 1,
    playback_id: 'mock-playback-id-101',
    duration: 1800, // 30 minutes
  },
  {
    id: '102',
    course_id: '1',
    title: 'CSS Styling Basics',
    order: 2,
    playback_id: 'mock-playback-id-102',
    duration: 2400, // 40 minutes
  },
  {
    id: '103',
    course_id: '1',
    title: 'JavaScript Introduction',
    order: 3,
    playback_id: 'mock-playback-id-103',
    duration: 3000, // 50 minutes
  },
  // Course 2 Sections
  {
    id: '201',
    course_id: '2',
    title: 'React Hooks Deep Dive',
    order: 1,
    playback_id: 'mock-playback-id-201',
    duration: 2700, // 45 minutes
  },
  {
    id: '202',
    course_id: '2',
    title: 'Component Composition',
    order: 2,
    playback_id: 'mock-playback-id-202',
    duration: 2400, // 40 minutes
  },
  {
    id: '203',
    course_id: '2',
    title: 'Context API and State Management',
    order: 3,
    playback_id: 'mock-playback-id-203',
    duration: 3300, // 55 minutes
  },
  {
    id: '204',
    course_id: '2',
    title: 'Performance Optimization',
    order: 4,
    playback_id: 'mock-playback-id-204',
    duration: 3600, // 60 minutes
  },
];

// Mock Subtitles
export const mockSubtitles: Subtitle[] = [
  // Section 101 Subtitles
  {
    id: '1001',
    section_id: '101',
    language_code: 'en',
    subtitle_url: '/mock-subtitles/101-en.vtt'
  },
  {
    id: '1002',
    section_id: '101',
    language_code: 'es',
    subtitle_url: '/mock-subtitles/101-es.vtt'
  },
  // Section 102 Subtitles
  {
    id: '1003',
    section_id: '102',
    language_code: 'en',
    subtitle_url: '/mock-subtitles/102-en.vtt'
  },
  {
    id: '1004',
    section_id: '102',
    language_code: 'es',
    subtitle_url: '/mock-subtitles/102-es.vtt'
  },
];

// Mock Enrollments
export const mockEnrollments: Enrollment[] = [
  {
    id: '1001',
    user_id: '4',
    course_id: '1',
    enrolled_at: '2023-05-01T00:00:00Z',
    payment_status: 'paid'
  },
  {
    id: '1002',
    user_id: '4',
    course_id: '2',
    enrolled_at: '2023-05-02T00:00:00Z',
    payment_status: 'paid'
  },
]; 