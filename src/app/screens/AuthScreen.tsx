"use client";

import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { AnimatedBackground } from '@/app/components/AnimatedBackground'; // Import the new component

const FAKE_AUTH_DELAY = 1000;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface AuthScreenProps {
  onLoginSuccess: () => void;
}

const AuthScreen = ({ onLoginSuccess }: AuthScreenProps) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    await sleep(FAKE_AUTH_DELAY);

    try {
      if (isLoginView) {
        if (email === 'test@test.com' && password === 'test') {
          onLoginSuccess();
        } else {
          throw new Error('Invalid email or password.');
        }
      } else {
        if (!fullName || !badgeNumber) {
            throw new Error('All registration fields are required.');
        }
        console.log('Registration successful:', { fullName, badgeNumber, email });
        setIsLoginView(true); 
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden ">
        <AnimatedBackground />
    
        <main className="w-full max-w-md z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 shadow-2xl p-8 w-full">
                <div className="text-center mb-8">
                    {/* Your custom color is preserved here */}
                    <div className="w-16 h-16 bg-[#1d293d] rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xl">S</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Project Sentinel</h1>
                    <h2 className="text-xl font-semibold text-gray-600">
                        {isLoginView ? 'Officer Login' : 'Create Account'}
                    </h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLoginView && (
                      <>
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">Full Name</label>
                            <input
                                type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-3 border text-[#1d293d] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                                placeholder="Enter your full name" required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">Badge Number</label>
                            <input
                                type="text" value={badgeNumber} onChange={(e) => setBadgeNumber(e.target.value)}
                                className="w-full px-4 py-3 border text-[#1d293d] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                                placeholder="Enter your badge number" required
                            />
                        </div>
                      </>
                    )}
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
                        <input
                            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border text-[#1d293d] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                            placeholder="Enter your email" required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
                        <input
                            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border text-[#1d293d] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                            placeholder="Enter your password" required
                        />
                    </div>
                    
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-400"
                    >
                        {isLoading ? (
                            'Processing...'
                          ) : isLoginView ? (
                            <><LogIn className="w-5 h-5" /> Sign In</>
                          ) : (
                            <><UserPlus className="w-5 h-5" /> Create Account</>
                        )}
                    </button>
                    
                    <div className="text-center">
                        <a href="#" className="text-purple-600 hover:text-purple-700 text-sm">
                            Forgot Password?
                        </a>
                    </div>
                </form>
                
                <div className="mt-6 text-center">
                    <button onClick={() => { setIsLoginView(!isLoginView); setError(null); }} className="text-purple-600 hover:text-purple-700 text-sm font-semibold">
                        {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </button>
                </div>
            </div>
        </main>
    </div>
  );
};

export default AuthScreen;