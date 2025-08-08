import { DBChapter, VideoChapter } from '@/lib/types/vdocipher';

/**
 * Converts database chapter format to VdoCipherPlayer chapter format
 */
export function convertDBChapterToVideoChapter(dbChapter: DBChapter): VideoChapter {
  return {
    id: dbChapter.id,
    title: dbChapter.title,
    startTime: dbChapter.start_time,
    duration: dbChapter.duration,
    description: dbChapter.description,
    thumbnail: dbChapter.thumbnail_url
  };
}

/**
 * Validates a chapter object from the database
 */
export function validateDBChapter(chapter: unknown): chapter is DBChapter {
  if (!chapter || typeof chapter !== 'object') return false;

  const c = chapter as Record<string, unknown>;

  return (
    typeof c.id === 'string' &&
    typeof c.title === 'string' &&
    typeof c.start_time === 'number' &&
    (c.duration === undefined || typeof c.duration === 'number') &&
    (c.description === undefined || typeof c.description === 'string') &&
    (c.thumbnail_url === undefined || typeof c.thumbnail_url === 'string')
  );
}

/**
 * Validates and converts chapters array from database to VdoCipherPlayer format
 * Returns empty array if validation fails
 */
export function convertAndValidateChapters(dbChapters: unknown): VideoChapter[] {
  if (!Array.isArray(dbChapters)) return [];

  const validChapters = dbChapters.filter(validateDBChapter);
  return validChapters.map(convertDBChapterToVideoChapter);
}

/**
 * Sorts chapters by start time
 */
export function sortChaptersByStartTime(chapters: VideoChapter[]): VideoChapter[] {
  return [...chapters].sort((a, b) => a.startTime - b.startTime);
}

/**
 * Validates that chapters don't overlap and have valid durations
 */
export function validateChapterTimings(chapters: VideoChapter[]): boolean {
  const sortedChapters = sortChaptersByStartTime(chapters);

  for (let i = 0; i < sortedChapters.length - 1; i++) {
    const current = sortedChapters[i];
    const next = sortedChapters[i + 1];

    // If current chapter has duration, check it doesn't overlap with next chapter
    if (current.duration) {
      const currentEnd = current.startTime + current.duration;
      if (currentEnd > next.startTime) {
        return false;
      }
    }

    // Ensure chapters are sequential
    if (current.startTime >= next.startTime) {
      return false;
    }
  }

  return true;
}

/**
 * Type guard for VideoChapter objects
 */
export function isVideoChapter(chapter: unknown): chapter is VideoChapter {
  if (!chapter || typeof chapter !== 'object') return false;
  const c = chapter as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.title === 'string' &&
    typeof c.startTime === 'number' &&
    (c.duration === undefined || typeof c.duration === 'number') &&
    (c.description === undefined || typeof c.description === 'string') &&
    (c.thumbnail === undefined || typeof c.thumbnail === 'string')
  );
}

/**
 * Robust normalizer that accepts unknown input (possibly stringified JSON),
 * and returns a VideoChapter[] by handling both DBChapter[] and VideoChapter[] shapes.
 */
export function normalizeChaptersToVideo(input: unknown): VideoChapter[] {
  try {
    let value: unknown = input;
    if (typeof value === 'string') {
      value = JSON.parse(value);
    }
    if (!Array.isArray(value)) return [];

    // If already in VideoChapter shape
    if (value.every(isVideoChapter)) {
      return value as VideoChapter[];
    }

    // If in DBChapter shape
    if (value.every(validateDBChapter)) {
      return (value as DBChapter[]).map(convertDBChapterToVideoChapter);
    }

    // Mixed or invalid; try best-effort mapping
    const result: VideoChapter[] = [];
    for (const item of value) {
      if (isVideoChapter(item)) {
        result.push(item);
      } else if (validateDBChapter(item)) {
        result.push(convertDBChapterToVideoChapter(item));
      }
    }
    return result;
  } catch (e) {
    return [];
  }
}