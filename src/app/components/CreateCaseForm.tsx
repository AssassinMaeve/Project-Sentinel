"use client";

import React, { useState } from 'react';

interface CreateCaseFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCaseForm({ onClose, onSuccess }: CreateCaseFormProps) {
  const [formData, setFormData] = useState({
    caseName: '',
    caseNumber: '',
    description: '',
    deadline: '',
    type: 'Incident Report'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        setError(data.message || 'Failed to create case');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Create New Case</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="caseName" className="block text-gray-900 text-sm font-bold mb-2">
              Case Name *
            </label>
            <input
              id="caseName"
              name="caseName"
              type="text"
              value={formData.caseName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors text-gray-900 font-medium placeholder-gray-400"
              placeholder="e.g., Traffic Incident - Broadway & 5th"
            />
          </div>

          <div>
            <label htmlFor="caseNumber" className="block text-gray-900 text-sm font-bold mb-2">
              Case Number <span className="text-gray-500 font-normal text-xs">(Optional - auto-generated if empty)</span>
            </label>
            <input
              id="caseNumber"
              name="caseNumber"
              type="text"
              value={formData.caseNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors text-gray-900 font-medium placeholder-gray-400"
              placeholder="e.g., CZ-1138"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-gray-900 text-sm font-bold mb-2">
              Case Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors text-gray-900 font-medium bg-white"
            >
              <option value="Incident Report">Incident Report</option>
              <option value="Evidence Log">Evidence Log</option>
              <option value="Investigation">Investigation</option>
              <option value="Court Appearance">Court Appearance</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="deadline" className="block text-gray-900 text-sm font-bold mb-2">
              Deadline Date *
            </label>
            <input
              id="deadline"
              name="deadline"
              type="datetime-local"
              value={formData.deadline}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors text-gray-900 font-medium"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-gray-900 text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors resize-none text-gray-900 font-medium placeholder-gray-400"
              placeholder="Enter case details, notes, or additional information..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Creating...' : 'Create Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
