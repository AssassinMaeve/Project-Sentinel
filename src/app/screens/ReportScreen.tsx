// src/screens/ReportScreen.jsx
import React, { useState } from 'react';
import { Mic, Upload, FileText, Copy, Save, Send } from 'lucide-react';
import { generateReportApi } from '../api/sentinelApi';

const ReportScreen = ({ userName }) => {
  const [notes, setNotes] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  const handleGenerateReport = async () => {
    if (!notes) return;
    setIsGenerating(true);
    try {
      const result = await generateReportApi(notes, userName);
      setGeneratedText(result);
      setIsGenerated(true);
    } catch (error) {
      console.error("Failed to generate report", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
      <div className="lg:w-1/2 p-8 border-r border-slate-700/50 flex flex-col">
        <h2 className="text-2xl font-light text-slate-200 mb-6">Generate Report</h2>
        <div className="flex-1 flex flex-col">
          <label className="text-slate-400 text-sm mb-2">Enter your notes or start dictating...</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-slate-200 resize-none focus:outline-none focus:border-cyan-600 transition-colors"
            placeholder="Describe the incident, location, parties involved, and any observations..."
          />
          <div className="flex gap-3 mt-4">
            <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              <Mic className="w-5 h-5" /> Voice Input
            </button>
            <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              <Upload className="w-5 h-5" /> Attach Files
            </button>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-4 rounded-lg transition-colors font-medium mt-3 disabled:bg-slate-600"
          >
            {isGenerating ? 'Generating...' : 'Generate Report with AI'}
          </button>
        </div>
      </div>
      <div className="lg:w-1/2 p-8 bg-slate-900/30 flex flex-col">
        {isGenerated ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-light text-slate-200">Generated Report</h2>
              <div className="flex gap-2">
                <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors" title="Copy"><Copy className="w-5 h-5 text-slate-300" /></button>
                <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors" title="Save"><Save className="w-5 h-5 text-slate-300" /></button>
                <button className="p-2 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors" title="Submit"><Send className="w-5 h-5 text-white" /></button>
              </div>
            </div>
            <div className="flex-1 bg-white/95 rounded-lg p-6 overflow-y-auto">
              <pre className="text-slate-900 text-sm font-mono whitespace-pre-wrap leading-relaxed">{generatedText}</pre>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Your generated report will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportScreen;