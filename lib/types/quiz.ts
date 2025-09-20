// Shared quiz types for reusable components

export type Flashcard = {
  id: number;
  question: string;
  choices: string[];
  correctAnswer: string;
};

export type FillBlankQuestion = {
  id: number;
  type: 'fillBlank';
  title?: string;
  instructions?: string;
  sentence: string; // contains exactly one ____
  choices: string[];
  correctAnswer: string;
  feedback?: { correct?: string; incorrect?: string };
};

export type MatchingPair = { left: string; right: string };

export type MatchingGameQuestion = {
  id: number;
  type: 'matchingGame';
  title?: string;
  instructions?: string;
  pairs: MatchingPair[];
  feedback?: { correct?: string; incorrect?: string };
};

export type AnyQuestion =
  | ({ type: 'flashcard' } & Flashcard)
  | FillBlankQuestion
  | MatchingGameQuestion;

export type ScoreMessage = {
  emoji: string;
  message: string;
  className: string;
};
