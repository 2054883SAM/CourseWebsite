'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getEnrolledCourse } from '@/lib/supabase/learning';
import { getCourseById } from '@/lib/supabase/courses';
import { normalizeChaptersToVideo } from '@/lib/utils/chapters';
import VdoCipherPlayer from '@/components/video/VdoCipherPlayer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function CoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { user, dbUser, loading: authLoading } = useAuth();
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const hasRequestedFlashcardsRef = useRef(false);

  type Flashcard = { id: number; question: string; choices: string[]; correctAnswer: string };
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [chapterFlashcard, setChapterFlashcard] = useState<Flashcard | null>(null);
  const [showChapterFlashcard, setShowChapterFlashcard] = useState(false);
  const [isGeneratingChapterFlashcard, setIsGeneratingChapterFlashcard] = useState(false);
  const [isGeneratingFinalFlashcards, setIsGeneratingFinalFlashcards] = useState(false);

  const courseId = params.courseId as string;

  useEffect(() => {
    // Prevent fetching course data multiple times
    if (hasFetchedRef.current || courseData) return;

    async function fetchCourse() {
      // Wait for auth to be ready
      if (authLoading) return;

      // Redirect if not authenticated
      if (!user) {
        router.replace('/unauthorized?requiredRole=student');
        return;
      }

      try {
        setLoading(true);
        
        // Try to get data from session storage first
        try {
          const cachedData = sessionStorage.getItem(`course_${courseId}`);
          if (cachedData) {
            const parsedData = JSON.parse(cachedData);
            console.log('Using cached course data');
            setCourseData(parsedData);
            hasFetchedRef.current = true;
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Failed to read from session storage:', e);
          // Continue with API fetch if session storage fails
        }
        
        // If no cached data, fetch from API
        console.log('Fetching course data from API');

        // Admins can access any course without enrollment
        if (dbUser?.role === 'admin') {
          const course = await getCourseById(courseId);
          if (!course) {
            setError('Course not found');
            setLoading(false);
            return;
          }

          const adminCourseData = {
            id: course.id,
            title: course.title,
            description: course.description,
            thumbnail_url: course.thumbnail_url,
            created_at: course.created_at,
            creator_id: course.creator_id,
            playbackId: (course as any).playback_id,
            chapters: normalizeChaptersToVideo((course as any).chapters),
            duration: (course as any).duration,
          } as any;

          // Cache the result in session storage
          try {
            sessionStorage.setItem(`course_${courseId}`, JSON.stringify(adminCourseData));
          } catch (e) {
            console.warn('Failed to cache course data:', e);
          }

          hasFetchedRef.current = true;
          setCourseData(adminCourseData);
          setLoading(false);
          return;
        }

        const result = await getEnrolledCourse(user.id, courseId);

        if (result.error || !result.data) {
          setError(result.error || 'Course not found');
          // Redirect to unauthorized page if not enrolled (non-admin)
          router.replace('/unauthorized?requiredRole=student');
          return;
        }

        // Cache the result in session storage
        try {
          sessionStorage.setItem(`course_${courseId}`, JSON.stringify(result.data));
        } catch (e) {
          console.warn('Failed to cache course data:', e);
        }

        // Mark as fetched and update state
        hasFetchedRef.current = true;
        setCourseData(result.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [courseId, user, dbUser, authLoading, router, courseData]);

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your course content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-md rounded-lg bg-red-50 p-6 text-center dark:bg-red-900/20">
          <h2 className="mb-4 text-xl font-semibold text-red-800 dark:text-red-400">Error</h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return null;
  }

  // Render the VdoCipher video player with the course data
  return (
    <div className="flex flex-col gap-4">
    <VdoCipherPlayer
      videoId={courseData.playbackId || ''}
      watermark={user?.email}
      chapters={courseData.chapters || []}
      className="w-full"
      userId={user?.id}
      courseId={courseId}
      duration={courseData.duration}
      onChapterComplete={async (chapter) => {
        if (!chapter || chapter.flashcard !== true) {
          return;
        }
        setShowChapterFlashcard(true);
        setIsGeneratingChapterFlashcard(true);
        try {
          const startTime = chapter.startTime;
          const duration = typeof chapter.duration === 'number' ? chapter.duration : undefined;
          const res = await fetch('/api/video/generate-chapter-flashcard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId, startTime, duration }),
          });
          if (!res.ok) {
            console.error('Failed to generate chapter flashcard', await res.text());
            return;
          }
          const data = await res.json();
          if (data?.flashcard) {
            setChapterFlashcard(data.flashcard as Flashcard);
            setSelectedChoice(null);
            setAnswerState('idle');
          }
        } catch (e) {
          console.error('Error generating chapter flashcard:', e);
        } finally {
          setIsGeneratingChapterFlashcard(false);
        }
      }}
      onComplete={async () => {
        // Prevent duplicate requests
        if (hasRequestedFlashcardsRef.current) return;
        hasRequestedFlashcardsRef.current = true;
        setShowFlashcards(true);
        setIsGeneratingFinalFlashcards(true);
        try {
          const res = await fetch('/api/video/generate-flashcards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId }),
          });
          if (!res.ok) {
            console.error('Failed to generate flashcards', await res.text());
            return;
          }
          const data = await res.json();
          if (Array.isArray(data?.flashcards) && data.flashcards.length > 0) {
            setFlashcards(data.flashcards as Flashcard[]);
            setCurrentIndex(0);
            setSelectedChoice(null);
            setAnswerState('idle');
          }
        } catch (e) {
          console.error('Error generating flashcards:', e);
        } finally {
          setIsGeneratingFinalFlashcards(false);
        }
      }}
    />

    {/* Chapter Flashcard Dialog */}
    {showChapterFlashcard && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={() => setShowChapterFlashcard(false)} />
        <div className="relative z-10 w-full max-w-xl rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
          {isGeneratingChapterFlashcard || !chapterFlashcard ? (
            <div className="flex flex-col items-center">
              <LoadingSpinner />
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">Génération de la révision rapide…</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-500">Révision rapide</div>
              <h3 className="mb-4 text-lg font-semibold">{chapterFlashcard.question}</h3>
              <div className="grid grid-cols-1 gap-3">
                {chapterFlashcard.choices.map((choice, idx) => {
                  const isSelected = selectedChoice === choice;
                  const isCorrect = answerState !== 'idle' && choice === chapterFlashcard.correctAnswer;
                  const isIncorrect = answerState === 'incorrect' && isSelected && choice !== chapterFlashcard.correctAnswer;
                  const base = 'w-full rounded border px-4 py-3 text-left transition-colors';
                  const idle = 'border-gray-300 hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800';
                  const correct = 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-300';
                  const incorrect = 'border-red-600 bg-red-50 text-red-800 dark:border-red-500 dark:bg-red-900/30 dark:text-red-300';
                  let cls = base + ' ' + idle;
                  if (isCorrect) cls = base + ' ' + correct;
                  if (isIncorrect) cls = base + ' ' + incorrect;
                  return (
                    <button
                      key={idx}
                      className={cls}
                      onClick={() => {
                        if (answerState !== 'idle' || !chapterFlashcard) return;
                        setSelectedChoice(choice);
                        const correctNow = choice === chapterFlashcard.correctAnswer;
                        if (correctNow) {
                          setAnswerState('correct');
                          setTimeout(() => {
                            setAnswerState('idle');
                            setSelectedChoice(null);
                            setShowChapterFlashcard(false);
                          }, 700);
                        } else {
                          setAnswerState('incorrect');
                          setTimeout(() => {
                            setAnswerState('idle');
                            setSelectedChoice(null);
                          }, 800);
                        }
                      }}
                      disabled={answerState !== 'idle'}
                    >
                      <span className="mr-2 inline-block h-2 w-2 rounded-full bg-current opacity-50" />
                      {choice}
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center justify-end">
                <button
                  className="rounded px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
                  onClick={() => setShowChapterFlashcard(false)}
                >
                  Skip
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )}

    {/* Final Flashcards Dialog */}
    {showFlashcards && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={() => setShowFlashcards(false)} />
        <div className="relative z-10 w-full max-w-xl rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
          {isGeneratingFinalFlashcards || !flashcards || flashcards.length === 0 ? (
            <div className="flex flex-col items-center">
              <LoadingSpinner />
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">Génération des questions flash…</p>
            </div>
          ) : currentIndex >= flashcards.length ? (
            <div className="text-center">
              <h3 className="mb-4 text-xl font-semibold">Bravo! 🎉</h3>
              <p className="mb-6 text-gray-600 dark:text-gray-300">Tu as terminé toutes les questions flash.</p>
              <button
                className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                onClick={() => setShowFlashcards(false)}
              >
                Close
              </button>
            </div>
          ) : (
            (() => {
              const card = flashcards[currentIndex];
              return (
                <div>
                  <div className="mb-4 text-sm text-gray-500">Question {currentIndex + 1} of {flashcards.length}</div>
                  <h3 className="mb-4 text-lg font-semibold">{card.question}</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {card.choices.map((choice, idx) => {
                      const isSelected = selectedChoice === choice;
                      const isCorrect = answerState !== 'idle' && choice === card.correctAnswer;
                      const isIncorrect = answerState === 'incorrect' && isSelected && choice !== card.correctAnswer;
                      const base = 'w-full rounded border px-4 py-3 text-left transition-colors';
                      const idle = 'border-gray-300 hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800';
                      const correct = 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-300';
                      const incorrect = 'border-red-600 bg-red-50 text-red-800 dark:border-red-500 dark:bg-red-900/30 dark:text-red-300';
                      let cls = base + ' ' + idle;
                      if (isCorrect) cls = base + ' ' + correct;
                      if (isIncorrect) cls = base + ' ' + incorrect;
                      return (
                        <button
                          key={idx}
                          className={cls}
                          onClick={() => {
                            if (answerState !== 'idle' || !flashcards) return;
                            setSelectedChoice(choice);
                            const current = flashcards[currentIndex];
                            const correctNow = choice === current.correctAnswer;
                            if (correctNow) {
                              setAnswerState('correct');
                              setTimeout(() => {
                                setAnswerState('idle');
                                setSelectedChoice(null);
                                setCurrentIndex((i) => i + 1);
                              }, 700);
                            } else {
                              setAnswerState('incorrect');
                              setTimeout(() => {
                                setFlashcards((cards) => {
                                  if (!cards) return cards;
                                  const next = cards.slice();
                                  const [removed] = next.splice(currentIndex, 1);
                                  next.push(removed);
                                  return next;
                                });
                                setAnswerState('idle');
                                setSelectedChoice(null);
                              }, 800);
                            }
                          }}
                          disabled={answerState !== 'idle'}
                        >
                          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-current opacity-50" />
                          {choice}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-6 flex items-center justify-end">
                    <button
                      className="rounded px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
                      onClick={() => setShowFlashcards(false)}
                    >
                      Exit
                    </button>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>
    )}
    </div>
  );
}
