// src/app/screens/AccountScreen.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { User, Mail, Badge, Calendar, Activity, Brain, Battery, TrendingUp, Edit2, Save, X, LogOut, Shield, Bell, Lock } from 'lucide-react';

interface AccountScreenProps {
  userName: string | undefined;
  userEmail?: string;
  badgeNumber?: string;
  department?: string;
  rank?: string;
  joinDate?: string;
  mentalClarityScore?: number;
  resilienceReserve?: number;
  onLogout?: () => void;
}

const AccountScreen = ({
  userName,
  userEmail,
  badgeNumber,
  department,
  rank,
  joinDate,
  mentalClarityScore = 72,
  resilienceReserve = 65,
  onLogout
}: AccountScreenProps) => {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: userName || '',
    email: userEmail || '',
    badge: badgeNumber || '',
    department: department || '',
    rank: rank || '',
    joinDate: joinDate || ''
  });
  const [tempProfileData, setTempProfileData] = useState(profileData);
  const [wellnessStats, setWellnessStats] = useState({
    totalCheckIns: 0,
    currentStreak: 0,
    averageClarity: mentalClarityScore,
    averageResilience: resilienceReserve,
    weeklyTrend: [65, 70, 68, 72, 75, 73, 72]
  });
  const [notifications, setNotifications] = useState({
    checkInReminders: true,
    deadlineAlerts: true,
    wellnessTips: true,
    systemUpdates: false
  });

  useEffect(() => {
    loadProfileData();
    loadWellnessStats();
    loadNotificationSettings();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      // Try to fetch from API first
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        const loadedData = {
          name: data.name || userName || '',
          email: data.email || userEmail || '',
          badge: data.badgeNumber || badgeNumber || '',
          department: data.department || department || '',
          rank: data.rank || rank || '',
          joinDate: data.joinDate ? new Date(data.joinDate).toISOString().split('T')[0] : 
                    joinDate || new Date().toISOString().split('T')[0]
        };
        
        setProfileData(loadedData);
        setTempProfileData(loadedData);
        
        // Save to localStorage for offline access
        if (typeof window !== 'undefined') {
          localStorage.setItem('userName', loadedData.name);
          localStorage.setItem('userEmail', loadedData.email);
          localStorage.setItem('badgeNumber', loadedData.badge);
          localStorage.setItem('department', loadedData.department);
          localStorage.setItem('rank', loadedData.rank);
          localStorage.setItem('joinDate', loadedData.joinDate);
        }
      } else {
        // Fallback to localStorage if API fails
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading profile from API:', error);
      // Fallback to localStorage
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('userName');
      const savedEmail = localStorage.getItem('userEmail');
      const savedBadge = localStorage.getItem('badgeNumber');
      const savedDept = localStorage.getItem('department');
      const savedRank = localStorage.getItem('rank');
      const savedJoinDate = localStorage.getItem('joinDate');

      const loadedData = {
        name: savedName || userName || '',
        email: savedEmail || userEmail || '',
        badge: savedBadge || badgeNumber || '',
        department: savedDept || department || '',
        rank: savedRank || rank || '',
        joinDate: savedJoinDate || joinDate || new Date().toISOString().split('T')[0]
      };

      setProfileData(loadedData);
      setTempProfileData(loadedData);
    }
  };

  const loadWellnessStats = () => {
    if (typeof window !== 'undefined') {
      const morningCheckIns = JSON.parse(localStorage.getItem('morningCheckInHistory') || '[]');
      const eveningCheckIns = JSON.parse(localStorage.getItem('eveningCheckInHistory') || '[]');
      const savedTrend = localStorage.getItem('weeklyTrend');
      const savedClarity = localStorage.getItem('mentalClarityScore');
      const savedResilience = localStorage.getItem('resilienceReserve');

      const totalCheckIns = morningCheckIns.length + eveningCheckIns.length;
      const currentStreak = calculateStreak(morningCheckIns, eveningCheckIns);

      setWellnessStats({
        totalCheckIns,
        currentStreak,
        averageClarity: savedClarity ? parseInt(savedClarity) : mentalClarityScore,
        averageResilience: savedResilience ? parseInt(savedResilience) : resilienceReserve,
        weeklyTrend: savedTrend ? JSON.parse(savedTrend) : [65, 70, 68, 72, 75, 73, 72]
      });
    }
  };

  const calculateStreak = (morningData: any[], eveningData: any[]) => {
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateString = checkDate.toDateString();
      
      const hasCheckIn = morningData.some(d => d.date === dateString) || 
                         eveningData.some(d => d.date === dateString);
      
      if (hasCheckIn) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const loadNotificationSettings = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notificationSettings');
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    }
  };

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification('Sentinel Wellness', {
            body: 'Notifications enabled! You\'ll receive wellness check-in reminders.',
            icon: '/favicon.ico'
          });
        } else if (permission === 'denied') {
          alert('Notifications are blocked. Please enable them in your browser settings.');
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // Save to database first
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tempProfileData.name,
          email: tempProfileData.email,
          badgeNumber: tempProfileData.badge,
          department: tempProfileData.department,
          rank: tempProfileData.rank,
          joinDate: tempProfileData.joinDate
        })
      });

      if (response.ok) {
        // Also save to localStorage for offline access
        if (typeof window !== 'undefined') {
          localStorage.setItem('userName', tempProfileData.name);
          localStorage.setItem('userEmail', tempProfileData.email);
          localStorage.setItem('badgeNumber', tempProfileData.badge);
          localStorage.setItem('department', tempProfileData.department);
          localStorage.setItem('rank', tempProfileData.rank);
          localStorage.setItem('joinDate', tempProfileData.joinDate);
        }
        
        setProfileData(tempProfileData);
        setIsEditing(false);
        alert('✅ Profile updated successfully in database!');
      } else {
        const error = await response.json();
        alert(`❌ Failed to update profile: ${error.message}`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('❌ Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setTempProfileData(profileData);
    setIsEditing(false);
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('notificationSettings', JSON.stringify(updated));
    }

    // Request browser notification permission when enabling check-in reminders
    if (key === 'checkInReminders' && updated.checkInReminders) {
      requestNotificationPermission();
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
      }
      if (onLogout) onLogout();
    }
  };

  const operationalCapacity = (wellnessStats.averageClarity + wellnessStats.averageResilience) / 2;
  const capacityStatus = operationalCapacity >= 70 ? 'green' : operationalCapacity >= 50 ? 'yellow' : 'red';

  return (
    <div className="flex-1 min-h-screen overflow-y-auto p-0 bg-gradient-to-br from-[#2563eb] via-[#3b82f6] to-[#60a5fa]">
      <div className="max-w-6xl mx-auto py-14 px-4 space-y-8">
        
        {/* Header */}
        <div className="mb-2">
          <h2 className="text-3xl font-extrabold text-white mb-1 drop-shadow-lg">
            Officer Profile
          </h2>
          <p className="text-white/80 text-sm">
            Manage your account and view wellness statistics
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="rounded-xl px-7 py-7 bg-white/90 shadow-xl border-2 border-blue-300">
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-blue-900 font-semibold">Loading profile...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Profile Information Card */}
            <div className="rounded-xl px-7 py-7 bg-white/90 shadow-xl border-2 border-blue-300">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'O'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-blue-900">
                      {isEditing ? 'Edit Profile' : profileData.name || 'Officer'}
                    </h3>
                    <p className="text-blue-600 text-sm">{profileData.rank || 'Law Enforcement Officer'}</p>
                  </div>
                </div>
                
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition font-semibold"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                )}
              </div>

              {/* Profile Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-blue-700 mb-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempProfileData.name}
                      onChange={(e) => setTempProfileData({...tempProfileData, name: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-600 focus:outline-none text-gray-900 placeholder-gray-400 bg-white"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-blue-900 font-medium text-base">{profileData.name || 'Not set'}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-blue-700 mb-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={tempProfileData.email}
                      onChange={(e) => setTempProfileData({...tempProfileData, email: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-600 focus:outline-none text-gray-900 placeholder-gray-400 bg-white"
                      placeholder="example@email.com"
                    />
                  ) : (
                    <p className="text-blue-900 font-medium text-base">{profileData.email || 'Not set'}</p>
                  )}
                </div>

                {/* Badge Number */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-blue-700 mb-2">
                    <Badge className="w-4 h-4" />
                    Badge Number
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempProfileData.badge}
                      onChange={(e) => setTempProfileData({...tempProfileData, badge: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-600 focus:outline-none text-gray-900 placeholder-gray-400 bg-white"
                      placeholder="e.g., 12345"
                    />
                  ) : (
                    <p className="text-blue-900 font-medium text-base">{profileData.badge || 'Not set'}</p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-blue-700 mb-2">
                    <Shield className="w-4 h-4" />
                    Department
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempProfileData.department}
                      onChange={(e) => setTempProfileData({...tempProfileData, department: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-600 focus:outline-none text-gray-900 placeholder-gray-400 bg-white"
                      placeholder="e.g., Patrol Division"
                    />
                  ) : (
                    <p className="text-blue-900 font-medium text-base">{profileData.department || 'Not set'}</p>
                  )}
                </div>

                {/* Rank */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-blue-700 mb-2">
                    <Activity className="w-4 h-4" />
                    Rank
                  </label>
                  {isEditing ? (
                    <select
                      value={tempProfileData.rank}
                      onChange={(e) => setTempProfileData({...tempProfileData, rank: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-600 focus:outline-none text-gray-900 bg-white"
                    >
                      <option value="">Select Rank</option>
                      <option value="Officer">Officer</option>
                      <option value="Corporal">Corporal</option>
                      <option value="Sergeant">Sergeant</option>
                      <option value="Lieutenant">Lieutenant</option>
                      <option value="Captain">Captain</option>
                      <option value="Commander">Commander</option>
                      <option value="Chief">Chief</option>
                    </select>
                  ) : (
                    <p className="text-blue-900 font-medium text-base">{profileData.rank || 'Not set'}</p>
                  )}
                </div>

                {/* Join Date */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-blue-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    Join Date
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={tempProfileData.joinDate}
                      onChange={(e) => setTempProfileData({...tempProfileData, joinDate: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-600 focus:outline-none text-gray-900 bg-white"
                    />
                  ) : (
                    <p className="text-blue-900 font-medium text-base">
                      {profileData.joinDate ? new Date(profileData.joinDate).toLocaleDateString() : 'Not set'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Wellness Statistics Card */}
            <div className="rounded-xl px-7 py-7 bg-white/90 shadow-xl border-2 border-blue-300">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">Wellness Statistics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total Check-Ins */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-blue-700">Total Check-Ins</span>
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-900">{wellnessStats.totalCheckIns}</div>
                </div>

                {/* Current Streak */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-green-700">Current Streak</span>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-900">{wellnessStats.currentStreak} days</div>
                </div>

                {/* Mental Clarity */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-purple-700">Mental Clarity</span>
                    <Brain className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-purple-900">{wellnessStats.averageClarity}</div>
                </div>

                {/* Resilience */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-orange-700">Resilience</span>
                    <Battery className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-3xl font-bold text-orange-900">{wellnessStats.averageResilience}%</div>
                </div>
              </div>

              {/* Operational Status */}
              <div className={`rounded-xl p-5 border-2 ${
                capacityStatus === 'green' ? 'bg-green-100 border-green-300' :
                capacityStatus === 'yellow' ? 'bg-yellow-100 border-yellow-300' :
                'bg-red-100 border-red-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">Current Operational Capacity</h4>
                    <p className="text-sm text-gray-700">Based on recent check-ins and wellness metrics</p>
                  </div>
                  <div className={`px-6 py-3 rounded-full font-bold text-white text-lg shadow-lg ${
                    capacityStatus === 'green' ? 'bg-green-600' :
                    capacityStatus === 'yellow' ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}>
                    {capacityStatus === 'green' ? '✓ OPTIMAL' :
                     capacityStatus === 'yellow' ? '⚠ MODERATE' :
                     '⚡ ATTENTION'}
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings Card */}
            <div className="rounded-xl px-7 py-7 bg-white/90 shadow-xl border-2 border-blue-300">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-6 h-6 text-blue-600" />
                <h3 className="text-2xl font-bold text-blue-900">Notification Settings</h3>
              </div>

              <div className="space-y-4">
                {/* Check-In Reminders */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <h4 className="font-semibold text-blue-900">Check-In Reminders</h4>
                    <p className="text-sm text-blue-600">Daily morning and evening wellness check-ins</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('checkInReminders')}
                    className={`w-14 h-8 rounded-full transition-colors relative ${
                      notifications.checkInReminders ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      notifications.checkInReminders ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>

                {/* Deadline Alerts */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <h4 className="font-semibold text-blue-900">Deadline Alerts</h4>
                    <p className="text-sm text-blue-600">Notifications for upcoming case deadlines</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('deadlineAlerts')}
                    className={`w-14 h-8 rounded-full transition-colors relative ${
                      notifications.deadlineAlerts ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      notifications.deadlineAlerts ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>

                {/* Wellness Tips */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <h4 className="font-semibold text-blue-900">Wellness Tips</h4>
                    <p className="text-sm text-blue-600">Personalized stress management and wellness advice</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('wellnessTips')}
                    className={`w-14 h-8 rounded-full transition-colors relative ${
                      notifications.wellnessTips ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      notifications.wellnessTips ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>

                {/* System Updates */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <h4 className="font-semibold text-blue-900">System Updates</h4>
                    <p className="text-sm text-blue-600">New features and system maintenance notifications</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('systemUpdates')}
                    className={`w-14 h-8 rounded-full transition-colors relative ${
                      notifications.systemUpdates ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      notifications.systemUpdates ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Account Actions Card */}
            <div className="rounded-xl px-7 py-7 bg-white/90 shadow-xl border-2 border-red-300">
              <h3 className="text-2xl font-bold text-red-900 mb-4">Account Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => alert('Password change functionality coming soon')}
                  className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Change Password</span>
                  </div>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-900">Logout</span>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default AccountScreen;
