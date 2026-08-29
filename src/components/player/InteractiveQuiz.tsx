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
    <div className="flex w-full max-w-lg flex-col items-center justify-center p-2 my-auto">
      <div className="rounded-2xl border-2 border-[#1B3B36] bg-[#FFFDF7] p-4 text-center shadow-lg w-full">
        <span className="text-3xl block mb-1">{quiz.emoji}</span>
        <h3 className="font-baloo text-base font-bold text-[#1B3B36]">{quiz.name}</h3>
        <p className="mt-1 font-tajawal text-xs font-semibold text-[#1B3B36]/80">{quiz.question}</p>

        <div className="mt-3 flex flex-col sm:flex-row gap-2">
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
                className={`flex flex-1 items-center justify-between rounded-xl border-2 p-2.5 font-tajawal text-xs font-bold transition shadow-sm ${btnStyle}`}
              >
                <span>{choice.text}</span>
                {isSelected && (
                  choice.isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />
                )}
              </motion.button>
            );
          })}
        </div>

        {selectedChoiceId && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-center justify-center gap-1 font-baloo text-xs font-bold text-[#1B3B36]"
          >
            <Trophy className="h-4 w-4 text-[#E8A93B]" />
            <span>ممتاز! اضغط التالي للمتابعة في الدرس</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
