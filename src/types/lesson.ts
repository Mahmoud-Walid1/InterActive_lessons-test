export type SlideType =
  | 'explain'
  | 'interactive_reveal'
  | 'quiz'
  | 'true_false'
  | 'match_pairs'
  | 'order_sequence'
  | 'fill_blank'
  | 'classify_sorting'
  | 'hotspot_explore'
  | 'memory_cards'
  | 'tap_to_count'
  | 'summary';

export interface QuizChoice {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  emoji?: string;
  name?: string;
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

/* 1. True or False */
export interface TrueFalseQuestion {
  id: string;
  statement: string;
  isTrue: boolean;
  explanation?: string;
}

/* 2. Match Pairs */
export interface MatchPair {
  id: string;
  leftText: string;
  leftEmoji?: string;
  rightText: string;
  rightEmoji?: string;
}

export interface MatchPairsData {
  instructions?: string;
  pairs: MatchPair[];
}

/* 3. Order Sequence */
export interface OrderStep {
  id: string;
  order: number;
  text: string;
  emoji?: string;
}

export interface OrderSequenceData {
  instructions?: string;
  steps: OrderStep[];
}

/* 4. Fill in the Blank */
export interface FillBlankData {
  id: string;
  sentenceBefore: string;
  blankAnswer: string;
  sentenceAfter: string;
  wordBank: string[];
}

/* 5. Classify & Sorting */
export interface ClassifyItem {
  id: string;
  name: string;
  emoji?: string;
  targetBucketId: string;
}

export interface ClassifyBucket {
  id: string;
  name: string;
  emoji?: string;
  color?: string;
}

export interface ClassifySortingData {
  buckets: ClassifyBucket[];
  items: ClassifyItem[];
}

/* 6. Hotspot Explore */
export interface HotspotPoint {
  id: string;
  xPercent: number;
  yPercent: number;
  title: string;
  detail: string;
  emoji?: string;
}

export interface HotspotData {
  imageUrl?: string;
  fallbackGraphic?: string;
  points: HotspotPoint[];
}

/* 7. Memory Cards (Flip & Match) */
export interface MemoryCardPair {
  id: string;
  matchId: string;
  text: string;
  emoji?: string;
}

export interface MemoryCardsData {
  pairs: {
    id: string;
    itemA: { text: string; emoji?: string };
    itemB: { text: string; emoji?: string };
  }[];
}

/* 8. Tap to Count */
export interface TapToCountData {
  targetCount: number;
  itemName: string;
  itemEmoji: string;
  instructions?: string;
}

/* Main Lesson Slide */
export interface LessonSlide {
  id: string;
  type: SlideType;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  mascotTip?: string;
  sceneAnimation?: 'bounce' | 'flap' | 'swim' | 'slither' | 'pulse' | 'float';

  // Specific slide payloads
  traits?: string[];
  examples?: { emoji: string; name: string }[];
  groups?: InteractiveGroupChip[];
  reveal?: RevealQuestion;
  quiz?: QuizQuestion;
  trueFalse?: TrueFalseQuestion;
  matchPairs?: MatchPairsData;
  orderSequence?: OrderSequenceData;
  fillBlank?: FillBlankData;
  classifySorting?: ClassifySortingData;
  hotspot?: HotspotData;
  memoryCards?: MemoryCardsData;
  tapToCount?: TapToCountData;
}

export interface LessonData {
  id: string;
  title: string;
  gradeId: string;
  subjectId: string;
  description: string;
  slides: LessonSlide[];
}
