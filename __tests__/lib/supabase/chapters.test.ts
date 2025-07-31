import { updateCourseChapters, getChaptersForCourse, clearCourseChapters } from '@/lib/supabase/chapters';
import { VideoChapter } from '@/lib/types/vdocipher';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}));

describe('Supabase Chapter Functions', () => {
  let mockSupabase: any;

  const validChapters: VideoChapter[] = [
    {
      id: 'chapter-1',
      title: 'Introduction',
      startTime: 0,
      duration: 120,
      description: 'Welcome to the course'
    },
    {
      id: 'chapter-2',
      title: 'Getting Started',
      startTime: 120,
      duration: 180,
      description: 'Basic setup'
    }
  ];

  beforeEach(() => {
    // Reset mocks
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn()
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('updateCourseChapters', () => {
    it('should successfully update chapters', async () => {
      mockSupabase.eq.mockResolvedValue({ error: null });

      const result = await updateCourseChapters(mockSupabase, 'course-1', validChapters);

      expect(result.error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith('courses');
      expect(mockSupabase.update).toHaveBeenCalledWith({
        chapters: expect.arrayContaining([
          expect.objectContaining({
            id: 'chapter-1',
            start_time: 0
          })
        ])
      });
    });

    it('should reject overlapping chapters', async () => {
      const overlappingChapters: VideoChapter[] = [
        {
          id: 'chapter-1',
          title: 'First',
          startTime: 0,
          duration: 70
        },
        {
          id: 'chapter-2',
          title: 'Second',
          startTime: 60,
          duration: 60
        }
      ];

      const result = await updateCourseChapters(mockSupabase, 'course-1', overlappingChapters);

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toContain('Invalid chapter timings');
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockSupabase.eq.mockResolvedValue({ error: new Error('Database error') });

      const result = await updateCourseChapters(mockSupabase, 'course-1', validChapters);

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toBe('Database error');
    });
  });

  describe('getChaptersForCourse', () => {
    it('should successfully get chapters', async () => {
      // Mock DB format chapters
      const dbChapters = validChapters.map(chapter => ({
        id: chapter.id,
        title: chapter.title,
        start_time: chapter.startTime,
        duration: chapter.duration,
        description: chapter.description,
        thumbnail_url: chapter.thumbnail
      }));

      mockSupabase.single.mockResolvedValue({
        data: { chapters: dbChapters },
        error: null
      });

      const result = await getChaptersForCourse(mockSupabase, 'course-1');

      expect(result.error).toBeNull();
      expect(result.chapters).toHaveLength(2);
      expect(result.chapters[0].id).toBe('chapter-1');
      expect(mockSupabase.from).toHaveBeenCalledWith('courses');
      expect(mockSupabase.select).toHaveBeenCalledWith('chapters');
    });

    it('should handle missing chapters', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await getChaptersForCourse(mockSupabase, 'course-1');

      expect(result.error).toBeNull();
      expect(result.chapters).toEqual([]);
    });

    it('should handle invalid chapter data', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { chapters: [{ invalid: 'data' }] },
        error: null
      });

      const result = await getChaptersForCourse(mockSupabase, 'course-1');

      expect(result.error).toBeNull();
      expect(result.chapters).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: new Error('Database error')
      });

      const result = await getChaptersForCourse(mockSupabase, 'course-1');

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toBe('Database error');
      expect(result.chapters).toEqual([]);
    });
  });

  describe('clearCourseChapters', () => {
    it('should successfully clear chapters', async () => {
      mockSupabase.eq.mockResolvedValue({ error: null });

      const result = await clearCourseChapters(mockSupabase, 'course-1');

      expect(result.error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith('courses');
      expect(mockSupabase.update).toHaveBeenCalledWith({ chapters: [] });
    });

    it('should handle database errors', async () => {
      mockSupabase.eq.mockResolvedValue({ error: new Error('Database error') });

      const result = await clearCourseChapters(mockSupabase, 'course-1');

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toBe('Database error');
    });
  });
});