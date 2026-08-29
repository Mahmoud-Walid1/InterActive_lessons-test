'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { QuizQuestion } from '@/types/lesson';
import { CheckCircle2, XCircle, Trophy } from 'lucide-react';

interface InteractiveQuizProps {
  quiz: QuizQuestion;
  onAnswerSelected: (isCorrect: boolean) => void;
}

export function InteractiveQuiz({ quiz, onAnswerSelected }: InteractiveQuizProps) {
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  const handleChoice = (choiceId: string, isCorrect: boolean) => {
    if (selectedChoiceId) return;
    setSelectedChoiceId(choiceId);
    onAnswerSelected(isCorrect);
  };

  return (
    <div className="flex w-full max-w-xl flex-col items-center justify-center p-4">
      <div className="rounded-3xl border-3 border-[#1B3B36] bg-[#FFFDF7] p-6 text-center shadow-xl w-full">
        <span className="text-6xl block mb-2">{quiz.emoji}</span>
        <h3 className="font-baloo text-xl font-bold text-[#1B3B36]">{quiz.name}</h3>
        <p className="mt-2 font-tajawal text-sm font-semibold text-[#1B3B36]/80">{quiz.question}</p>

        <div className="mt-6 flex flex-col gap-3">
          {quiz.choices.map((choice) => {
            const isSelected = selectedChoiceId === choice.id;
            let btnStyle = 'border-[#3E92B0] bg-[#3E92B0] text-[#FFFDF7] hover:bg-[#3E92B0]/90';

            if (isSelected) {
              btnStyle = choice.isCorrect
                ? 'border-[#4F7942] bg-[#4F7942] text-[#FFFDF7]'
                : 'border-[#C1502E] bg-[#C1502E] text-[#FFFDF7]';
            }

            return (
              <motion.button
                key={choice.id}
                whileHover={{ scale: selectedChoiceId ? 1 : 1.02 }}
                whileTap={{ scale: selectedChoiceId ? 1 : 0.98 }}
                onClick={() => handleChoice(choice.id, choice.isCorrect)}
                className={`flex w-full items-center justify-between rounded-xl border-2 p-3.5 font-tajawal font-bold transition shadow-md ${btnStyle}`}
              >
                <span>{choice.text}</span>
                {isSelected && (
                  choice.isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />
                )}
              </motion.button>
            );
          })}
        </div>

        {selectedChoiceId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center justify-center gap-2 font-baloo font-bold text-[#1B3B36]"
          >
            <Trophy className="h-5 w-5 text-[#E8A93B]" />
            <span>ممتاز! اضغط التالي للمتابعة في الدرس</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
