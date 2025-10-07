"use client";

import React, { useState } from 'react';
import { Calendar, FileText } from 'lucide-react';
import { Deadline, Case } from '@/app/types';
import CreateCaseForm from '@/app/components/CreateCaseForm';

type Screen = 'dashboard' | 'reports' | 'cases';

interface DashboardScreenProps {
  userName: string | undefined;
  deadlines: Deadline[];
  cases: Case[];
  onNavigate: (screen: Screen) => void;
  onSelectCase: (caseId: string) => void;
  onRefresh: () => void; // Added for refreshing after case creation
}

const DashboardScreen = ({ 
  userName, 
  deadlines, 
  cases, 
  onNavigate, 
  onSelectCase,
  onRefresh 
}: DashboardScreenProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateSuccess = () => {
    onRefresh(); // Refresh dashboard data after creating a case
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-light text-slate-200 mb-2">
          Good Morning, {userName ? `Officer ${userName}` : 'Guest'}
        </h2>
        <p className="text-slate-400 text-sm">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines Card */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-cyan-400 mr-2" />
            <h3 className="text-lg font-medium text-slate-200">Upcoming Deadlines</h3>
          </div>
          <div className="space-y-3">
            {deadlines.length === 0 ? (
              <p className="text-slate-400 text-center py-6">No upcoming deadlines in the next 2 days</p>
            ) : (
              deadlines.map((item) => (
                <div 
                  key={item.id} 
                  className="flex justify-between items-center p-3 bg-slate-900/50 rounded hover:bg-slate-900/70 cursor-pointer transition-colors"
                  onClick={() => onSelectCase(item.id)}
                >
                  <div>
                    <p className="text-slate-200 font-medium">{item.caseNumber}</p>
                    <p className="text-slate-400 text-sm">{item.type}</p>
                  </div>
                  <span className="text-cyan-400 text-sm font-medium">{item.timeUntil}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Start New Report Card - Original Logic Preserved */}
        <div className="bg-gradient-to-br from-cyan-900/30 to-slate-800/50 rounded-lg p-6 border border-cyan-700/30 flex flex-col justify-center items-center text-center">
          <FileText className="w-12 h-12 text-cyan-400 mb-4" />
          <h3 className="text-xl font-medium text-slate-200 mb-2">Start New Report</h3>
          <p className="text-slate-400 text-sm mb-6">Use AI assistance to generate reports quickly</p>
          
          {/* Original Create Report Button */}
          <button
            onClick={() => onNavigate('reports')}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-lg transition-colors font-medium mb-4 w-full"
          >
            Create Report
          </button>

          {/* Original AI Therapy Assistant Button - Opens External URL */}
          <button
            onClick={() => window.open('http://127.0.0.1:5500/ChatBot/index.html', '_blank')}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg transition-colors font-medium w-full"
          >
            Open AI Therapy Assistant
          </button>
        </div>
      </div>

      {/* Active Cases Section */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-slate-200">Active Cases</h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            + Add New Case
          </button>
        </div>

        <div className="space-y-2">
          {cases.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-4">No active cases yet</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                Create Your First Case
              </button>
            </div>
          ) : (
            cases.map((case_) => (
              <button
                key={case_.id}
                onClick={() => onSelectCase(case_.id)}
                className="w-full flex justify-between items-center p-4 bg-slate-900/50 hover:bg-slate-900/70 rounded transition-colors text-left"
              >
                <div>
                  <p className="text-slate-200 font-medium">{case_.caseNumber}</p>
                  <p className="text-slate-400 text-sm">{case_.caseName}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    case_.status === 'Active'
                      ? 'bg-cyan-900/50 text-cyan-400'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {case_.status}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Create Case Form Modal */}
      {showCreateForm && (
        <CreateCaseForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};

export default DashboardScreen;
