// src/screens/CaseScreen.tsx

// This component uses hooks (useState, useEffect) for data fetching and state management,
// so it must be a Client Component.
"use client";

import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { fetchCaseDetails } from '@/app/api/sentinelApi' // Using path alias for consistency
import { CaseDetails } from '@/app/types'; // Import the main type definition

// 1. Define the props interface for this component.
interface CaseScreenProps {
  caseId: string | null;
}

// Define a specific type for the possible tab values for type safety.
type Tab = 'overview' | 'files' | 'notes' | 'calendar';

// 2. Apply the props interface.
const CaseScreen = ({ caseId }: CaseScreenProps) => {
  // 3. Provide explicit types for the state hooks.
  const [caseData, setCaseData] = useState<CaseDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    const loadCaseData = async () => {
      if (!caseId) {
        setLoading(false);
        setError("No case selected.");
        return;
      }
      
      setLoading(true);
      setError(null); // Reset error state on new fetch
      try {
        const data = await fetchCaseDetails(caseId);
        setCaseData(data);
      } catch (err) {
        // Ensure the error is a string
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };
    loadCaseData();
  }, [caseId]); // This effect re-runs whenever the caseId prop changes.

  // Conditional rendering based on the state of the component.
  if (loading) return <div className="p-8 text-center w-full">Loading case details...</div>;
  if (error) return <div className="p-8 text-center w-full text-red-400">Error: {error}</div>;
  if (!caseData) return <div className="p-8 text-center w-full">Please select a case from the dashboard.</div>;

  // TypeScript knows 'caseData' is not null past this point.
  
  const tabs: Tab[] = ['overview', 'files', 'notes', 'calendar'];

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-6 pb-6 border-b border-slate-700/50">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-light text-slate-200 mb-2">Case #{caseData.number}</h2>
            <p className="text-slate-400">{caseData.title}</p>
          </div>
          <span className="px-4 py-2 bg-cyan-900/50 text-cyan-400 rounded-full text-sm font-medium">{caseData.status}</span>
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-slate-700/50">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium transition-colors capitalize ${activeTab === tab ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-300'}`}
          >
            {tab === 'files' ? 'Files & Evidence' : tab === 'notes' ? 'Notes & Logs' : tab}
          </button>
        ))}
      </div>

      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
        {activeTab === 'overview' && <p>{caseData.overview.description}</p>}
        {activeTab === 'files' && (
          <div className="grid grid-cols-3 gap-4">
            {caseData.files.map(file => (
              <div key={file.id} className="bg-slate-900/50 rounded p-4 text-center">
                <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-300 text-sm truncate">{file.name}</p>
              </div>
            ))}
          </div>
        )}
         {activeTab === 'notes' && (
          <div className="space-y-3">
            {caseData.notes.map(note => (
              <div key={note.id} className="bg-slate-900/50 rounded p-4">
                <p className="text-slate-400 text-xs mb-2">{note.timestamp}</p>
                <p className="text-slate-200">{note.text}</p>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'calendar' && (
          <div className="space-y-3">
            {caseData.calendar.map(event => (
              <div key={event.id} className={`bg-slate-900/50 rounded p-4 border-l-4 ${event.isPriority ? 'border-cyan-400' : 'border-slate-600'}`}>
                <p className="text-slate-200 font-medium mb-1">{event.title}</p>
                <p className="text-slate-400 text-sm">{event.dateTime}</p>
                <p className="text-slate-500 text-sm mt-2">{event.location}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseScreen;