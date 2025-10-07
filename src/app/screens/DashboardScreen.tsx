// src/screens/DashboardScreen.tsx

// This component is interactive (uses onClick), so it should be a Client Component.
"use client";

import React from 'react';
import { Calendar, FileText } from 'lucide-react';
// 1. Import the data shapes (types) you defined earlier.
import { Deadline, Case } from '@/app/types';

// Define a type for the screen names for our onNavigate function
type Screen = 'dashboard' | 'reports' | 'cases';

// 2. Create an interface that describes the shape of the props.
interface DashboardScreenProps {
  userName: string | undefined;
  deadlines: Deadline[];
  cases: Case[];
  onNavigate: (screen: Screen) => void;
  onSelectCase: (caseId: string) => void;
}

// 3. Apply the interface to your component's props.
const DashboardScreen = ({ userName, deadlines, cases, onNavigate, onSelectCase }: DashboardScreenProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-light text-slate-200 mb-2">
          {/* Handle the case where userName might be undefined */}
          Good Morning, {userName ? `Officer ${userName}` : 'Guest'}
        </h2>
        <p className="text-slate-400 text-sm">Tuesday, October 07, 2025</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-cyan-400 mr-2" />
            <h3 className="text-lg font-medium text-slate-200">Upcoming Deadlines</h3>
          </div>
          <div className="space-y-3">
            {/* TypeScript now knows that 'item' is of type 'Deadline' */}
            {deadlines.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-slate-900/50 rounded">
                <div>
                  <p className="text-slate-200 font-medium">{item.caseNumber}</p>
                  <p className="text-slate-400 text-sm">{item.task}</p>
                </div>
                <span className="text-cyan-400 text-sm font-medium">Due in {item.dueIn}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-900/30 to-slate-800/50 rounded-lg p-6 border border-cyan-700/30 flex flex-col justify-center items-center text-center">
          <FileText className="w-12 h-12 text-cyan-400 mb-4" />
          <h3 className="text-xl font-medium text-slate-200 mb-2">Start New Report</h3>
          <p className="text-slate-400 text-sm mb-6">Use AI assistance to generate reports quickly</p>
          <button
            onClick={() => onNavigate('reports')}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-lg transition-colors font-medium"
          >
            Create Report
          </button>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
        <h3 className="text-lg font-medium text-slate-200 mb-4">Active Cases</h3>
        <div className="space-y-2">
           {/* TypeScript now knows that 'case_' is of type 'Case' */}
          {cases.map((case_) => (
            <button
              key={case_.id}
              onClick={() => onSelectCase(case_.number)}
              className="w-full flex justify-between items-center p-4 bg-slate-900/50 hover:bg-slate-900/70 rounded transition-colors text-left"
            >
              <div>
                <p className="text-slate-200 font-medium">{case_.number}</p>
                <p className="text-slate-400 text-sm">{case_.title}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${case_.status === 'Active' ? 'bg-cyan-900/50 text-cyan-400' : 'bg-slate-700 text-slate-300'}`}>
                {case_.status}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;