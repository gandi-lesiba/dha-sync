import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheckIcon, UserIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  console.log('🔐 Attempting login...');
  const result = await login(username, password);
  console.log('📦 Login result:', result);
  if (result.success) {
    console.log('✅ Login successful, navigating to dashboard');
    navigate('/dashboard');
  } else {
    console.log('❌ Login failed, error:', result.error);
    setError(result.error);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-dha-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-dha-blue-600 rounded-2xl shadow-lg">
            <ShieldCheckIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">DHA-Sync</h1>
          <p className="text-sm text-gray-500">Smart Immigration Case Management</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Staff Sign In</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dha-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dha-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-dha-blue-600 hover:bg-dha-blue-700 text-white font-medium py-2.5 rounded-lg transition shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <span className="text-gray-500">Admin: admin / Admin123!</span>
              <span className="text-gray-500">Officer: officer1 / Officer123!</span>
              <span className="text-gray-500">Supervisor: supervisor / Super123!</span>
              <span className="text-gray-500">Auditor: auditor / Audit123!</span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          This system is monitored for compliance with POPIA. All access is logged.
        </p>
      </div>
    </div>
  );
}