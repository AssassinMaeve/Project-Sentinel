// src/components/Chatbot.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Activity, Brain, Calendar, FileText, AlertCircle } from 'lucide-react';

interface ChatbotProps {
  userName: string | undefined;
  mentalClarityScore?: number;
  resilienceReserve?: number;
  deadlines?: any[];
  cases?: any[];
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'wellness' | 'deadline' | 'recommendation';
}

// FIX: Better unique ID generator
let messageCounter = 0;
const generateUniqueId = () => {
  messageCounter++;
  return `${Date.now()}-${messageCounter}-${Math.random().toString(36).substr(2, 9)}`;
};

const Chatbot = ({ userName, mentalClarityScore = 72, resilienceReserve = 65, deadlines = [], cases = [] }: ChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(
        `Hello ${userName ? `Officer ${userName}` : ''}! I'm Sentinel, your wellness and productivity assistant. I can help you with:\n\n• Wellness check-ins and stress management\n• Deadline and case tracking\n• Mental health resources\n• Quick access to procedures\n\nHow can I assist you today?`,
        'text'
      );
    }
  }, [isOpen]);

  const addBotMessage = (text: string, type: 'text' | 'wellness' | 'deadline' | 'recommendation' = 'text') => {
    const newMessage: Message = {
      id: generateUniqueId(), // FIX: Use unique ID generator
      text,
      sender: 'bot',
      timestamp: new Date(),
      type
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: generateUniqueId(), // FIX: Use unique ID generator
      text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userInput = inputValue.trim();
    addUserMessage(userInput);
    setInputValue('');
    setIsTyping(true);

    // Small delay to make it feel more natural
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Process the message
    await processMessage(userInput);
    setIsTyping(false);
  };

  const processMessage = async (input: string) => {
    const lowerInput = input.toLowerCase();

    // Wellness Check
    if (lowerInput.includes('wellness') || lowerInput.includes('how am i') || lowerInput.includes('my status') || lowerInput.includes('status')) {
      const capacity = (mentalClarityScore + resilienceReserve) / 2;
      const status = capacity >= 70 ? '🟢 OPTIMAL' : capacity >= 50 ? '🟡 MODERATE' : '🔴 ATTENTION';
      
      addBotMessage(
        `Here's your current wellness status:\n\n🧠 Mental Clarity: ${mentalClarityScore}/100\n🔋 Resilience Reserve: ${resilienceReserve}%\n📊 Operational Capacity: ${status}\n\n${
          capacity < 70 
            ? 'Consider taking a break or using one of our wellness exercises.' 
            : 'You\'re doing great! Keep up your wellness routine.'
        }`,
        'wellness'
      );
      return;
    }

    // Stress Management
    if (lowerInput.includes('stress') || lowerInput.includes('anxious') || lowerInput.includes('overwhelmed')) {
      addBotMessage(
        `I can help with stress management. Here are some immediate options:\n\n🧘 **Breathing Exercise**: 4-7-8 technique (4 sec inhale, 7 sec hold, 8 sec exhale)\n\n💪 **Physical Activity**: 5-minute stretching routine\n\n🎧 **Guided Meditation**: 10-minute mindfulness session\n\n👥 **Peer Support**: Connect with wellness coordinator\n\nWould you like me to guide you through any of these?`,
        'recommendation'
      );
      return;
    }

    // Breathing Exercise
    if (lowerInput.includes('breathing') || lowerInput.includes('breathe')) {
      addBotMessage(
        `Let's do a quick breathing exercise together:\n\n**4-7-8 Breathing Technique**\n\n1️⃣ Breathe IN through your nose for 4 seconds\n2️⃣ HOLD your breath for 7 seconds\n3️⃣ Breathe OUT through your mouth for 8 seconds\n\nRepeat 4 times. This activates your parasympathetic nervous system and reduces stress.\n\nReady? Start when you are.`,
        'recommendation'
      );
      return;
    }

    // Deadlines
    if (lowerInput.includes('deadline') || lowerInput.includes('due') || lowerInput.includes('upcoming')) {
      if (deadlines.length === 0) {
        addBotMessage('You have no upcoming deadlines in the next 2 days. Great job staying on top of things!', 'deadline');
      } else {
        const deadlineList = deadlines.map(d => `📅 ${d.caseNumber} - ${d.type} (${d.timeUntil})`).join('\n');
        addBotMessage(
          `Here are your upcoming deadlines:\n\n${deadlineList}\n\nWould you like help prioritizing or managing any of these?`,
          'deadline'
        );
      }
      return;
    }

    // Cases
    if (lowerInput.includes('case') || lowerInput.includes('active')) {
      if (cases.length === 0) {
        addBotMessage('You have no active cases at the moment.', 'text');
      } else {
        const caseList = cases.slice(0, 5).map(c => `📋 ${c.caseNumber} - ${c.caseName} (${c.status})`).join('\n');
        addBotMessage(
          `You have ${cases.length} active case${cases.length > 1 ? 's' : ''}:\n\n${caseList}${cases.length > 5 ? `\n\n...and ${cases.length - 5} more` : ''}`,
          'text'
        );
      }
      return;
    }

    // Sleep Help
    if (lowerInput.includes('sleep') || lowerInput.includes('tired') || lowerInput.includes('fatigue')) {
      addBotMessage(
        `Sleep is crucial for law enforcement professionals. Here are evidence-based tips:\n\n🌙 **Before Shift**:\n• Aim for 7-9 hours\n• Keep bedroom dark and cool\n• Avoid screens 1 hour before bed\n\n☀️ **After Night Shift**:\n• Use blackout curtains\n• Wear blue-light blocking glasses\n• Maintain consistent sleep schedule\n\n💊 **Avoid**:\n• Caffeine 6 hours before sleep\n• Heavy meals 3 hours before bed\n\nYour last check-in showed sleep quality could improve. Want to set a sleep goal?`,
        'recommendation'
      );
      return;
    }

    // Mental Health Resources
    if (lowerInput.includes('help') || lowerInput.includes('crisis') || lowerInput.includes('emergency') || lowerInput.includes('resource')) {
      addBotMessage(
        `**Immediate Support Resources:**\n\n🚨 **Crisis Hotline**: 988 (Suicide & Crisis Lifeline)\n👮 **Cop2Cop Hotline**: 1-866-267-2267\n💬 **Crisis Text Line**: Text BLUE to 741741\n\n📞 **Non-Emergency Support**:\n• Employee Assistance Program (EAP)\n• Peer Support Coordinator\n• Department Wellness Officer\n\nYou are not alone. These resources are confidential and available 24/7.`,
        'recommendation'
      );
      return;
    }

    // Check-in Reminder
    if (lowerInput.includes('check-in') || lowerInput.includes('check in')) {
      const hour = new Date().getHours();
      const lastMorning = typeof window !== 'undefined' ? localStorage.getItem('lastMorningCheckIn') : null;
      const lastEvening = typeof window !== 'undefined' ? localStorage.getItem('lastEveningCheckIn') : null;
      const today = new Date().toDateString();

      if (hour >= 6 && hour < 12 && lastMorning !== today) {
        addBotMessage(
          `You haven't completed your morning check-in yet. It only takes 2-3 minutes and helps track your wellness.\n\nWould you like to complete it now? Just close this chat and click the "☀️ Complete Morning Check-In" button on your dashboard.`,
          'wellness'
        );
      } else if (hour >= 18 && hour < 23 && lastEvening !== today) {
        addBotMessage(
          `Time for your evening debrief! It takes 3-5 minutes and helps you decompress after your shift.\n\nClose this chat and click the "🌙 Complete Evening Debrief" button on your dashboard.`,
          'wellness'
        );
      } else {
        addBotMessage(
          `You're all caught up with check-ins today! Great job maintaining your wellness routine.`,
          'wellness'
        );
      }
      return;
    }

    // Productivity Tips
    if (lowerInput.includes('productive') || lowerInput.includes('focus') || lowerInput.includes('time management')) {
      addBotMessage(
        `**Productivity Tips for Law Enforcement:**\n\n⏰ **Time Blocking**:\n• Schedule report writing in focused 45-min blocks\n• Use Pomodoro technique (25 min work, 5 min break)\n\n📝 **Report Efficiency**:\n• Use AI report generation (click "Create Report" on dashboard)\n• Keep templates for common incidents\n\n🎯 **Prioritization**:\n• Tackle highest-priority deadlines first\n• Batch similar tasks together\n\n🔄 **Recovery**:\n• Take microbreaks between calls\n• 5-minute stretches every hour\n\nYour operational capacity is ${(mentalClarityScore + resilienceReserve) / 2 >= 70 ? 'optimal' : 'moderate'} - ${(mentalClarityScore + resilienceReserve) / 2 >= 70 ? 'great time for focused work!' : 'consider easier tasks first.'}`,
        'recommendation'
      );
      return;
    }

    // AI-Powered Response (using Hugging Face API)
    try {
      const response = await fetch('/api/stress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: {
            userName,
            mentalClarityScore,
            resilienceReserve,
            deadlineCount: deadlines.length,
            caseCount: cases.length
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        addBotMessage(data.response || 'I understand. How else can I help you?', 'text');
      } else {
        throw new Error('API failed');
      }
    } catch (error) {
      // Fallback response
      addBotMessage(
        `I'm here to help! I can assist with:\n\n• Wellness status and stress management\n• Deadline and case tracking\n• Mental health resources\n• Breathing exercises\n• Sleep tips\n• Productivity advice\n\nTry asking about any of these topics!`,
        'text'
      );
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
    setTimeout(() => handleSendMessage(), 100);
  };

  const suggestedPrompts = [
    "Show my wellness status",
    "What are my deadlines?",
    "I'm feeling stressed",
    "Help me sleep better",
    "Breathing exercise",
    "Mental health resources"
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-cyan-600 hover:bg-cyan-700 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-40"
        aria-label="Open Sentinel Assistant"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-end justify-end z-50 p-6">
      <div className="bg-slate-800 rounded-lg w-full max-w-md h-[70vh] flex flex-col border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center relative">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-200">Sentinel Assistant</h3>
              <p className="text-xs text-slate-400">AI Wellness & Productivity</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/30">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                {message.sender === 'user' && (
                  <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-cyan-600 rounded-tr-none'
                      : message.type === 'wellness'
                      ? 'bg-blue-700 rounded-tl-none'
                      : message.type === 'recommendation'
                      ? 'bg-purple-700 rounded-tl-none'
                      : message.type === 'deadline'
                      ? 'bg-orange-700 rounded-tl-none'
                      : 'bg-slate-700 rounded-tl-none'
                  }`}
                >
                  <p className="text-slate-100 text-sm whitespace-pre-line leading-relaxed">
                    {message.text}
                  </p>
                  <span className="text-xs text-slate-300 mt-1 block opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-700 rounded-lg rounded-tl-none p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length <= 1 && (
          <div className="p-4 border-t border-slate-700 bg-slate-900/50">
            <p className="text-xs text-slate-400 mb-2">Quick Actions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={`prompt-${idx}`}
                  onClick={() => handlePromptClick(prompt)}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-full transition-colors border border-slate-600"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask Sentinel anything..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-600 transition-colors"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:cursor-not-allowed px-6 py-3 rounded-lg transition-colors"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
