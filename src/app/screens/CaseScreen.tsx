"use client";

import React, { useState, useEffect } from 'react';

interface CaseScreenProps {
  caseId: string | null;
  onRefresh?: () => void; // Add refresh callback
}

interface CaseData {
  _id: string;
  caseNumber: string;
  caseName: string;
  description: string;
  status: string;
  type: string;
  deadline: string;
  createdAt: string;
}

export default function CaseScreen({ caseId, onRefresh }: CaseScreenProps) {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<CaseData | null>(null);

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    if (caseId) {
      const foundCase = cases.find((c: CaseData) => c._id === caseId);
      if (foundCase) {
        setSelectedCase(foundCase);
      }
    }
  }, [caseId, cases]);

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/cases');
      const data = await response.json();
      
      if (response.ok) {
        setCases(data.cases);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCase = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case?')) return;

    try {
      const response = await fetch(`/api/cases?caseId=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh local cases list
        await fetchCases();
        
        // Clear selected case
        if (selectedCase?._id === id) {
          setSelectedCase(null);
        }
        
        // Refresh dashboard if callback provided
        if (onRefresh) {
          onRefresh();
        }
        
        alert('Case deleted successfully!');
      } else {
        alert('Failed to delete case. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting case:', error);
      alert('An error occurred while deleting the case.');
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="text-white text-lg">Loading cases...</div>
      </div>
    );
  }

  // If a specific case is selected, show detailed view
  // Detailed Case View
if (selectedCase) {
  return (
    <div className="w-full p-10 bg-white/90 rounded-2xl shadow-2xl min-h-[520px]">
      <button
        onClick={() => setSelectedCase(null)}
        className="flex items-center gap-2 text-[#5738e0] hover:text-[#ff49b7] mb-6 font-semibold transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to All Cases
      </button>
      <div className="bg-white rounded-xl p-8 border-2 border-[#ebe5fb] shadow">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#5738e0] mb-2">{selectedCase.caseNumber}</h1>
            <span className="px-3 py-1 bg-[#f3e6fc] text-[#683bbc] text-sm font-semibold rounded-full">
              {selectedCase.status}
            </span>
          </div>
          <button
            onClick={() => handleDeleteCase(selectedCase._id)}
            className="px-4 py-2 bg-gradient-to-r from-[#e6358f] to-[#fa4db7] hover:from-[#b8206f] hover:to-[#ff49b7] text-white rounded-lg font-semibold transition-colors shadow"
          >
            Delete Case
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-[#8b6af8] text-sm font-semibold mb-2">Case Name</h3>
            <p className="text-[#413181] text-lg">{selectedCase.caseName}</p>
          </div>
          <div>
            <h3 className="text-[#8b6af8] text-sm font-semibold mb-2">Type</h3>
            <p className="text-[#413181]">{selectedCase.type}</p>
          </div>
          <div>
            <h3 className="text-[#8b6af8] text-sm font-semibold mb-2">Description</h3>
            <p className="text-[#413181]">{selectedCase.description || 'No description provided'}</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-[#8b6af8] text-sm font-semibold mb-2">Deadline</h3>
              <p className="text-[#413181]">{new Date(selectedCase.deadline).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="text-[#8b6af8] text-sm font-semibold mb-2">Created</h3>
              <p className="text-[#413181]">{new Date(selectedCase.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// All Cases Grid View
return (
  <div className="w-full p-10 bg-white/90 rounded-2xl shadow-2xl min-h-[520px]">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-[#5738e0]">All Cases</h1>
      <div className="text-[#683bbc] font-medium">
        {cases.length} {cases.length === 1 ? 'case' : 'cases'}
      </div>
    </div>
    {cases.length === 0 ? (
      <div className="bg-[#f3e6fc] rounded-xl p-12 border-2 border-[#ebe5fb] text-center shadow">
        <svg className="w-16 h-16 text-[#bcbada] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-xl font-semibold text-[#5738e0] mb-2">No cases yet</h3>
        <p className="text-[#683bbc] font-medium">Create your first case from the dashboard</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map((caseItem) => (
          <div 
            key={caseItem._id}
            className="bg-white rounded-xl p-6 border-2 border-[#ebe5fb] hover:border-[#ff49b7] transition-all group shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h3
                className="text-xl font-bold text-[#5738e0] group-hover:text-[#ff49b7] transition-colors cursor-pointer"
                onClick={() => setSelectedCase(caseItem)}
              >
                {caseItem.caseNumber}
              </h3>
              <span className="px-3 py-1 bg-[#fa4db7]/10 text-[#fa4db7] text-xs font-semibold rounded-full">
                {caseItem.status}
              </span>
            </div>

            <h4 className="text-[#683bbc] font-semibold mb-2">{caseItem.caseName}</h4>

            <p className="text-[#8b6af8] text-sm mb-4 line-clamp-2">
              {caseItem.description || 'No description'}
            </p>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2 text-[#bcbada]">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <span>{caseItem.type}</span>
              </div>
              <div className="flex items-center gap-2 text-[#bcbada]">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span>{new Date(caseItem.deadline).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCase(caseItem)}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-[#5738e0] to-[#ff49b7] hover:from-[#683bbc] hover:to-[#ff79c9] text-white text-sm font-semibold rounded-lg transition-colors shadow"
              >
                View Details
              </button>
              <button
                onClick={() => handleDeleteCase(caseItem._id)}
                className="px-3 py-2 bg-gradient-to-r from-[#e6358f] to-[#fa4db7] hover:from-[#b8206f] hover:to-[#ff49b7] text-white text-sm font-semibold rounded-lg transition-colors shadow"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

}
