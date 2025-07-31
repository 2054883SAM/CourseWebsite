import {
  convertDBChapterToVideoChapter,
  validateDBChapter,
  convertAndValidateChapters,
  sortChaptersByStartTime,
  validateChapterTimings
} from '@/lib/utils/chapters';
import { DBChapter, VideoChapter } from '@/lib/types/vdocipher';

describe('Chapter Utilities', () => {
  const validDBChapter: DBChapter = {
    id: 'chapter-1',
    title: 'Introduction',
    start_time: 0,
    duration: 120,
    description: 'Welcome to the course',
    thumbnail_url: 'https://example.com/thumb.jpg'
  };

  const validVideoChapter: VideoChapter = {
    id: 'chapter-1',
    title: 'Introduction',
    startTime: 0,
    duration: 120,
    description: 'Welcome to the course',
    thumbnail: 'https://example.com/thumb.jpg'
  };

  describe('convertDBChapterToVideoChapter', () => {
    it('should correctly convert DB chapter to video chapter', () => {
      const result = convertDBChapterToVideoChapter(validDBChapter);
      expect(result).toEqual(validVideoChapter);
    });

    it('should handle missing optional fields', () => {
      const minimalDBChapter: DBChapter = {
        id: 'chapter-1',
        title: 'Introduction',
        start_time: 0
      };

      const result = convertDBChapterToVideoChapter(minimalDBChapter);
      expect(result).toEqual({
        id: 'chapter-1',
        title: 'Introduction',
        startTime: 0
      });
    });
  });

  describe('validateDBChapter', () => {
    it('should validate correct DB chapter', () => {
      expect(validateDBChapter(validDBChapter)).toBe(true);
    });

    it('should validate minimal DB chapter', () => {
      const minimalChapter = {
        id: 'chapter-1',
        title: 'Introduction',
        start_time: 0
      };
      expect(validateDBChapter(minimalChapter)).toBe(true);
    });

    it('should reject invalid DB chapter', () => {
      const invalidChapters = [
        null,
        undefined,
        {},
        { id: 123 }, // wrong type
        { id: 'chapter-1' }, // missing required fields
        { id: 'chapter-1', title: 'Test' }, // missing start_time
        { id: 'chapter-1', title: 'Test', start_time: '0' }, // wrong type for start_time
        { id: 'chapter-1', title: 'Test', start_time: 0, duration: '120' } // wrong type for duration
      ];

      invalidChapters.forEach(chapter => {
        expect(validateDBChapter(chapter)).toBe(false);
      });
    });
  });

  describe('convertAndValidateChapters', () => {
    it('should convert valid chapters array', () => {
      const dbChapters = [validDBChapter];
      const result = convertAndValidateChapters(dbChapters);
      expect(result).toEqual([validVideoChapter]);
    });

    it('should filter out invalid chapters', () => {
      const mixedChapters = [
        validDBChapter,
        null,
        { id: 'invalid' },
        { ...validDBChapter, id: 'chapter-2' }
      ];
      const result = convertAndValidateChapters(mixedChapters);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('chapter-1');
      expect(result[1].id).toBe('chapter-2');
    });

    it('should return empty array for invalid input', () => {
      const invalidInputs = [null, undefined, {}, 'not-an-array', 123];
      invalidInputs.forEach(input => {
        expect(convertAndValidateChapters(input)).toEqual([]);
      });
    });
  });

  describe('sortChaptersByStartTime', () => {
    it('should sort chapters by start time', () => {
      const unsortedChapters: VideoChapter[] = [
        { id: '2', title: 'Second', startTime: 120 },
        { id: '1', title: 'First', startTime: 0 },
        { id: '3', title: 'Third', startTime: 240 }
      ];

      const result = sortChaptersByStartTime(unsortedChapters);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
      expect(result[2].id).toBe('3');
    });

    it('should not modify original array', () => {
      const original: VideoChapter[] = [
        { id: '2', title: 'Second', startTime: 120 },
        { id: '1', title: 'First', startTime: 0 }
      ];
      const originalCopy = [...original];

      sortChaptersByStartTime(original);
      expect(original).toEqual(originalCopy);
    });
  });

  describe('validateChapterTimings', () => {
    it('should validate non-overlapping chapters', () => {
      const validChapters: VideoChapter[] = [
        { id: '1', title: 'First', startTime: 0, duration: 60 },
        { id: '2', title: 'Second', startTime: 60, duration: 60 },
        { id: '3', title: 'Third', startTime: 120 }
      ];
      expect(validateChapterTimings(validChapters)).toBe(true);
    });

    it('should reject overlapping chapters', () => {
      const overlappingChapters: VideoChapter[] = [
        { id: '1', title: 'First', startTime: 0, duration: 70 },
        { id: '2', title: 'Second', startTime: 60, duration: 60 }
      ];
      expect(validateChapterTimings(overlappingChapters)).toBe(false);
    });

    it('should reject non-sequential chapters', () => {
      const nonSequentialChapters: VideoChapter[] = [
        { id: '1', title: 'First', startTime: 0 },
        { id: '2', title: 'Second', startTime: 0 }
      ];
      expect(validateChapterTimings(nonSequentialChapters)).toBe(false);
    });

    it('should handle single chapter', () => {
      const singleChapter: VideoChapter[] = [
        { id: '1', title: 'First', startTime: 0, duration: 60 }
      ];
      expect(validateChapterTimings(singleChapter)).toBe(true);
    });

    it('should handle empty chapters array', () => {
      expect(validateChapterTimings([])).toBe(true);
    });
  });
});