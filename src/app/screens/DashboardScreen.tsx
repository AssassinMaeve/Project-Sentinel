"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Activity, Brain, Battery, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Deadline, Case } from '@/app/types';
import CreateCaseForm from '@/app/components/CreateCaseForm';
import StressCheckIn from '@/app/components/StressCheckIn';
import DailyQuestion from "@/app/components/DailyQuestion";

type Screen = 'dashboard' | 'reports' | 'cases' | 'profile';

interface DashboardScreenProps {
  userName: string | undefined;
  deadlines: Deadline[];
  cases: Case[];
  onNavigate: (screen: Screen) => void;
  onSelectCase: (caseId: string) => void;
  onRefresh: () => void;
  onWellnessUpdate?: (clarity: number, resilience: number) => void;
}

interface CheckInData {
  sleepQuality: number;
  physicalEnergy: 'low' | 'moderate' | 'high' | null;
  mentalReadiness: 'not-ready' | 'somewhat' | 'fully' | null;
  emotionalState: string[];
  incidentExposure: 'none' | 'minor' | 'moderate' | 'severe' | null;
  stressResponse: number;
  supportNeeds: string[];
}

const DashboardScreen = ({
  userName,
  deadlines,
  cases,
  onNavigate,
  onSelectCase,
  onRefresh,
  onWellnessUpdate,
}: DashboardScreenProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showStressCheckIn, setShowStressCheckIn] = useState(false);
  const [stressData, setStressData] = useState<any>(null);
  const [showQuestion, setShowQuestion] = useState(false);

  // Enhanced wellness tracking states
  const [showMorningCheckIn, setShowMorningCheckIn] = useState(false);
  const [showEveningCheckIn, setShowEveningCheckIn] = useState(false);
  const [mentalClarityScore, setMentalClarityScore] = useState(72);
  const [resilienceReserve, setResilienceReserve] = useState(65);
  const [operationalCapacity, setOperationalCapacity] = useState<'green' | 'yellow' | 'red'>('green');
  const [weeklyTrend, setWeeklyTrend] = useState([65, 70, 68, 72, 75, 73, 72]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [checkInData, setCheckInData] = useState<CheckInData>({
    sleepQuality: 3,
    physicalEnergy: null,
    mentalReadiness: null,
    emotionalState: [],
    incidentExposure: null,
    stressResponse: 3,
    supportNeeds: []
  });

  const emotionOptions = ['Calm', 'Anxious', 'Frustrated', 'Motivated', 'Overwhelmed', 'Confident'];
  const supportOptions = ['Exercise', 'Meditation', 'Talking', 'Rest', 'Professional Support'];

  useEffect(() => {
    fetchStressData();
    checkDailyCheckInStatus();
    loadWellnessMetrics();
  }, []);

  // Show daily question only once per day
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem("question-date") !== today) {
      setShowQuestion(true);
    }
  }, []);

  const fetchStressData = async () => {
    try {
      const response = await fetch('/api/stress');
      const data = await response.json();
      if (response.ok && data.stressScore !== null) {
        setStressData(data);
      }
    } catch (error) {
      console.error('Error fetching stress data:', error);
    }
  };

  const handleCreateSuccess = () => onRefresh();
  const handleStressCheckComplete = () => fetchStressData();

  // Daily question answer handler
  function handleDailyAnswer(ans: string) {
    localStorage.setItem("question-date", new Date().toISOString().slice(0, 10));
    setShowQuestion(false);
  }

  // Check if daily check-ins are needed
  const checkDailyCheckInStatus = () => {
    if (typeof window !== 'undefined') {
      const today = new Date().toDateString();
      const lastMorningCheckIn = localStorage.getItem('lastMorningCheckIn');
      const lastEveningCheckIn = localStorage.getItem('lastEveningCheckIn');
      
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12 && lastMorningCheckIn !== today) {
        setShowMorningCheckIn(true);
      }
      if (hour >= 18 && hour < 23 && lastEveningCheckIn !== today) {
        setShowEveningCheckIn(true);
      }
    }
  };

  // Load saved wellness metrics
  const loadWellnessMetrics = () => {
    if (typeof window !== 'undefined') {
      const savedClarity = localStorage.getItem('mentalClarityScore');
      const savedResilience = localStorage.getItem('resilienceReserve');
      const savedCapacity = localStorage.getItem('operationalCapacity');
      const savedTrend = localStorage.getItem('weeklyTrend');
      const savedRecs = localStorage.getItem('recommendations');

      if (savedClarity) setMentalClarityScore(parseInt(savedClarity));
      if (savedResilience) setResilienceReserve(parseInt(savedResilience));
      if (savedCapacity) setOperationalCapacity(savedCapacity as any);
      if (savedTrend) setWeeklyTrend(JSON.parse(savedTrend));
      if (savedRecs) setRecommendations(JSON.parse(savedRecs));
    }
  };

  // Save check-in data and analyze
  const saveCheckIn = async (type: 'morning' | 'evening') => {
    try {
      const today = new Date().toDateString();
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(`last${type === 'morning' ? 'Morning' : 'Evening'}CheckIn`, today);
        localStorage.setItem(`${type}CheckInData`, JSON.stringify(checkInData));
      }
      
      // Close modal immediately
      if (type === 'morning') setShowMorningCheckIn(false);
      else setShowEveningCheckIn(false);
      
      // Recalculate wellness metrics
      updateWellnessMetrics();
      
      // Send to API for analysis (non-blocking)
      analyzeCheckInWithAI(checkInData).catch(err => {
        console.log('AI analysis failed, using fallback');
      });
      
      // Reset form data for next check-in
      setCheckInData({
        sleepQuality: 3,
        physicalEnergy: null,
        mentalReadiness: null,
        emotionalState: [],
        incidentExposure: null,
        stressResponse: 3,
        supportNeeds: []
      });
      
    } catch (error) {
      console.error('Error saving check-in:', error);
      // Close modal even if error
      if (type === 'morning') setShowMorningCheckIn(false);
      else setShowEveningCheckIn(false);
    }
  };

  // AI analysis of check-in data
  const analyzeCheckInWithAI = async (data: CheckInData) => {
    try {
      const response = await fetch('/api/stress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkInData: data, deadlines: deadlines.length })
      });
      
      if (!response.ok) {
        console.log('API returned error, using fallback');
        throw new Error('API request failed');
      }
      
      const result = await response.json();
      if (result.recommendations) {
        setRecommendations(result.recommendations);
        localStorage.setItem('recommendations', JSON.stringify(result.recommendations));
      }
    } catch (error) {
      console.error('Error analyzing check-in:', error);
      // Fallback recommendations
      const fallbackRecs = [
        'Consider a 5-minute breathing exercise',
        'Schedule time for physical activity',
        'Connect with a peer for support'
      ];
      setRecommendations(fallbackRecs);
      localStorage.setItem('recommendations', JSON.stringify(fallbackRecs));
    }
  };

  // Update wellness metrics based on check-in data
  const updateWellnessMetrics = () => {
    const sleepScore = checkInData.sleepQuality * 20;
    const energyScore = checkInData.physicalEnergy === 'high' ? 100 : 
                        checkInData.physicalEnergy === 'moderate' ? 60 : 30;
    const newClarityScore = Math.round((sleepScore + energyScore) / 2);
    setMentalClarityScore(newClarityScore);

    const stressImpact = (5 - checkInData.stressResponse) * 20;
    const supportBonus = checkInData.supportNeeds.length * 10;
    const newResilience = Math.min(100, stressImpact + supportBonus);
    setResilienceReserve(newResilience);

    const avgScore = (newClarityScore + newResilience) / 2;
    const newCapacity = avgScore >= 70 ? 'green' : avgScore >= 50 ? 'yellow' : 'red';
    setOperationalCapacity(newCapacity);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('mentalClarityScore', newClarityScore.toString());
      localStorage.setItem('resilienceReserve', newResilience.toString());
      localStorage.setItem('operationalCapacity', newCapacity);
      
      // Update weekly trend
      const newTrend = [...weeklyTrend.slice(1), Math.round(avgScore)];
      setWeeklyTrend(newTrend);
      localStorage.setItem('weeklyTrend', JSON.stringify(newTrend));
    }

    // Pass wellness data to parent component
    if (onWellnessUpdate) {
      onWellnessUpdate(newClarityScore, newResilience);
    }
  };

  return (
    <div className="flex-1 min-h-screen overflow-y-auto p-0 bg-gradient-to-br from-[#2563eb] via-[#3b82f6] to-[#60a5fa]">
      {showQuestion && <DailyQuestion onAnswer={handleDailyAnswer} />}

      <div className="max-w-6xl mx-auto py-14 px-4 space-y-10">
        <div className="mb-2">
          <h2 className="text-3xl font-extrabold text-white mb-1 drop-shadow-lg">
            Good Morning, {userName ? `Officer ${userName}` : 'Guest'}
          </h2>
          <p className="text-white/80 text-sm">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
            })}
          </p>
        </div>

        {/* Mission Readiness Dashboard */}
        <div className="rounded-xl px-7 py-7 bg-white/90 shadow-xl border-2 border-blue-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Activity className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-2xl font-bold text-blue-900">Mission Readiness</h3>
            </div>
            <div className={`px-4 py-2 rounded-full font-bold text-white shadow-lg ${
              operationalCapacity === 'green' ? 'bg-green-500' :
              operationalCapacity === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
            }`}>
              {operationalCapacity === 'green' ? '✓ OPTIMAL' :
               operationalCapacity === 'yellow' ? '⚠ MODERATE' : '⚡ ATTENTION'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Mental Clarity Score */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
              <div className="flex items-center mb-3">
                <Brain className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-semibold text-blue-700">Mental Clarity</span>
              </div>
              <div className="text-4xl font-bold text-blue-900 mb-3">{mentalClarityScore}</div>
              <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${mentalClarityScore}%` }}
                />
              </div>
            </div>

            {/* Resilience Reserve */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
              <div className="flex items-center mb-3">
                <Battery className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-semibold text-green-700">Resilience Reserve</span>
              </div>
              <div className="text-4xl font-bold text-green-900 mb-3">{resilienceReserve}%</div>
              <div className="w-full bg-green-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-green-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${resilienceReserve}%` }}
                />
              </div>
            </div>
          </div>

          {/* 7-Day Wellness Trend */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-sm font-semibold text-purple-700">7-Day Wellness Trend</span>
            </div>
            <div className="flex items-end justify-between h-24 gap-2">
              {weeklyTrend.map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-purple-300 rounded-t-lg transition-all duration-500" 
                       style={{ height: `${value}%` }} />
                  <span className="text-xs text-purple-600 mt-2 font-medium">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Check-In Prompts */}
        {showMorningCheckIn && (
          <button
            onClick={() => setShowMorningCheckIn(true)}
            className="w-full rounded-xl px-7 py-6 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 shadow-xl border-2 border-yellow-300 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="flex items-center mb-2">
                  <span className="text-3xl mr-3">☀️</span>
                  <h3 className="text-xl font-bold text-white">Complete Morning Check-In</h3>
                </div>
                <p className="text-white/90 text-sm">2-3 minutes • Assess your readiness for the day</p>
              </div>
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </button>
        )}

        {showEveningCheckIn && (
          <button
            onClick={() => setShowEveningCheckIn(true)}
            className="w-full rounded-xl px-7 py-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-xl border-2 border-indigo-400 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="flex items-center mb-2">
                  <span className="text-3xl mr-3">🌙</span>
                  <h3 className="text-xl font-bold text-white">Complete Evening Debrief</h3>
                </div>
                <p className="text-white/90 text-sm">3-5 minutes • Reflect on your day and plan recovery</p>
              </div>
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </button>
        )}

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <div className="rounded-xl px-7 py-7 bg-gradient-to-br from-purple-100 to-pink-100 shadow-xl border-2 border-purple-300">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-purple-600 mr-2" />
              <h3 className="text-xl font-bold text-purple-900">Personalized Recommendations</h3>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start p-4 bg-white/70 rounded-lg border border-purple-200 hover:bg-white/90 transition">
                  <span className="text-2xl mr-3">💡</span>
                  <p className="text-purple-900 font-medium flex-1">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Deadlines Card */}
          <div className="rounded-xl px-7 py-7 bg-white/80 shadow-lg border border-blue-200">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 text-blue-500 mr-2" />
              <h3 className="text-lg font-bold text-blue-900">Upcoming Deadlines</h3>
            </div>
            <div className="space-y-3">
              {deadlines.length === 0 ? (
                <p className="text-blue-500 text-center py-6">No upcoming deadlines in the next 2 days</p>
              ) : (
                deadlines.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-blue-200/30 to-blue-300/30 hover:from-blue-200/80 cursor-pointer border border-blue-100"
                    onClick={() => onSelectCase(item.id)}
                  >
                    <div>
                      <p className="text-blue-900 font-semibold">{item.caseNumber}</p>
                      <p className="text-blue-500 text-xs">{item.type}</p>
                    </div>
                    <span className="text-blue-500 font-bold text-xs">{item.timeUntil}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Start New Report Card */}
          <div className="rounded-xl px-7 py-7 bg-white/80 shadow-lg border border-blue-200 flex flex-col justify-center items-center text-center">
            <FileText className="w-12 h-12 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold text-blue-900 mb-1">Start New Report</h3>
            <p className="text-blue-500 text-sm mb-6">Use AI assistance to generate reports quickly</p>
            <button
              onClick={() => onNavigate('reports')}
              className="w-full py-3 mb-4 rounded-full font-bold bg-gradient-to-r from-[#2563eb] to-[#60a5fa] hover:from-[#1d4ed8] hover:to-[#3b82f6] text-white shadow"
            >
              Create Report
            </button>
            <button
              onClick={() => window.open('http://127.0.0.1:5500/ChatBot/index.html', '_blank')}
              className="w-full py-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white font-bold shadow"
            >
              Open AI Therapy Assistant
            </button>
          </div>
        </div>

        {/* Active Cases Section */}
        <div className="rounded-xl px-7 py-7 bg-white/80 shadow-lg border border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-blue-900">Active Cases</h3>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-5 py-2 rounded-full font-semibold bg-gradient-to-r from-[#2563eb] to-[#60a5fa] hover:from-[#1d4ed8] hover:to-[#3b82f6] text-white shadow active:scale-95"
            >
              + Add New Case
            </button>
          </div>
          <div className="space-y-2">
            {cases.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-blue-500 mb-4">No active cases yet</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#60a5fa] hover:from-[#1d4ed8] hover:to-[#3b82f6] text-white font-semibold shadow"
                >
                  Create Your First Case
                </button>
              </div>
            ) : (
              cases.map((case_) => (
                <button
                  key={case_.id}
                  onClick={() => onSelectCase(case_.id)}
                  className="w-full flex justify-between items-center p-4 bg-gradient-to-r from-blue-100/60 to-blue-200/60 hover:from-blue-200/90 hover:to-blue-100/70 rounded-lg border border-blue-100 transition text-left"
                >
                  <div>
                    <p className="text-blue-900 font-semibold">{case_.caseNumber}</p>
                    <p className="text-blue-500 text-xs">{case_.caseName}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      case_.status === 'Active'
                        ? 'bg-blue-400/40 text-blue-900'
                        : 'bg-blue-200 text-blue-500'
                    }`}
                  >
                    {case_.status}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Original Modal Overlays */}
      {showCreateForm && (
        <CreateCaseForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
      {showStressCheckIn && (
        <StressCheckIn
          onComplete={handleStressCheckComplete}
          onClose={() => setShowStressCheckIn(false)}
        />
      )}

      {/* Morning Check-In Modal */}
      {showMorningCheckIn && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">☀️ Morning Check-In</h2>
            
            <div className="space-y-6">
              {/* Sleep Quality */}
              <div>
                <label className="block text-lg font-semibold text-blue-800 mb-3">
                  How well did you sleep last night?
                </label>
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      onClick={() => setCheckInData({...checkInData, sleepQuality: num})}
                      className={`flex-1 py-4 rounded-xl border-2 transition-all ${
                        checkInData.sleepQuality === num
                          ? 'border-blue-600 bg-blue-100 scale-105'
                          : 'border-blue-200 bg-blue-50 hover:border-blue-400'
                      }`}
                    >
                      <div className="text-3xl mb-1">
                        {num === 1 ? '😴' : num === 2 ? '😐' : num === 3 ? '🙂' : num === 4 ? '😊' : '⚡'}
                      </div>
                      <div className="text-xs text-blue-600 font-medium">{num}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Physical Energy */}
              <div>
                <label className="block text-lg font-semibold text-blue-800 mb-3">
                  How energized do you feel?
                </label>
                <div className="flex gap-3">
                  {['low', 'moderate', 'high'].map(level => (
                    <button
                      key={level}
                      onClick={() => setCheckInData({...checkInData, physicalEnergy: level as any})}
                      className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all ${
                        checkInData.physicalEnergy === level
                          ? 'border-blue-600 bg-blue-100'
                          : 'border-blue-200 bg-blue-50 hover:border-blue-400'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mental Readiness */}
              <div>
                <label className="block text-lg font-semibold text-blue-800 mb-3">
                  How prepared do you feel for today's shift?
                </label>
                <div className="flex gap-3">
                  {[
                    { key: 'not-ready', label: 'Not Ready' },
                    { key: 'somewhat', label: 'Somewhat' },
                    { key: 'fully', label: 'Fully Ready' }
                  ].map(option => (
                    <button
                      key={option.key}
                      onClick={() => setCheckInData({...checkInData, mentalReadiness: option.key as any})}
                      className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all ${
                        checkInData.mentalReadiness === option.key
                          ? 'border-blue-600 bg-blue-100'
                          : 'border-blue-200 bg-blue-50 hover:border-blue-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emotional State */}
              <div>
                <label className="block text-lg font-semibold text-blue-800 mb-3">
                  Select your current emotions (multiple):
                </label>
                <div className="flex flex-wrap gap-2">
                  {emotionOptions.map(emotion => (
                    <button
                      key={emotion}
                      onClick={() => {
                        const emotions = checkInData.emotionalState.includes(emotion)
                          ? checkInData.emotionalState.filter(e => e !== emotion)
                          : [...checkInData.emotionalState, emotion];
                        setCheckInData({...checkInData, emotionalState: emotions});
                      }}
                      className={`px-4 py-2 rounded-full border-2 font-medium transition-all ${
                        checkInData.emotionalState.includes(emotion)
                          ? 'border-blue-600 bg-blue-100'
                          : 'border-blue-200 bg-blue-50 hover:border-blue-400'
                      }`}
                    >
                      {emotion}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowMorningCheckIn(false)}
                className="flex-1 py-3 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold transition"
              >
                Skip
              </button>
              <button
                onClick={() => saveCheckIn('morning')}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold shadow-lg transition"
              >
                Complete Check-In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evening Check-In Modal */}
      {showEveningCheckIn && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-3xl font-bold text-indigo-900 mb-6 text-center">🌙 Evening Debrief</h2>
            
            <div className="space-y-6">
              {/* Incident Exposure */}
              <div>
                <label className="block text-lg font-semibold text-indigo-800 mb-3">
                  Did you encounter high-stress situations today?
                </label>
                <div className="flex gap-3">
                  {[
                    { key: 'none', label: 'None' },
                    { key: 'minor', label: 'Minor' },
                    { key: 'moderate', label: 'Moderate' },
                    { key: 'severe', label: 'Severe' }
                  ].map(option => (
                    <button
                      key={option.key}
                      onClick={() => setCheckInData({...checkInData, incidentExposure: option.key as any})}
                      className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all ${
                        checkInData.incidentExposure === option.key
                          ? 'border-indigo-600 bg-indigo-100'
                          : 'border-indigo-200 bg-indigo-50 hover:border-indigo-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stress Response */}
              <div>
                <label className="block text-lg font-semibold text-indigo-800 mb-3">
                  How did today's work affect you?
                </label>
                <div className="flex justify-between gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      onClick={() => setCheckInData({...checkInData, stressResponse: num})}
                      className={`flex-1 py-4 rounded-xl border-2 transition-all ${
                        checkInData.stressResponse === num
                          ? 'border-indigo-600 bg-indigo-100 scale-105'
                          : 'border-indigo-200 bg-indigo-50 hover:border-indigo-400'
                      }`}
                    >
                      <div className="text-2xl font-bold text-indigo-700">{num}</div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-indigo-600 font-medium px-2">
                  <span>Calm</span>
                  <span>High Stress</span>
                </div>
              </div>

              {/* Support Needs */}
              <div>
                <label className="block text-lg font-semibold text-indigo-800 mb-3">
                  What would help you decompress? (multiple):
                </label>
                <div className="flex flex-wrap gap-2">
                  {supportOptions.map(support => (
                    <button
                      key={support}
                      onClick={() => {
                        const needs = checkInData.supportNeeds.includes(support)
                          ? checkInData.supportNeeds.filter(s => s !== support)
                          : [...checkInData.supportNeeds, support];
                        setCheckInData({...checkInData, supportNeeds: needs});
                      }}
                      className={`px-4 py-2 rounded-full border-2 font-medium transition-all ${
                        checkInData.supportNeeds.includes(support)
                          ? 'border-indigo-600 bg-indigo-100'
                          : 'border-indigo-200 bg-indigo-50 hover:border-indigo-400'
                      }`}
                    >
                      {support}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowEveningCheckIn(false)}
                className="flex-1 py-3 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold transition"
              >
                Skip
              </button>
              <button
                onClick={() => saveCheckIn('evening')}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg transition"
              >
                Complete Debrief
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardScreen;
