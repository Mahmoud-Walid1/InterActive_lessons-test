export type SlideType = 'explain' | 'interactive_reveal' | 'quiz' | 'summary';

export interface QuizChoice {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  emoji: string;
  name: string;
  question: string;
  choices: QuizChoice[];
}

export interface InteractiveGroupChip {
  id: string;
  emoji: string;
  name: string;
  detail: string;
}

export interface RevealQuestion {
  question: string;
  answer: string;
}

export interface LessonSlide {
  id: string;
  type: SlideType;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  mascotTip?: string;
  groups?: InteractiveGroupChip[];
  reveal?: RevealQuestion;
  traits?: string[];
  examples?: { emoji: string; name: string }[];
  quiz?: QuizQuestion;
  sceneAnimation?: 'bounce' | 'flap' | 'swim' | 'slither' | 'pulse' | 'float';
}

export interface LessonData {
  id: string;
  title: string;
  gradeId: string;
  subjectId: string;
  description: string;
  slides: LessonSlide[];
}
