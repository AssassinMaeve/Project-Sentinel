// src/components/Chatbot.tsx

// This component uses state (useState) and interactivity (onClick),
// so it must be a Client Component.
"use an client";

import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

// 1. Define an interface for the component's props.
interface ChatbotProps {
  userName: string | undefined;
}

// 2. Apply the ChatbotProps interface to the component's props.
const Chatbot = ({ userName }: ChatbotProps) => {
  // TypeScript correctly infers the type of 'isOpen' as 'boolean' from the initial value.
  const [isOpen, setIsOpen] = useState(false);

  // TypeScript correctly infers this as 'string[]'.
  const suggestedPrompts = [
    "What are my deadlines today?",
    "Find procedure for traffic stops",
    "Access wellness resources"
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-cyan-600 hover:bg-cyan-700 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-40"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-end justify-end z-50 p-6">
      <div className="bg-slate-800 rounded-lg w-full max-w-md h-[70vh] flex flex-col border border-slate-700 shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-medium text-slate-200">Sentinel Assistant</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-700 rounded transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex justify-start">
            <div className="bg-slate-700 rounded-lg rounded-tl-none p-3 max-w-[80%]">
              {/* 3. Handle the case where userName might be undefined */}
              <p className="text-slate-200">
                Hello {userName ? `Officer ${userName}` : ''}! How can I assist you today?
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-900/50">
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, idx) => (
              <button key={idx} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-full transition-colors">
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-700">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask Sentinel anything..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-600 transition-colors"
            />
            <button className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-lg transition-colors">
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;