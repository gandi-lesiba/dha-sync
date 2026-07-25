import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserIcon, LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import api from '../api';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(username, password, rememberMe);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotSubmitting(true);
    setForgotMessage('');
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMessage('If an account exists for that email, a reset link has been sent.');
    } catch (err) {
      setForgotMessage('Something went wrong. Please try again.');
    } finally {
      setForgotSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dha-blue-50">
      <header className="flex h-[72px] items-center gap-3 bg-dha-blue px-6 text-white">
        <div className="flex h-9 w-9 items-center justify-center rounded bg-white text-xs font-bold text-dha-blue">
          DHA
        </div>
        <div className="leading-tight">
          <div className="text-base font-semibold">Case Management &amp; Deportation Workflow System</div>
          <div className="text-xs text-[#a9c1d8]">Department of Home Affairs — Internal Staff Portal</div>
        </div>
      </header>

      <div className="flex justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {showForgotPassword ? (
              <>
                <h2 className="text-xl font-semibold text-gray-800 text-center mb-1">Reset Password</h2>
                <p className="text-sm text-gray-500 text-center mb-6">
                  Enter your employee email and we'll send you a reset link.
                </p>

                {forgotMessage && (
                  <div className="mb-4 p-3 bg-dha-blue-50 border border-dha-blue-200 rounded-lg">
                    <p className="text-sm text-dha-blue-700">{forgotMessage}</p>
                  </div>
                )}

                <form onSubmit={handleForgotSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee Email</label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dha-blue-500 focus:border-transparent outline-none transition"
                        placeholder="officer@dha.gov.za"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="w-full bg-dha-blue-600 hover:bg-dha-blue-700 text-white font-medium py-2.5 rounded-lg transition shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {forgotSubmitting ? 'Sending…' : 'Send Reset Link'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotMessage('');
                    }}
                    className="w-full text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Back to sign in
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-800 text-center mb-1">Staff Sign In</h2>
                <p className="text-sm text-gray-500 text-center mb-6">Authorised personnel only</p>

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

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-gray-600">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-gray-300 text-dha-blue-600 focus:ring-dha-blue-500"
                      />
                      Keep me signed in
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-dha-blue-600 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-dha-blue-600 hover:bg-dha-blue-700 text-white font-medium py-2.5 rounded-lg transition shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                  <p className="text-xs text-gray-400">
                    Protected by JWT session · POPIA-compliant access log
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-400 text-center">Demo Credentials</p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <span className="text-gray-500">Admin: admin / Admin123!</span>
                    <span className="text-gray-500">Officer: officer1 / Officer123!</span>
                    <span className="text-gray-500">Supervisor: supervisor / Super123!</span>
                    <span className="text-gray-500">Auditor: auditor / Audit123!</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            v1.0 · Internal use only · Report issues to IT Service Desk
          </p>
        </div>
      </div>
    </div>
  );
}
