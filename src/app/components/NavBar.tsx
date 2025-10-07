"use client";

import React from 'react';
import { Search, User } from 'lucide-react';
// ✅ 1. Import the shared 'Screen' type from your central types file.
import type { Screen } from '@/app/types';

// The NavbarProps interface now uses the imported, complete Screen type.
interface NavbarProps {
  userName: string | undefined;
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

// ❌ 2. The incorrect, local 'Screen' type definition has been REMOVED from here.

const Navbar = ({ userName, activeScreen, onNavigate }: NavbarProps) => {
  const navItems: Screen[] = ['dashboard', 'reports', 'cases', 'profile'];

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex justify-between items-center">
        { /* ... left side of navbar ... */ }
        <div className="hidden md:flex gap-6">
            {navItems.map(item => (
              <button
                key={item}
                onClick={() => onNavigate(item)}
                className={`px-4 py-2 rounded transition-colors capitalize ${
                  activeScreen === item ? 'bg-slate-700 text-slate-200' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item}
              </button>
            ))}
        </div>
        
        <div className="flex items-center gap-4">
          { /* ... search input ... */ }
          
          <button 
            onClick={() => onNavigate('profile')}
            className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors" 
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