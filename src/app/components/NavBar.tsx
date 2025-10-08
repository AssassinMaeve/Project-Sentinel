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
  <nav className="bg-gradient-to-r from-[#6200EE] via-[#6200EE] to-[#6200EE] border-b-2 border-[#ebe5fb] px-6 py-4 shadow">
    <div className="flex justify-between items-center">
      {/* ... left side of navbar ... */}
      <div className="hidden md:flex gap-6">
        {navItems.map(item => (
          <button
            key={item}
            onClick={() => onNavigate(item)}
            className={`px-4 py-2 rounded-lg transition-colors capitalize font-semibold ${
              activeScreen === item
                ? 'bg-white/20 text-[#000000] shadow'
                : 'text-white/80 hover:text-white/100 hover:bg-white/10'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      
      <div className="flex items-center gap-4">
        {/* ... search input ... */}
        <button 
          onClick={() => onNavigate('profile')}
          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors shadow"
          title={userName ? `Officer ${userName}` : 'User Profile'}
        >
          <User className="w-5 h-5 text-[#5738e0]" />
        </button>
      </div>
    </div>
  </nav>
);

};

export default Navbar;