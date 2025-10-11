'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getEnrolledCourse } from '@/lib/supabase/learning';
import { getCourseById, getSectionById, getCourseSections } from '@/lib/supabase/courses';
import { updateSectionProgress, completeSectionProgress } from '@/lib/supabase/progress';
import { Section } from '@/lib/supabase/types';
import { normalizeChaptersToVideo } from '@/lib/utils/chapters';
import VdoCipherPlayer from '@/components/video/VdoCipherPlayer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import KidQuizModal from '@/components/quiz/KidQuizModal';
import { AnyQuestion, Flashcard } from '@/lib/types/quiz';

export default function SectionPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { user, dbUser, loading: authLoading } = useAuth();
  const [courseData, setCourseData] = useState<any>(null);
  const [sectionData, setSectionData] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const hasRequestedFlashcardsRef = useRef(false);
  const lastPostedProgressRef = useRef<number>(-1);
  const reachedHundredRef = useRef<boolean>(false);
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [questions, setQuestions] = useState<AnyQuestion[] | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [chapterFlashcard, setChapterFlashcard] = useState<Flashcard | null>(null);
  const [showChapterFlashcard, setShowChapterFlashcard] = useState(false);
  const [isGeneratingChapterFlashcard, setIsGeneratingChapterFlashcard] = useState(false);
  const [isGeneratingFinalFlashcards, setIsGeneratingFinalFlashcards] = useState(false);

  // Quiz UI moved to reusable component

  const courseId = params.courseId as string;
  const sectionId = params.sectionId as string;

  const getScoreMessage = (score: number) => {
    if (score >= 90)
      return {
        emoji: '🌟',
        message: 'Incroyable ! Tu es une superstar !',
        className: 'kid-result-success',
      };
    if (score >= 80)
      return {
        emoji: '🎉',
        message: 'Excellent travail ! Continue comme ça !',
        className: 'kid-result-success',
      };
    if (score >= 70)
      return {
        emoji: '👍',
        message: 'Bravo ! Tu peux continuer !',
        className: 'kid-result-success',
      };
    return {
      emoji: '💪',
      message: "Continue à t'entraîner ! Essaie d'obtenir 70% ou plus.",
      className: 'kid-result-failure',
    };
  };

  const saveQuizScore = async (score: number, passed: boolean) => {
    if (!user || !courseId || !sectionId) return;

    try {
      const response = await fetch(
        `/api/progress/section?courseId=${encodeURIComponent(courseId)}&sectionId=${encodeURIComponent(sectionId)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            progressPercentage: 100, // Video should be at 100% to take quiz
            quizScore: score,
            quizPassed: passed,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to save quiz score:', errorData);
      } else {
        console.log('Quiz score saved successfully');
      }
    } catch (error) {
      console.error('Failed to save quiz score:', error);
    }
  };

  useEffect(() => {
    // Prevent fetching data multiple times
    if (hasFetchedRef.current || (courseData && sectionData)) return;

    async function fetchData() {
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
          const cachedCourse = sessionStorage.getItem(`course_${courseId}`);
          const cachedSection = sessionStorage.getItem(`section_${sectionId}`);

          if (cachedCourse && cachedSection) {
            const parsedCourse = JSON.parse(cachedCourse);
            const parsedSection = JSON.parse(cachedSection);
            console.log('Using cached course and section data');
            setCourseData(parsedCourse);
            setSectionData(parsedSection);
            hasFetchedRef.current = true;
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Failed to read from session storage:', e);
          // Continue with API fetch if session storage fails
        }

        // If no cached data, fetch from API
        console.log('Fetching course and section data from API');

        // Admins can access any course without enrollment
        if (dbUser?.role === 'admin') {
          const [course, section] = await Promise.all([
            getCourseById(courseId),
            getSectionById(sectionId),
          ]);

          if (!course) {
            setError('Course not found');
            setLoading(false);
            return;
          }

          if (!section) {
            setError('Section not found');
            setLoading(false);
            return;
          }

          // Verify section belongs to course
          if (section.course_id !== courseId) {
            setError('Section does not belong to this course');
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
            section_count: course.section_count,
            creator: course.creator,
          };

          // Cache the result in session storage
          try {
            sessionStorage.setItem(`course_${courseId}`, JSON.stringify(adminCourseData));
            sessionStorage.setItem(`section_${sectionId}`, JSON.stringify(section));
          } catch (e) {
            console.warn('Failed to cache data:', e);
          }

          hasFetchedRef.current = true;
          setCourseData(adminCourseData);
          setSectionData(section);
          setLoading(false);
          return;
        }

        // For students, check enrollment first
        const [enrollmentResult, section] = await Promise.all([
          getEnrolledCourse(user.id, courseId),
          getSectionById(sectionId),
        ]);

        if (enrollmentResult.error || !enrollmentResult.data) {
          setError(enrollmentResult.error || 'Course not found or not enrolled');
          // Redirect to unauthorized page if not enrolled
          router.replace('/unauthorized?requiredRole=student');
          return;
        }

        if (!section) {
          setError('Section not found');
          setLoading(false);
          return;
        }

        // Verify section belongs to course
        if (section.course_id !== courseId) {
          setError('Section does not belong to this course');
          setLoading(false);
          return;
        }

        // Cache the result in session storage
        try {
          sessionStorage.setItem(`course_${courseId}`, JSON.stringify(enrollmentResult.data));
          sessionStorage.setItem(`section_${sectionId}`, JSON.stringify(section));
        } catch (e) {
          console.warn('Failed to cache data:', e);
        }

        // Mark as fetched and update state
        hasFetchedRef.current = true;
        setCourseData(enrollmentResult.data);
        setSectionData(section);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [courseId, sectionId, user, dbUser, authLoading, router, courseData, sectionData]);

  if (loading || authLoading) {
    return (
      <div className="background-beige min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="rounded-xl bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg p-8">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Chargement du contenu de la section...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="background-beige min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-4">
          <div className="rounded-xl bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg p-6 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="mb-4 text-xl font-bold text-red-800 dark:text-red-400">Erreur</h2>
            <p className="mb-6 text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={() => router.back()}
              className="rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 text-white font-medium transition-all duration-300 hover:from-red-600 hover:to-red-700 hover:shadow-lg transform hover:scale-105"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!courseData || !sectionData) {
    return null;
  }

  const normalizedChapters = normalizeChaptersToVideo(sectionData.chapters || []);

  // Render the VdoCipher video player for the specific section
  return (
    <div className="background-beige min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-300/40 via-amber-200/30 to-orange-400/40 animate-gradient-shift"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-400/35 to-orange-400/35 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-400/35 to-orange-400/35 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-amber-300/30 to-orange-300/30 rounded-full blur-2xl animate-pulse-slow"></div>
      </div>
      {/* Section Header */}
      <div className="border-b border-white/20 bg-white/90 backdrop-blur-sm dark:border-gray-700/20 dark:bg-gray-800/90 relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            {/* Top row: Back button and Duration */}
            <div className="flex items-center justify-between">
              {/* Back Button */}
              <button
                onClick={() => router.push(`/my-learning/${courseId}`)}
                className="group flex items-center text-gray-600 transition-all duration-300 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400"
              >
                <svg className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="font-medium">Retour au cours</span>
              </button>

              {/* Section Duration */}
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{Math.round(sectionData.duration || 0)} minutes</span>
              </div>
            </div>

            {/* Bottom row: Course and Section Info - Centered on mobile */}
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">{courseData.title}</p>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                <span className="block sm:inline">Section {sectionData.section_number}:</span>
                <span className="block sm:inline sm:ml-1 break-words">{sectionData.title}</span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        <VdoCipherPlayer
          videoId={sectionData.playback_id || ''}
          watermark={user?.email}
          chapters={normalizedChapters}
          className="w-full rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border-2 border-white/80 bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-md hover:shadow-[0_25px_80px_rgba(0,0,0,0.2)] hover:border-blue-600/60 transition-all duration-500 transform hover:-translate-y-1 dark:from-gray-800/90 dark:to-gray-900/90 dark:border-gray-600/80 dark:hover:border-orange-400/60 overflow-hidden"
          userId={user?.id}
          courseId={courseId}
          duration={sectionData.duration}
          onProgress={async (progressPercentage) => {
            // Stop progress updates if not logged in, if quiz is showing, or once 100% was recorded
            if (!user) return;
            if (showQuestions) return;
            if (reachedHundredRef.current) return;

            const rounded = Math.round(progressPercentage);
            if (rounded === lastPostedProgressRef.current) return;

            const shouldPost = rounded >= 98 || (rounded >= 0 && rounded % 5 === 0);
            if (!shouldPost) return;

            const toSend = rounded >= 98 ? 100 : rounded;
            try {
              const response = await fetch(
                `/api/progress/section?courseId=${encodeURIComponent(courseId)}&sectionId=${encodeURIComponent(sectionId)}`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    progressPercentage: toSend,
                  }),
                }
              );

              if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to update progress:', {
                  status: response.status,
                  statusText: response.statusText,
                  error: errorData,
                  progressData: { courseId, sectionId, progressPercentage: toSend },
                });
              } else {
                const successData = await response.json();
                console.log('Progress update successful:', successData);
                lastPostedProgressRef.current = toSend;
                if (toSend === 100) {
                  reachedHundredRef.current = true;
                }
              }
            } catch (error) {
              console.error('Failed to update section progress:', error);
            }
          }}
          onChapterComplete={async (chapter) => {
            if (!chapter) {
              return;
            }
            // Do not generate chapter flashcards for the LAST chapter
            try {
              const idx = normalizedChapters.findIndex((c) => c.id === chapter.id);
              if (idx >= 0 && idx === normalizedChapters.length - 1) {
                return;
              }
            } catch {}
            if (chapter.flashcard !== true) {
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
                body: JSON.stringify({ courseId, sectionId, startTime, duration }),
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
            // Mark video as 100% watched but NOT completed
            // Section is only completed when quiz is passed with 70%+
            if (user) {
              try {
                const response = await fetch(
                  `/api/progress/section?courseId=${encodeURIComponent(courseId)}&sectionId=${encodeURIComponent(sectionId)}`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      progressPercentage: 100,
                    }),
                  }
                );

                if (!response.ok) {
                  const errorData = await response.json();
                  console.error('Failed to update video progress:', errorData);
                } else {
                  console.log('Video progress updated to 100%');
                }
              } catch (error) {
                console.error('Failed to update video progress:', error);
              }
            }

            // Prevent duplicate requests
            if (hasRequestedFlashcardsRef.current) return;
            hasRequestedFlashcardsRef.current = true;
            // Prefer stored questions from sectionData
            const normalizeQuestions = (raw: any[]) => {
              const out: any[] = [];
              raw.forEach((q: any, idx: number) => {
                const type = String(q?.type || '').trim();
                if (type === 'flashcard') {
                  const question = String(q?.question || '').trim();
                  const choices = Array.isArray(q?.choices)
                    ? q.choices.map((c: any) => String(c))
                    : [];
                  const correctAnswer = String(q?.correctAnswer || '').trim();
                  if (question && choices.length >= 2 && correctAnswer) {
                    out.push({
                      id: Number(q?.id ?? idx + 1),
                      type: 'flashcard',
                      question,
                      choices,
                      correctAnswer,
                    });
                  }
                } else if (type === 'fillBlank') {
                  const sentence = String(q?.sentence || '').trim();
                  const choices = Array.isArray(q?.choices)
                    ? q.choices.map((c: any) => String(c))
                    : [];
                  const correctAnswer = String(q?.correctAnswer || q?.correct_answer || '').trim();
                  const title = q?.title != null ? String(q.title) : undefined;
                  const instructions = q?.instructions != null ? String(q.instructions) : undefined;
                  const feedback =
                    q?.feedback && typeof q.feedback === 'object'
                      ? {
                          correct:
                            q.feedback.correct != null ? String(q.feedback.correct) : undefined,
                          incorrect:
                            q.feedback.incorrect != null ? String(q.feedback.incorrect) : undefined,
                        }
                      : undefined;
                  if (sentence && choices.length >= 2 && correctAnswer) {
                    out.push({
                      id: Number(q?.id ?? idx + 1),
                      type: 'fillBlank',
                      title,
                      instructions,
                      sentence,
                      choices,
                      correctAnswer,
                      feedback,
                    });
                  }
                } else if (type === 'matchingGame' || type === 'matching') {
                  const pairs = Array.isArray(q?.pairs)
                    ? q.pairs.map((p: any) => ({
                        left: String(p?.left || '').trim(),
                        right: String(p?.right || '').trim(),
                      }))
                    : [];
                  const title = q?.title != null ? String(q.title) : undefined;
                  const instructions = q?.instructions != null ? String(q.instructions) : undefined;
                  const feedback =
                    q?.feedback && typeof q.feedback === 'object'
                      ? {
                          correct:
                            q.feedback.correct != null ? String(q.feedback.correct) : undefined,
                          incorrect:
                            q.feedback.incorrect != null ? String(q.feedback.incorrect) : undefined,
                        }
                      : undefined;
                  if (pairs.length >= 2) {
                    out.push({
                      id: Number(q?.id ?? idx + 1),
                      type: 'matchingGame',
                      title,
                      instructions,
                      pairs,
                      feedback,
                    });
                  }
                }
              });
              return out.slice(0, 8);
            };

            const hasStoredQuestions =
              Array.isArray((sectionData as any)?.questions) &&
              (sectionData as any)?.questions.length > 0;
            if (hasStoredQuestions) {
              const qs = normalizeQuestions((sectionData as any).questions);
              if (qs.length > 0) {
                setQuestions(qs);
                setShowQuestions(true);
                setIsGeneratingFinalFlashcards(false);
                return;
              }
            }

            setShowQuestions(true);
            setIsGeneratingFinalFlashcards(true);
            try {
              const res = await fetch('/api/video/generate-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sectionId, maxQuestions: 8 }),
              });
              if (!res.ok) {
                console.error('Failed to generate questions', await res.text());
                return;
              }
              const data = await res.json();
              if (Array.isArray(data?.questions) && data.questions.length > 0) {
                setQuestions(data.questions);
              }
            } catch (e) {
              console.error('Error generating questions:', e);
            } finally {
              setIsGeneratingFinalFlashcards(false);
            }
          }}
        />
      </div>

      {/* Chapter Flashcard Dialog */}
      {showChapterFlashcard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowChapterFlashcard(false)}
          />
          <div className="relative z-10 w-full max-w-xl mx-4 rounded-xl bg-white/95 backdrop-blur-sm border border-white/20 p-6 shadow-2xl dark:bg-zinc-900/95 dark:border-gray-700/20">
            {isGeneratingChapterFlashcard || !chapterFlashcard ? (
              <div className="flex flex-col items-center">
                <LoadingSpinner />
                <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                  Génération de la révision rapide…
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="font-medium">Révision rapide</span>
                </div>
                <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">{chapterFlashcard.question}</h3>
                <div className="grid grid-cols-1 gap-3">
                  {chapterFlashcard.choices.map((choice, idx) => {
                    const isSelected = selectedChoice === choice;
                    const isCorrect =
                      answerState !== 'idle' && choice === chapterFlashcard.correctAnswer;
                    const isIncorrect =
                      answerState === 'incorrect' &&
                      isSelected &&
                      choice !== chapterFlashcard.correctAnswer;
                    const base = 'w-full rounded-lg border-2 px-4 py-3 text-left transition-all duration-300 transform';
                    const idle =
                      'border-gray-200 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:border-orange-300 hover:scale-105 dark:border-zinc-700 dark:hover:bg-gradient-to-r dark:hover:from-orange-900/20 dark:hover:to-amber-900/20 dark:hover:border-orange-600';
                    const correct =
                      'border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 scale-105 shadow-lg dark:border-emerald-400 dark:bg-gradient-to-r dark:from-emerald-900/30 dark:to-green-900/30 dark:text-emerald-300';
                    const incorrect =
                      'border-red-500 bg-gradient-to-r from-red-50 to-pink-50 text-red-800 dark:border-red-400 dark:bg-gradient-to-r dark:from-red-900/30 dark:to-pink-900/30 dark:text-red-300';
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
                        <span className="mr-3 inline-block h-3 w-3 rounded-full bg-current opacity-60" />
                        <span className="font-medium">{choice}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-6 flex items-center justify-end">
                  <button
                    className="rounded-lg px-6 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800 transition-all duration-300 hover:scale-105"
                    onClick={() => setShowChapterFlashcard(false)}
                  >
                    Passer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Final Questions Dialog (Kid-Friendly Quiz Design) */}
      {showQuestions && (
        <KidQuizModal
          open={showQuestions}
          questions={questions}
          loading={isGeneratingFinalFlashcards || !questions}
          onClose={() => {
            setShowQuestions(false);
            hasRequestedFlashcardsRef.current = false;
          }}
          onFinished={(score, passed) => {
            saveQuizScore(score, passed);
          }}
          onRegenerate={async (previous) => {
            try {
              setIsGeneratingFinalFlashcards(true);
              const res = await fetch('/api/video/new-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sectionId,
                  maxQuestions: 8,
                  previous: Array.isArray(previous) ? previous : undefined,
                }),
              });
              if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data?.questions) && data.questions.length > 0) {
                  setQuestions(data.questions);
                  return data.questions;
                }
              } else {
                console.error('Failed to fetch new quiz', await res.text());
              }
            } catch (e) {
              console.error('Error regenerating quiz:', e);
            } finally {
              setIsGeneratingFinalFlashcards(false);
            }
            return questions;
          }}
          onContinue={async () => {
            try {
              const sections = await getCourseSections(courseId);
              if (Array.isArray(sections) && sections.length > 0) {
                const idx = sections.findIndex((s: any) => s.id === (sectionData?.id as string));
                const next = idx >= 0 ? sections[idx + 1] : undefined;
                if (next) {
                  router.push(`/my-learning/${courseId}/section/${next.id}`);
                  return;
                }
              }
              router.push(`/my-learning/${courseId}`);
            } catch (e) {
              console.error('Navigate to next section error:', e);
              router.push(`/my-learning/${courseId}`);
            }
          }}
          passThreshold={70}
          getScoreMessage={getScoreMessage}
        />
      )}

      {/* Final Flashcards Dialog */}
      {showFlashcards && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFlashcards(false)} />
          <div className="relative z-10 w-full max-w-xl mx-4 rounded-xl bg-white/95 backdrop-blur-sm border border-white/20 p-6 shadow-2xl dark:bg-zinc-900/95 dark:border-gray-700/20">
            {isGeneratingFinalFlashcards || !flashcards || flashcards.length === 0 ? (
              <div className="flex flex-col items-center">
                <LoadingSpinner />
                <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                  Génération des questions flash…
                </p>
              </div>
            ) : currentIndex >= flashcards.length ? (
              <div className="text-center">
                <div className="mb-6">
                  <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center mb-4">
                    <span className="text-2xl">🎉</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Bravo!</h3>
                </div>
                <p className="mb-8 text-gray-600 dark:text-gray-300 text-lg">
                  Tu as terminé toutes les questions flash.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-white font-medium transition-all duration-300 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg transform hover:scale-105"
                    onClick={() => setShowFlashcards(false)}
                  >
                    Fermer
                  </button>
                  <button
                    className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-white font-medium transition-all duration-300 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg transform hover:scale-105"
                    onClick={() => router.push(`/my-learning/${courseId}`)}
                  >
                    Retour au cours
                  </button>
                </div>
              </div>
            ) : (
              (() => {
                const card = flashcards[currentIndex];
                return (
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span className="font-medium">Questions Flash</span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {currentIndex + 1} / {flashcards.length}
                      </div>
                    </div>
                    <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">{card.question}</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {card.choices.map((choice, idx) => {
                        const isSelected = selectedChoice === choice;
                        const isCorrect = answerState !== 'idle' && choice === card.correctAnswer;
                        const isIncorrect =
                          answerState === 'incorrect' &&
                          isSelected &&
                          choice !== card.correctAnswer;
                        const base = 'w-full rounded-lg border-2 px-4 py-3 text-left transition-all duration-300 transform';
                        const idle =
                          'border-gray-200 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:border-orange-300 hover:scale-105 dark:border-zinc-700 dark:hover:bg-gradient-to-r dark:hover:from-orange-900/20 dark:hover:to-amber-900/20 dark:hover:border-orange-600';
                        const correct =
                          'border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 scale-105 shadow-lg dark:border-emerald-400 dark:bg-gradient-to-r dark:from-emerald-900/30 dark:to-green-900/30 dark:text-emerald-300';
                        const incorrect =
                          'border-red-500 bg-gradient-to-r from-red-50 to-pink-50 text-red-800 dark:border-red-400 dark:bg-gradient-to-r dark:from-red-900/30 dark:to-pink-900/30 dark:text-red-300';
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
                            <span className="mr-3 inline-block h-3 w-3 rounded-full bg-current opacity-60" />
                            <span className="font-medium">{choice}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-6 flex items-center justify-end">
                      <button
                        className="rounded-lg px-6 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800 transition-all duration-300 hover:scale-105"
                        onClick={() => setShowFlashcards(false)}
                      >
                        Quitter
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
