'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function TestConnectionPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const testConnection = async () => {
    setStatus('loading');
    setMessage('Testing connection...');

    try {
      const response = await api.health();
      setStatus('success');
      setMessage(`✅ Connected! Backend is running!\n\nResponse: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      setStatus('error');
      setMessage(`❌ Connection failed!\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Backend Connection Test</h1>
        <p className="text-gray-600 mb-6">Test the connection between frontend and backend</p>

        <div className="space-y-4">
          <button
            onClick={testConnection}
            disabled={status === 'loading'}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Testing...' : 'Test Backend Connection'}
          </button>

          {message && (
            <div
              className={`p-4 rounded-lg border ${
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

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="font-semibold text-gray-800 mb-2">Expected Result:</h2>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Backend running on http://localhost:5000</li>
              <li>✓ Frontend running on http://localhost:3000</li>
              <li>✓ CORS enabled for cross-origin requests</li>
              <li>✓ API endpoint: GET /api/health</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
