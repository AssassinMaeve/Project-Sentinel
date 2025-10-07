"use client";

import React, { useState } from 'react';
import { LogIn, UserPlus, Mail } from 'lucide-react';
import { AnimatedBackground } from '@/app/components/AnimatedBackground';

interface AuthScreenProps {
  onLoginSuccess: () => void;
}

const AuthScreen = ({ onLoginSuccess }: AuthScreenProps) => {
  // Use a string to manage the view state for more flexibility
  const [view, setView] = useState<'login' | 'register' | 'forgotPassword'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed.');
    }
    onLoginSuccess();
  };

  const handleRegister = async () => {
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, badgeNumber, email, password }),
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed.');
    }
    setMessage("Registration successful! Please log in.");
    setView('login');
  };

  const handleForgotPassword = async () => {
    const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email.');
    }
    setMessage(data.message);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
        if (view === 'login') {
            await handleLogin();
        } else if (view === 'register') {
            await handleRegister();
        } else {
            await handleForgotPassword();
        }
    } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
        setIsLoading(false);
    }
  };
  
  const renderFormContent = () => {
    if (view === 'forgotPassword') {
        return (
            <>
                <h2 className="text-xl font-semibold text-gray-600">Forgot Password</h2>
                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border text-[#1d293d] border-gray-300 rounded-lg"/>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                        {isLoading ? 'Sending...' : <><Mail className="w-5 h-5" /> Send Reset Link</>}
                    </button>
                </form>
            </>
        );
    }

    return (
        <>
            <h2 className="text-xl font-semibold text-gray-600">{view === 'login' ? 'Officer Login' : 'Create Account'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                {view === 'register' && (
                    <>
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">Full Name</label>
                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full px-4 py-3 border text-[#1d293d] border-gray-300 rounded-lg"/>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">Badge Number</label>
                            <input type="text" value={badgeNumber} onChange={(e) => setBadgeNumber(e.target.value)} required className="w-full px-4 py-3 border text-[#1d293d] border-gray-300 rounded-lg"/>
                        </div>
                    </>
                )}
                <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border text-[#1d293d] border-gray-300 rounded-lg"/>
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 border text-[#1d293d] border-gray-300 rounded-lg"/>
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                    {isLoading ? 'Processing...' : (view === 'login' ? <><LogIn className="w-5 h-5"/> Sign In</> : <><UserPlus className="w-5 h-5"/> Create Account</>)}
                </button>
            </form>
        </>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <AnimatedBackground />
        <main className="w-full max-w-md z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 shadow-2xl p-8 w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#1d293d] rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xl">S</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Project Sentinel</h1>
                </div>

                {renderFormContent()}
                
                {error && <p className="text-sm text-red-600 text-center mt-4">{error}</p>}
                {message && <p className="text-sm text-green-600 text-center mt-4">{message}</p>}

                <div className="mt-6 text-center space-y-2">
                    {view === 'login' && (
                        <button onClick={() => setView('forgotPassword')} className="text-purple-600 hover:text-purple-700 text-sm">
                            Forgot Password?
                        </button>
                    )}
                    <button onClick={() => setView(view === 'login' ? 'register' : 'login')} className="block w-full text-purple-600 hover:text-purple-700 text-sm font-semibold">
                        {view === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </button>
                    {view === 'forgotPassword' && (
                         <button onClick={() => setView('login')} className="block w-full text-purple-600 hover:text-purple-700 text-sm">
                            &larr; Back to Login
                        </button>
                    )}
                </div>
            </div>
        </main>
    </div>
  );
};

export default AuthScreen;