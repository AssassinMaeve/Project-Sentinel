"use client";

import React, { useState } from 'react';

interface StressCheckInProps {
  onComplete: (score: number) => void;
  onClose: () => void;
}

const questions = [
  "How stressed do you feel right now?",
  "How well did you sleep last night?",
  "How would you rate your energy level?",
  "How overwhelmed do you feel by work?",
  "How irritable or on-edge do you feel?",
];

export default function StressCheckIn({ onComplete, onClose }: StressCheckInProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitStressCheck(newAnswers);
    }
  };

  const submitStressCheck = async (finalAnswers: number[]) => {
    setLoading(true);
    try {
      const response = await fetch('/api/stress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers }),
      });

      const data = await response.json();
      if (response.ok) {
        onComplete(data.stressScore);
        onClose();
      }
    } catch (error) {
      console.error('Error submitting stress check:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Analyzing your stress level...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-600">Quick Stress Check</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          {questions[currentQuestion]}
        </h3>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <button
              key={value}
              onClick={() => handleAnswer(value)}
              className="w-full py-3 px-4 bg-gray-100 hover:bg-indigo-600 hover:text-white text-gray-800 font-medium rounded-lg transition-all duration-200 text-left flex justify-between items-center group"
            >
              <span>{value}</span>
              <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                {value <= 3 ? 'Not at all' : value <= 6 ? 'Somewhat' : value <= 8 ? 'Very much' : 'Extremely'}
              </span>
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Scale: 1 (Not at all) - 10 (Extremely)
        </p>
      </div>
    </div>
  );
}
