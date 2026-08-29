'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { QuizQuestion } from '@/types/lesson';
import { CheckCircle2, XCircle, Trophy, HelpCircle } from 'lucide-react';

interface InteractiveQuizProps {
  quiz: QuizQuestion;
  onAnswerSelected: (isCorrect: boolean) => void;
}

export function InteractiveQuiz({ quiz, onAnswerSelected }: InteractiveQuizProps) {
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  const selectedChoice = quiz.choices.find(c => c.id === selectedChoiceId);
  const correctChoice = quiz.choices.find(c => c.isCorrect);

  const handleChoice = (choiceId: string, isCorrect: boolean) => {
    if (selectedChoiceId) return;
    setSelectedChoiceId(choiceId);
    onAnswerSelected(isCorrect);
  };

  return (
    <div className="flex w-full max-w-lg flex-col items-center justify-center p-2 my-auto">
      <div className="rounded-2xl border-2 border-[#0F3D4C] bg-[#FFFFFF] p-4 text-center shadow-md w-full">
        <span className="text-3xl block mb-1">{quiz.emoji}</span>
        <h3 className="font-baloo text-base font-bold text-[#0F2C3B]">{quiz.name}</h3>
        <p className="mt-1 font-tajawal text-xs font-semibold text-[#0F2C3B]/80">{quiz.question}</p>

        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          {quiz.choices.map((choice) => {
            const isSelected = selectedChoiceId === choice.id;
            const isCorrectChoice = choice.isCorrect;

            let btnStyle = 'border-[#0284C7] bg-[#0284C7] text-[#FFFFFF] hover:bg-[#0F3D4C]';

            if (selectedChoiceId) {
              if (isSelected) {
                btnStyle = isCorrectChoice
                  ? 'border-[#0D9488] bg-[#0D9488] text-[#FFFFFF]'
                  : 'border-[#D97706] bg-[#D97706] text-[#FFFFFF]';
              } else if (isCorrectChoice) {
                // Highlight the correct choice if user chose wrong
                btnStyle = 'border-[#0D9488] bg-[#0D9488]/80 text-[#FFFFFF] ring-2 ring-[#0D9488]';
              } else {
                btnStyle = 'border-[#E2E8F0] bg-[#E2E8F0] text-[#0F2C3B]/50 opacity-60';
              }
            }

            return (
              <motion.button
                key={choice.id}
                whileHover={{ scale: selectedChoiceId ? 1 : 1.02 }}
                whileTap={{ scale: selectedChoiceId ? 1 : 0.98 }}
                onClick={() => handleChoice(choice.id, choice.isCorrect)}
                className={`flex flex-1 items-center justify-between rounded-xl border-2 p-2.5 font-tajawal text-xs font-bold transition shadow-xs ${btnStyle}`}
              >
                <span>{choice.text}</span>
                {isSelected && (
                  isCorrectChoice ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Dynamic Quiz Feedback based on actual choice correctness */}
        {selectedChoice && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center justify-center gap-1.5 font-baloo text-xs font-bold"
          >
            {selectedChoice.isCorrect ? (
              <div className="flex items-center gap-1.5 text-[#0D9488]">
                <Trophy className="h-4 w-4 text-[#F59E0B]" />
                <span>إجابة صحيحة وممتازة! 🎉 اضغط التالي للمتابعة في الدرس</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[#D97706]">
                <HelpCircle className="h-4 w-4 text-[#D97706]" />
                <span>إجابة خاطئة! الإجابة الصحيحة هي: <strong>{correctChoice?.text}</strong></span>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
