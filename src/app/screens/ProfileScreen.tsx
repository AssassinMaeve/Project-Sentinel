"use client";

import React, { useState, useEffect } from 'react';
import { User, Edit, Save, LogOut, Briefcase, FileText as FileIcon } from 'lucide-react';
import type { User as UserType } from '@/app/types';

// Define a shape for our profile data
interface ProfileData {
  fullName: string;
  badgeNumber: string;
  email: string;
  department: string;
  rank: string;
}

interface ProfileScreenProps {
  user: UserType | null;
}

const ProfileScreen = ({ user }: ProfileScreenProps) => {
  // 1. State is now initialized as null, to be filled by the API call.
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. useEffect to fetch data when the component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // In a real app, you'd fetch from an endpoint like '/api/profile'
        // We'll simulate it for now.
        console.log("Fetching profile data...");
        // const response = await fetch('/api/profile');
        // const data = await response.json();
        
        // --- Mock API Response ---
        const mockApiData: ProfileData = {
          fullName: user?.name || 'John Martinez',
          badgeNumber: '78-1138',
          email: 'j.martinez@police.gov',
          department: '12th Precinct',
          rank: 'Patrol Officer'
        };
        // -------------------------

        setProfileData(mockApiData);
      } catch (err) {
        setError("Failed to load profile data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user]); // Re-fetch if the user prop changes

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profileData) return;
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev!, [name]: value }));
  };
  
  // 3. handleSave is now an async function that sends data to the backend
  const handleSave = async () => {
    if (!profileData) return;
    
    setIsEditing(false);
    console.log("Saving data to API:", profileData);

    try {
        // In a real app, you would make an API call here to save the data
        // const response = await fetch('/api/profile', {
        //     method: 'PUT', // or 'PATCH'
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(profileData),
        // });
        // if (!response.ok) throw new Error("Failed to save profile.");
        
        // Simulate a delay
        await new Promise(res => setTimeout(res, 500));
        console.log("Save successful!");

    } catch (err) {
        // Handle save errors, maybe show a notification to the user
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
    }
  }
  
  // Render loading/error states before the main content
  if (isLoading) return <div className="p-8 text-center w-full">Loading Profile...</div>;
  if (error) return <div className="p-8 text-center w-full text-red-400">Error: {error}</div>;
  if (!profileData) return <div className="p-8 text-center w-full">Could not load profile information.</div>;


  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-light text-slate-200">Officer Profile</h2>
        {isEditing ? (
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
            <Edit className="w-4 h-4" /> Edit Profile
          </button>
        )}
      </div>

      {/* ... The rest of your JSX remains the same, using 'profileData' ... */}
      
    </div>
  );
};

export default ProfileScreen;