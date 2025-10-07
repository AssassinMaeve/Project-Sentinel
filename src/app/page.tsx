// src/App.tsx
"use client";
import React, { useState, useEffect } from 'react';
import Navbar from './components/NavBar';
import Chatbot from './components/Chatbot';
import DashboardScreen from './screens/DashboardScreen';
import ReportScreen from './screens/ReportScreen';
import CaseScreen from './screens/CaseScreen';
import { fetchDashboardData } from './api/sentinelApi';

// 1. Define the "shapes" (types) for all your data.
// This is the most important step in fixing TypeScript errors.
interface User {
  name: string;
}

interface Deadline {
  id: number;
  caseNumber: string;
  task: string;
  dueIn: string;
}

interface Case {
  id: number;
  number: string;
  title: string;
  status: 'Active' | 'Pending' | 'Closed';
}

interface DashboardData {
  deadlines: Deadline[];
  cases: Case[];
}

// Create a type for screen names for better type safety
type Screen = 'dashboard' | 'reports' | 'cases';


function App() {
  // 2. Provide explicit types to your state hooks.
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // The state can now be a `User` object OR `null`.
  const [user, setUser] = useState<User | null>(null);
  
  // This tells TypeScript what the arrays will eventually hold.
  const [dashboardData, setDashboardData] = useState<DashboardData>({ deadlines: [], cases: [] });
  
  const [loading, setLoading] = useState<boolean>(true);
  
  // The error state can now be a `string` OR `null`.
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // The data from your API will be validated against the types above.
        const data = await fetchDashboardData();
        setUser(data.user);
        setDashboardData({ deadlines: data.deadlines, cases: data.cases });
      } catch (err) {
        setError("Could not load application data.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 3. Type all function parameters to avoid "implicit any" errors.
  const handleNavigate = (screen: Screen) => {
    setActiveScreen(screen);
  };

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveScreen('cases'); 
  };

  const renderContent = () => {
    if (loading) return <div className="w-full text-center p-10">Loading Sentinel...</div>;
    if (error) return <div className="w-full text-center p-10 text-red-400">{error}</div>;

    // The optional chaining (?.) on user is important because user can be null.
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardScreen 
                  userName={user?.name} 
                  deadlines={dashboardData.deadlines} 
                  cases={dashboardData.cases} 
                  onNavigate={handleNavigate}
                  onSelectCase={handleSelectCase}
                />;
      case 'reports':
        return <ReportScreen userName={user?.name} />;
      case 'cases':
        return <CaseScreen caseId={selectedCaseId} />;
      default:
        // This case should ideally not be hit, but it's good practice.
        return <div>Invalid Screen</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col">
      <Navbar userName={user?.name} activeScreen={activeScreen} onNavigate={handleNavigate} />
      <main className="flex-1 flex overflow-hidden">
        {renderContent()}
      </main>
      <Chatbot userName={user?.name} />
    </div>
  );
}

export default App;