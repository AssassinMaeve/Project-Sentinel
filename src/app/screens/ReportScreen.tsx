// src/screens/ReportScreen.tsx

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Upload, FileText, Copy, Save, Send, FileCheck, AlertCircle, MicOff, Volume2, VolumeX } from 'lucide-react';
import { generateReportApi, uploadPDFAndExtract } from '@/app/api/sentinelApi';

interface ReportScreenProps {
  userName: string | undefined;
}

const ReportScreen = ({ userName }: ReportScreenProps) => {
  const [notes, setNotes] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [incidentType, setIncidentType] = useState('');
  const [isProcessingPDF, setIsProcessingPDF] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [pdfMetadata, setPdfMetadata] = useState<{ pages: number; fileSize: number } | null>(null);
  
  // Voice Input States (Speech-to-Text)
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Text-to-Speech States
  const [isReading, setIsReading] = useState(false);

  const incidentTypes = [
    'Select Incident Type',
    'Traffic Accident',
    'Assault',
    'Theft/Burglary',
    'Domestic Dispute',
    'Drug-Related',
    'Vandalism',
    'Public Disturbance',
    'Missing Person',
    'Suspicious Activity',
    'Other'
  ];

  // ✅ Initialize Speech Recognition (Speech-to-Text)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setIsSpeechSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }

        if (finalTranscript) {
          setNotes((prev) => prev + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          setError('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please enable microphone permissions.');
        } else {
          setError(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // ✅ Play Beep Sound (Audio Feedback)
  const playBeep = (frequency: number, duration: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (err) {
      console.log('Could not play audio feedback');
    }
  };

  // ✅ Toggle Voice Input (Speech-to-Text)
  const handleVoiceInput = () => {
    if (!isSpeechSupported) {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      // Stop listening
      recognitionRef.current?.stop();
      setIsListening(false);
      playBeep(400, 0.1); // Lower pitch = stop
    } else {
      // Start listening
      setError(null);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        playBeep(800, 0.1); // Higher pitch = start
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setError('Failed to start voice input. Please try again.');
      }
    }
  };

  // ✅ Read Report Aloud (Text-to-Speech)
  const handleReadReport = () => {
    if (!('speechSynthesis' in window)) {
      setError('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isReading) {
      // Stop reading
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      // Start reading
      const utterance = new SpeechSynthesisUtterance(generatedText);
      utterance.rate = 1.0; // Speed (0.1 to 10)
      utterance.pitch = 1.0; // Pitch (0 to 2)
      utterance.volume = 1.0; // Volume (0 to 1)
      
      utterance.onstart = () => setIsReading(true);
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setIsProcessingPDF(true);
    setError(null);
    setUploadedFileName(null);
    setPdfMetadata(null);

    try {
      console.log(`Uploading PDF: ${file.name}`);
      const result = await uploadPDFAndExtract(file);
      
      setNotes(result.text);
      setUploadedFileName(result.metadata.fileName);
      setPdfMetadata({
        pages: result.metadata.pages,
        fileSize: result.metadata.fileSize,
      });
      setError(null);
      
      console.log(`PDF processed: ${result.metadata.pages} pages, ${result.text.length} characters`);
    } catch (err) {
      console.error('PDF processing failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to extract text from PDF. Please try again.');
    } finally {
      setIsProcessingPDF(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!notes.trim()) {
      setError("Please enter some notes before generating a report.");
      return;
    }
    
    if (!userName) {
      setError("User data is not available. Cannot generate report.");
      return;
    }

    const wordCount = notes.split(/\s+/).length;
    const isLargeDocument = wordCount > 18000 || (pdfMetadata && pdfMetadata.pages > 50);
    
    if (isLargeDocument) {
      setError(null);
      console.log(`Large document detected: ${wordCount} words, processing with Map-Reduce...`);
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await generateReportApi(
        notes, 
        userName,
        incidentType !== 'Select Incident Type' ? incidentType : undefined,
        isLargeDocument || undefined
      );

      setGeneratedText(result);
      setIsGenerated(true);
    } catch (err) {
      console.error("Failed to generate report", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during report generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generatedText);
    alert('Report copied to clipboard!');
  };

  const handleSaveReport = () => {
    const blob = new Blob([generatedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `police_report_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmitReport = () => {
    alert('Report submission functionality - connect to your backend system here!');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
      {/* LEFT PANEL - Input */}
      <div className="lg:w-1/2 p-8 border-r border-slate-700/50 flex flex-col">
        <h2 className="text-2xl font-light text-slate-200 mb-6">Generate Report</h2>
        
        {/* Incident Type Selector */}
        <div className="mb-4">
          <label className="text-slate-400 text-sm mb-2 block">
            Incident Type <span className="text-slate-500">(Optional)</span>
          </label>
          <select
            value={incidentType}
            onChange={(e) => setIncidentType(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-cyan-600 transition-colors"
            disabled={isProcessingPDF || isGenerating}
          >
            {incidentTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* PDF Upload Info */}
        {uploadedFileName && pdfMetadata && (
          <div className="mb-3 p-3 bg-cyan-900/20 border border-cyan-700/50 rounded-lg">
            <div className="flex items-center gap-2 text-cyan-400 text-sm">
              <FileCheck className="w-4 h-4" />
              <span className="font-medium">{uploadedFileName}</span>
            </div>
            <div className="text-slate-400 text-xs mt-1">
              {pdfMetadata.pages} pages • {formatFileSize(pdfMetadata.fileSize)}
            </div>
          </div>
        )}

        {/* Voice Status Indicator */}
        {isListening && (
          <div className="mb-3 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="font-medium">🎤 Listening... Click again to stop</span>
            </div>
          </div>
        )}

        {/* Notes Textarea */}
        <div className="flex-1 flex flex-col">
          <label className="text-slate-400 text-sm mb-2">
            Enter your notes, upload PDF, or start dictating...
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-slate-200 resize-none focus:outline-none focus:border-cyan-600 transition-colors"
            placeholder="Describe the incident, location, parties involved, and any observations..."
            disabled={isProcessingPDF}
          />
          
          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            {/* Voice Input Button (Speech-to-Text) */}
            <button 
              onClick={handleVoiceInput}
              className={`flex-1 ${
                isListening 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-slate-700 hover:bg-slate-600'
              } text-slate-200 px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={isProcessingPDF || isGenerating}
              title={isSpeechSupported ? 'Click to start/stop voice input' : 'Speech recognition not supported'}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5" /> Stop Listening
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" /> Voice Input
                </>
              )}
            </button>
            
            {/* Upload PDF Button */}
            <label className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessingPDF || isGenerating}
              />
              {isProcessingPDF ? (
                <>
                  <FileCheck className="w-5 h-5 animate-pulse" /> Processing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" /> Upload PDF
                </>
              )}
            </label>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 mt-3 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          {/* Generate Button */}
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating || isProcessingPDF || !notes.trim()}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-4 rounded-lg transition-colors font-medium mt-3 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Standardized Report...
              </>
            ) : (
              'Generate Report with AI'
            )}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL - Output */}
      <div className="lg:w-1/2 p-8 bg-slate-900/30 flex flex-col">
        {isGenerated ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-light text-slate-200">Generated Report</h2>
              <div className="flex gap-2">
                {/* ✅ Text-to-Speech Button */}
                <button 
                  onClick={handleReadReport}
                  className={`p-2 ${
                    isReading ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-700 hover:bg-slate-600'
                  } rounded transition-colors`}
                  title={isReading ? 'Stop reading' : 'Read report aloud'}
                >
                  {isReading ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-slate-300" />
                  )}
                </button>
                
                <button 
                  onClick={handleCopyReport}
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors" 
                  title="Copy to Clipboard"
                >
                  <Copy className="w-5 h-5 text-slate-300" />
                </button>
                <button 
                  onClick={handleSaveReport}
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors" 
                  title="Save as TXT"
                >
                  <Save className="w-5 h-5 text-slate-300" />
                </button>
                <button 
                  onClick={handleSubmitReport}
                  className="p-2 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors" 
                  title="Submit Report"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-white/95 rounded-lg p-6 overflow-y-auto">
              <pre className="text-slate-900 text-sm font-mono whitespace-pre-wrap leading-relaxed">
                {generatedText}
              </pre>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-2">Your generated report will appear here</p>
              <p className="text-slate-500 text-sm">
                Upload a PDF, type notes, or use voice input to generate a standardized police report
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportScreen;
