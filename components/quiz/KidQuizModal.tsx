'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnyQuestion, ScoreMessage } from '@/lib/types/quiz';

export type KidQuizModalProps = {
  open: boolean;
  questions: AnyQuestion[] | null;
  loading?: boolean;
  onClose: () => void;
  onFinished: (score: number, passed: boolean) => void;
  onRegenerate: (previous: AnyQuestion[] | null) => Promise<AnyQuestion[] | null>;
  onContinue: () => void;
  passThreshold?: number; // default 70
  getScoreMessage?: (score: number) => ScoreMessage;
};

export default function KidQuizModal(props: KidQuizModalProps) {
  const {
    open,
    questions,
    loading = false,
    onClose,
    onFinished,
    onRegenerate,
    onContinue,
    passThreshold = 70,
    getScoreMessage,
  } = props;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [matchSelections, setMatchSelections] = useState<Record<number, Record<number, string>>>(
    {}
  );
  const [matchErrors, setMatchErrors] = useState<Record<number, boolean>>({});
  const [matchSubmitted, setMatchSubmitted] = useState<Record<number, boolean>>({});
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showScoreResult, setShowScoreResult] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const defaultGetScoreMessage = (score: number): ScoreMessage => {
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

  const scoreMessageFn = getScoreMessage || defaultGetScoreMessage;

  const resetState = () => {
    setCurrentIndex(0);
    setCorrectAnswers(0);
    setTotalAnswered(0);
    setQuizCompleted(false);
    setShowScoreResult(false);
    setSelectedChoice(null);
    setAnswerState('idle');
    setMatchSubmitted({});
    setMatchErrors({});
    setMatchSelections({});
  };

  useEffect(() => {
    if (!open) return;
    // whenever questions change while open, reset quiz
    resetState();
  }, [open, questions]);

  const handleCorrect = () => {
    setCorrectAnswers((v) => v + 1);
    setTotalAnswered((v) => v + 1);
  };
  const handleIncorrect = () => {
    setTotalAnswered((v) => v + 1);
  };

  const calculateScore = useMemo(() => {
    return () => (totalAnswered === 0 ? 0 : Math.round((correctAnswers / totalAnswered) * 100));
  }, [correctAnswers, totalAnswered]);

  const handleRegenerate = async () => {
    if (isRegenerating) return;
    setIsRegenerating(true);
    try {
      const next = await onRegenerate(questions || null);
      if (Array.isArray(next) && next.length > 0) {
        // parent will pass them back via props; this reset keeps UX smooth
        resetState();
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 to-pink-900/80" />
      <div className="relative z-10 w-full max-w-2xl">
        {loading || !questions ? (
          <div className="kid-quiz-container">
            <div className="flex flex-col items-center">
              <div className="kid-loader">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-3 text-lg font-semibold text-white">
                <span className="kid-emoji">🧠</span> Préparation de ton quiz amusant...
              </p>
            </div>
          </div>
        ) : showScoreResult ? (
          <div className="kid-quiz-container">
            <div className="kid-confetti"></div>
            <div className="kid-confetti"></div>
            <div className="kid-confetti"></div>
            <div className="kid-confetti"></div>

            <div className="text-center">
              {(() => {
                const score = calculateScore();
                const scoreData = scoreMessageFn(score);
                const passed = score >= passThreshold;
                return (
                  <div className={`kid-result-message ${scoreData.className}`}>
                    <div
                      className="kid-emoji bounce"
                      style={{ fontSize: '4rem', marginBottom: '1rem' }}
                    >
                      {scoreData.emoji}
                    </div>
                    <div className="kid-score-display mb-6 justify-center">
                      <span>Score : {score}%</span>
                      <span>
                        ({correctAnswers}/{totalAnswered})
                      </span>
                    </div>
                    <h3 className="mb-4 text-2xl font-bold">{scoreData.message}</h3>
                    <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
                      {passed ? (
                        <>
                          <button
                            className="kid-btn-secondary"
                            onClick={() => {
                              onClose();
                              onContinue();
                            }}
                          >
                            <span className="kid-emoji">✨</span> Continuer à apprendre
                          </button>
                          <button
                            className="kid-btn-primary"
                            onClick={handleRegenerate}
                            disabled={isRegenerating}
                          >
                            <span className="kid-emoji">🔁</span> Refaire le quiz
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="kid-btn-primary"
                            onClick={handleRegenerate}
                            disabled={isRegenerating}
                          >
                            <span className="kid-emoji">🔄</span> Réessayer
                          </button>
                          <button className="kid-btn-secondary" onClick={onClose}>
                            <span className="kid-emoji">📚</span> Étudier plus
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        ) : currentIndex >= questions.length ? (
          (() => {
            if (!quizCompleted) {
              setQuizCompleted(true);
              setShowScoreResult(true);
              const score = calculateScore();
              const passed = score >= passThreshold;
              onFinished(score, passed);
            }
            return null;
          })()
        ) : (
          <div className="kid-quiz-container">
            <div className="kid-confetti"></div>
            <div className="kid-confetti"></div>
            <div className="kid-confetti"></div>
            <div className="kid-confetti"></div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-lg font-bold text-white">
                  <span className="kid-emoji">🎯</span> Question {currentIndex + 1} sur{' '}
                  {questions.length}
                </span>
                <div className="kid-score-display">
                  <span className="kid-emoji">⭐</span>
                  <span>
                    {correctAnswers}/{totalAnswered}
                  </span>
                </div>
              </div>
              <div className="kid-progress-bar">
                <div
                  className="kid-progress-fill"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Content */}
            <div className="kid-question-card">
              {(() => {
                const q: any = questions[currentIndex];
                if (q.type === 'flashcard') {
                  const card = q as any;
                  return (
                    <div>
                      <h3 className="mb-6 text-center text-2xl font-bold text-gray-800">
                        <span className="kid-emoji">🤔</span> {card.question}
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {card.choices.map((choice: string, idx: number) => {
                          const isSelected = selectedChoice === choice;
                          const isCorrect = answerState !== 'idle' && choice === card.correctAnswer;
                          const isIncorrect =
                            answerState === 'incorrect' &&
                            isSelected &&
                            choice !== card.correctAnswer;

                          let className = 'kid-answer-btn';
                          if (isCorrect) className += ' correct';
                          if (isIncorrect) className += ' incorrect';

                          const emojis = ['🅰️', '🅱️', '🅰️', '🅱️'];

                          return (
                            <button
                              key={idx}
                              className={className}
                              onClick={() => {
                                if (answerState !== 'idle') return;
                                setSelectedChoice(choice);
                                const correctNow = choice === card.correctAnswer;
                                if (correctNow) {
                                  handleCorrect();
                                  setAnswerState('correct');
                                  setTimeout(() => {
                                    setAnswerState('idle');
                                    setSelectedChoice(null);
                                    setCurrentIndex((i) => i + 1);
                                  }, 1200);
                                } else {
                                  handleIncorrect();
                                  setAnswerState('incorrect');
                                  setTimeout(() => {
                                    setAnswerState('idle');
                                    setSelectedChoice(null);
                                    setCurrentIndex((i) => i + 1);
                                  }, 1200);
                                }
                              }}
                              disabled={answerState !== 'idle'}
                            >
                              <span className="text-2xl">{emojis[idx % emojis.length]}</span>
                              <span className="flex-1 text-left">{choice}</span>
                              {isCorrect && <span className="text-2xl">✅</span>}
                              {isIncorrect && <span className="text-2xl">❌</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                if (q.type === 'fillBlank') {
                  const fb = q as any;
                  const displayed = String(fb.sentence || '').replace('____', '______');
                  return (
                    <div>
                      {fb.title && (
                        <h3 className="mb-4 text-center text-2xl font-bold text-gray-800">
                          <span className="kid-emoji">✏️</span> {fb.title}
                        </h3>
                      )}
                      {fb.instructions && (
                        <p className="mb-4 text-center text-lg font-medium text-gray-700">
                          {fb.instructions}
                        </p>
                      )}
                      <div className="border-3 mb-6 rounded-2xl border-dashed border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                        <p className="text-center text-xl font-bold leading-relaxed text-gray-800">
                          <span className="kid-emoji">📝</span> {displayed}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {fb.choices.map((choice: string, idx: number) => {
                          const isSelected = selectedChoice === choice;
                          const isCorrect = answerState !== 'idle' && choice === fb.correctAnswer;
                          const isIncorrect =
                            answerState === 'incorrect' &&
                            isSelected &&
                            choice !== fb.correctAnswer;

                          let className = 'kid-answer-btn text-center';
                          if (isCorrect) className += ' correct';
                          if (isIncorrect) className += ' incorrect';

                          return (
                            <button
                              key={idx}
                              className={className}
                              onClick={() => {
                                if (answerState !== 'idle') return;
                                setSelectedChoice(choice);
                                const correctNow = choice === fb.correctAnswer;
                                if (correctNow) {
                                  handleCorrect();
                                  setAnswerState('correct');
                                  setTimeout(() => {
                                    setAnswerState('idle');
                                    setSelectedChoice(null);
                                    setCurrentIndex((i) => i + 1);
                                  }, 1200);
                                } else {
                                  handleIncorrect();
                                  setAnswerState('incorrect');
                                  setTimeout(() => {
                                    setAnswerState('idle');
                                    setSelectedChoice(null);
                                    setCurrentIndex((i) => i + 1);
                                  }, 1200);
                                }
                              }}
                              disabled={answerState !== 'idle'}
                            >
                              <span className="font-bold">{choice}</span>
                              {isCorrect && <span className="ml-2">✅</span>}
                              {isIncorrect && <span className="ml-2">❌</span>}
                            </button>
                          );
                        })}
                      </div>
                      {answerState !== 'idle' && fb.feedback && (
                        <div
                          className={`mt-6 rounded-xl p-4 text-center font-semibold ${
                            answerState === 'correct'
                              ? 'border-2 border-green-300 bg-green-100 text-green-800'
                              : 'border-2 border-orange-300 bg-orange-100 text-orange-800'
                          }`}
                        >
                          <span className="kid-emoji">
                            {answerState === 'correct' ? '🎉' : '💪'}
                          </span>{' '}
                          {answerState === 'correct'
                            ? fb.feedback.correct || 'Fantastique !'
                            : fb.feedback.incorrect || 'Continue à essayer !'}
                        </div>
                      )}
                    </div>
                  );
                }
                if (q.type === 'matchingGame') {
                  const mg = q as any;
                  const lefts: string[] = mg.pairs.map((p: any) => p.left);
                  const rights: string[] = mg.pairs.map((p: any) => p.right);
                  const sel: Record<number, string> = (matchSelections as any)[currentIndex] || {};
                  const handleSelect = (idx: number, value: string) => {
                    setMatchSelections(
                      (prev) =>
                        ({
                          ...(prev as any),
                          [currentIndex]: { ...(prev as any)[currentIndex], [idx]: value },
                        }) as any
                    );
                  };
                  const handleSubmit = () => {
                    const errs: Record<number, boolean> = {};
                    let correctCount = 0;
                    mg.pairs.forEach((pair: any, idx: number) => {
                      const chosen = sel[idx];
                      if (!chosen || chosen !== pair.right) {
                        errs[idx] = true;
                      } else {
                        correctCount++;
                      }
                    });
                    setMatchErrors(errs);
                    const allCorrect = Object.values(errs).every((v) => v === false);
                    setMatchSubmitted((prev) => ({ ...prev, [currentIndex]: true }));
                    if (allCorrect) {
                      handleCorrect();
                      setTimeout(() => {
                        setMatchErrors({});
                        setMatchSelections((prev) => ({ ...prev, [currentIndex]: {} }) as any);
                        setMatchSubmitted((prev) => ({ ...prev, [currentIndex]: false }));
                        setCurrentIndex((i) => i + 1);
                      }, 1500);
                    } else {
                      handleIncorrect();
                    }
                  };
                  return (
                    <div>
                      {mg.title && (
                        <h3 className="mb-4 text-center text-2xl font-bold text-gray-800">
                          <span className="kid-emoji">🔗</span> {mg.title}
                        </h3>
                      )}
                      {mg.instructions && (
                        <p className="mb-6 text-center text-lg font-medium text-gray-700">
                          {mg.instructions}
                        </p>
                      )}
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {lefts.map((left, idx) => (
                          <div
                            key={idx}
                            className={`border-3 rounded-2xl p-4 transition-all ${
                              matchSubmitted[currentIndex] && matchErrors[idx]
                                ? 'animate-wiggle border-red-400 bg-red-50'
                                : matchSubmitted[currentIndex] && sel[idx] && !matchErrors[idx]
                                  ? 'border-green-400 bg-green-50'
                                  : sel[idx]
                                    ? 'border-blue-400 bg-blue-100'
                                    : 'border-blue-300 bg-blue-50'
                            }`}
                          >
                            <div className="mb-3 text-center text-lg font-bold text-gray-800">
                              <span className="kid-emoji">🎯</span> {left}
                            </div>
                            <select
                              className={`w-full rounded-xl border-2 px-4 py-3 text-center text-lg font-semibold ${
                                matchSubmitted[currentIndex] && matchErrors[idx]
                                  ? 'border-red-500 bg-red-100'
                                  : matchSubmitted[currentIndex] && sel[idx] && !matchErrors[idx]
                                    ? 'border-green-500 bg-green-100'
                                    : 'border-blue-400 bg-white'
                              }`}
                              value={sel[idx] || ''}
                              onChange={(e) => handleSelect(idx, e.target.value)}
                            >
                              <option value="" disabled>
                                Choisir... 🤔
                              </option>
                              {rights.map((r, rIdx) => (
                                <option key={rIdx} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                            {matchSubmitted[currentIndex] && matchErrors[idx] && (
                              <p className="mt-2 text-center font-bold text-red-600">
                                <span className="kid-emoji">❌</span> Réessaie !
                              </p>
                            )}
                            {matchSubmitted[currentIndex] && sel[idx] && !matchErrors[idx] && (
                              <p className="mt-2 text-center font-bold text-green-600">
                                <span className="kid-emoji">✅</span> Excellent choix !
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 text-center">
                        <button
                          className="kid-btn-primary px-8 py-4 text-xl"
                          onClick={handleSubmit}
                          disabled={Object.keys(sel).length < lefts.length}
                        >
                          <span className="kid-emoji">🎪</span> Vérifier mes associations !
                        </button>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* Exit Button */}
            <div className="mt-6 text-center">
              <button
                className="kid-btn-secondary opacity-75 hover:opacity-100"
                onClick={() => {
                  resetState();
                  onClose();
                }}
              >
                <span className="kid-emoji">🚪</span> Quitter le quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
