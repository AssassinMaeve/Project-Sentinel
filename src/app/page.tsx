"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/app/components/NavBar';
import Chatbot from '@/app/components/Chatbot';
import DashboardScreen from '@/app/screens/DashboardScreen';
import ReportScreen from '@/app/screens/ReportScreen';
import CaseScreen from '@/app/screens/CaseScreen';
import AuthScreen from '@/app/screens/AuthScreen'; // 1. Import the new AuthScreen
import { fetchDashboardData } from '@/app/api/sentinelApi';
import { User, Deadline, Case, Screen } from '@/app/types';
import ProfileScreen from '@/app/screens/ProfileScreen';

interface DashboardData {
  deadlines: Deadline[];
  cases: Case[];
}

export default function HomePage() {
  // 2. Add authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({ deadlines: [], cases: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only load app data if the user is authenticated
    if (!isAuthenticated) {
      setLoading(false);
      return;
    };

    const loadData = async () => {
      setLoading(true);
      try {
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
  }, [isAuthenticated]); // Re-run this effect when isAuthenticated changes

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleNavigate = (screen: Screen) => {
    setActiveScreen(screen);
  };

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveScreen('cases');
  };

  // 3. Conditional rendering based on authentication state
  if (!isAuthenticated) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const renderContent = () => {
    if (loading) return <div className="w-full text-center p-10">Loading Sentinel...</div>;
    if (error) return <div className="w-full text-center p-10 text-red-400">{error}</div>;

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

      case 'profile':
        return <ProfileScreen user={user} />;

      default:
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