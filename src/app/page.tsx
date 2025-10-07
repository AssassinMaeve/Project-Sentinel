"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/app/components/NavBar';
import Chatbot from '@/app/components/Chatbot';
import DashboardScreen from '@/app/screens/DashboardScreen';
import ReportScreen from '@/app/screens/ReportScreen';
import CaseScreen from '@/app/screens/CaseScreen';
import { fetchDashboardData } from '@/app/api/sentinelApi';
import { User, Deadline, Case, Screen } from '@/app/types';

interface DashboardData {
  deadlines: Deadline[];
  cases: Case[];
}

type AuthView = 'login' | 'register' | 'forgot-password';

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [isFlipping, setIsFlipping] = useState(false);
  
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({ deadlines: [], cases: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

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
  }, [isAuthenticated]);

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

  const switchAuthView = (view: AuthView) => {
    setIsFlipping(true);
    setTimeout(() => {
      setAuthView(view);
      setIsFlipping(false);
    }, 300);
  };

  // Render authentication screens with split design and flip animation
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
            
            {/* Left Side - Welcome Section */}
            <div className="w-full md:w-1/2 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 p-12 flex flex-col justify-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-10 left-10 w-32 h-32 bg-pink-300/20 rounded-full blur-2xl"></div>
              
              {/* Decorative shapes */}
              <div className="absolute top-20 left-20 w-16 h-2 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full transform -rotate-45"></div>
              <div className="absolute top-32 left-16 w-20 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transform -rotate-45"></div>
              <div className="absolute top-44 left-24 w-24 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full transform -rotate-45"></div>
              <div className="absolute bottom-32 right-16 w-32 h-2 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transform rotate-45"></div>
              <div className="absolute bottom-20 right-20 w-28 h-2 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full transform rotate-45"></div>

              <div className="relative z-10">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                  Welcome to Sentinel Wellness
                </h1>
                <p className="text-white/90 text-lg leading-relaxed mb-8">
                  Your confidential mental health and stress management support system designed specifically for law enforcement professionals. We're here to support your wellbeing, 24/7.
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-white/90">
                    <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Confidential & Secure</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/90">
                    <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">AI-Powered Support</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/90">
                    <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Peer Support Network</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Flip Card Container */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex items-center justify-center bg-gray-50">
              <div className="w-full max-w-md">
                {/* 3D Flip Card Container */}
                <div className="flip-container" style={{ perspective: '1000px' }}>
                  <div 
                    className={`flip-card ${isFlipping ? 'flipping' : ''}`}
                    style={{
                      width: '100%',
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.6s',
                      transform: authView === 'login' ? 'rotateY(0deg)' : authView === 'register' ? 'rotateY(180deg)' : 'rotateY(360deg)'
                    }}
                  >
                    {/* Login Form Face */}
                    <div 
                      className="flip-card-face"
                      style={{
                        backfaceVisibility: 'hidden',
                        position: authView === 'login' ? 'relative' : 'absolute',
                        width: '100%',
                        top: 0,
                        left: 0
                      }}
                    >
                      {authView === 'login' && (
                        <LoginForm
                          onLoginSuccess={handleLoginSuccess}
                          onSwitchToRegister={() => switchAuthView('register')}
                          onSwitchToForgotPassword={() => switchAuthView('forgot-password')}
                        />
                      )}
                    </div>

                    {/* Register Form Face */}
                    <div 
                      className="flip-card-face"
                      style={{
                        backfaceVisibility: 'hidden',
                        position: authView === 'register' ? 'relative' : 'absolute',
                        width: '100%',
                        top: 0,
                        left: 0,
                        transform: 'rotateY(180deg)'
                      }}
                    >
                      {authView === 'register' && (
                        <RegisterForm onSwitchToLogin={() => switchAuthView('login')} />
                      )}
                    </div>

                    {/* Forgot Password Face */}
                    <div 
                      className="flip-card-face"
                      style={{
                        backfaceVisibility: 'hidden',
                        position: authView === 'forgot-password' ? 'relative' : 'absolute',
                        width: '100%',
                        top: 0,
                        left: 0,
                        transform: 'rotateY(360deg)'
                      }}
                    >
                      {authView === 'forgot-password' && (
                        <ForgotPasswordForm onBack={() => switchAuthView('login')} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(30px, -30px); }
          }
          @keyframes float-delayed {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(-30px, 30px); }
          }
          .animate-float { animation: float 8s ease-in-out infinite; }
          .animate-float-delayed { animation: float-delayed 10s ease-in-out infinite; }
          .flip-card.flipping { pointer-events: none; }
        `}</style>
      </div>
    );
  }

  const renderContent = () => {
    if (loading) return <div className="w-full text-center p-10">Loading Sentinel Wellness...</div>;
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

// ==================== LOGIN FORM ====================
interface LoginFormProps {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}

function LoginForm({ onLoginSuccess, onSwitchToRegister, onSwitchToForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-indigo-600 mb-2">USER LOGIN</h2>
        <p className="text-gray-600 text-sm">Access your wellness dashboard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
            Password
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </span>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Enter your password"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="remember" 
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
            Remember me
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 shadow-lg"
        >
          {loading ? 'Signing in...' : 'LOGIN'}
        </button>
      </form>

      <div className="mt-6 text-center space-y-3">
        <button
          onClick={onSwitchToForgotPassword}
          className="block w-full text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors"
        >
          Forgot password?
        </button>
        <div className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== REGISTER FORM ====================
interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    badgeNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          badgeNumber: formData.badgeNumber
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registration successful! Please login.');
        onSwitchToLogin();
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-indigo-600 mb-2">CREATE ACCOUNT</h2>
        <p className="text-gray-600 text-sm">Join the wellness community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Full Name"
          />
        </div>

        <div>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Email Address"
          />
        </div>

        <div>
          <input
            name="badgeNumber"
            type="text"
            value={formData.badgeNumber}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Badge Number (optional)"
          />
        </div>

        <div>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Password"
          />
        </div>

        <div>
          <input
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Confirm Password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 shadow-lg"
        >
          {loading ? 'Creating account...' : 'REGISTER'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
        >
          Login here
        </button>
      </div>
    </div>
  );
}

// ==================== FORGOT PASSWORD FORM ====================
interface ForgotPasswordFormProps {
  onBack: () => void;
}

function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Recovery instructions sent to your email.');
      } else {
        setError(data.message || 'Failed to send reset email');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-indigo-600 mb-2">RESET PASSWORD</h2>
        <p className="text-gray-600 text-sm">We'll send you recovery instructions</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <div>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 shadow-lg"
        >
          {loading ? 'Sending...' : 'SEND RESET LINK'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 w-full text-indigo-600 hover:text-indigo-700 text-sm font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Login
        </button>
      </div>
    </div>
  );
}
