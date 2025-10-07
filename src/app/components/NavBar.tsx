// src/components/Navbar.tsx

// This component is interactive (uses onClick), so it must be a Client Component.
"use client";

import React from 'react';
import { Search, User } from 'lucide-react';

// Define a type for the screen names for reusability and safety
type Screen = 'dashboard' | 'reports' | 'cases';

// Define an interface for the component's props
interface NavbarProps {
  userName: string | undefined;
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

// Apply the NavbarProps interface to the component's props
const Navbar = ({ userName, activeScreen, onNavigate }: NavbarProps) => {
  // For extra type safety, we can type our internal array as well
  const navItems: Screen[] = ['dashboard', 'reports', 'cases'];

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-semibold text-slate-200">Sentinel</span>
          </div>
          
          <div className="hidden md:flex gap-6">
            {navItems.map(item => (
              <button
                key={item}
                // The 'item' is now guaranteed to be of type Screen, matching the onNavigate function
                onClick={() => onNavigate(item)}
                className={`px-4 py-2 rounded transition-colors capitalize ${
                  activeScreen === item ? 'bg-slate-700 text-slate-200' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search cases, reports..."
              className="bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-600 w-64"
            />
          </div>
          <button 
            className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors" 
            // Check if userName exists before creating the title
            title={userName ? `Officer ${userName}` : 'User Profile'}
          >
            <User className="w-5 h-5 text-slate-300" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;