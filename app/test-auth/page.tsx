'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function TestAuthPage() {
  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'profile'>('register');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');

  // Register form
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
  });

  // Login form
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('Registering...');

    try {
      const response = await api.auth.register(
        registerData.email,
        registerData.password,
        registerData.name
      );
      setStatus('success');
      setMessage(`✅ Registration successful!\n\n${JSON.stringify(response, null, 2)}`);
      setToken(response.token);
    } catch (error) {
      setStatus('error');
      setMessage(`❌ Registration failed!\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('Logging in...');

    try {
      const response = await api.auth.login(loginData.email, loginData.password);
      setStatus('success');
      setMessage(`✅ Login successful!\n\n${JSON.stringify(response, null, 2)}`);
      setToken(response.token);
    } catch (error) {
      setStatus('error');
      setMessage(`❌ Login failed!\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleGetProfile = async () => {
    if (!token) {
      setMessage('❌ Please login first to get a token!');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setMessage('Fetching profile...');

    try {
      const response = await api.auth.getProfile(token);
      setStatus('success');
      setMessage(`✅ Profile fetched!\n\n${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      setStatus('error');
      setMessage(`❌ Failed to fetch profile!\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Authentication Test</h1>
          <p className="text-gray-600 mb-6">Test your backend authentication endpoints</p>

          {/* Tabs */}
          <div className="flex space-x-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('register')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'register'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Register
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'login'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile
            </button>
          </div>

          {/* Register Tab */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Registering...' : 'Register'}
              </button>
            </form>
          )}

          {/* Login Tab */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Current Token:</p>
                <p className="text-xs font-mono bg-white p-2 rounded border border-gray-200 break-all">
                  {token || 'No token yet. Please login first.'}
                </p>
              </div>
              <button
                onClick={handleGetProfile}
                disabled={status === 'loading' || !token}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Fetching...' : 'Get Profile'}
              </button>
            </div>
          )}

          {/* Response Message */}
          {message && (
            <div
              className={`mt-6 p-4 rounded-lg border ${
                status === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : status === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <pre className="whitespace-pre-wrap font-mono text-sm">{message}</pre>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">How to Test:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Register a new account with your email and password</li>
              <li>Copy the token from the response (or login again)</li>
              <li>Go to Profile tab and click "Get Profile" to test protected routes</li>
            </ol>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <a href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
