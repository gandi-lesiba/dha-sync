import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
// Assuming you're using Heroicons. Replace with your actual icon imports.
import { EyeIcon, PencilIcon } from '@heroicons/react/24/outline'; 

export default function Dashboard() {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchCases = async () => {
      try {
        setError(null);
        const response = await api.get('/cases/', { signal: abortController.signal });
        setCases(response.data.cases || []);
      } catch (err) {
        if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED') {
          setError('Failed to load cases.');
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
    return () => abortController.abort();
  }, []);

  const total = cases.length;
  const pending = cases.filter(c => c.status?.toLowerCase() === 'pending').length;
  const completed = cases.filter(c => c.status?.toLowerCase() === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, <span className="font-medium">{user?.full_name}</span> ({user?.role})
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total Cases</h3>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="text-2xl md:text-3xl font-bold text-yellow-600 mt-2">{pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Completed</h3>
            <p className="text-2xl md:text-3xl font-bold text-green-600 mt-2">{completed}</p>
          </div>
        </div>

        {/* Cases List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Recent Cases</h2>
            {total > 5 && (
              <a href="/cases" className="text-sm text-blue-600 hover:underline flex-shrink-0">
                View all {total} →
              </a>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-red-600">{error}</div>
          ) : cases.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No cases assigned.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {cases.slice(0, 5).map((caseItem) => (
                <li key={caseItem.id} className="px-4 md:px-6 py-4 hover:bg-gray-50 transition-colors">
                  {/* The secret to a stable layout: flex-wrap on parent, shrink-0 on the action group */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Left: Case info - use min-w-0 to prevent overflow */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{caseItem.case_number}</p>
                      <p className="text-sm text-gray-500 truncate">{caseItem.applicant_full_name}</p>
                    </div>

                    {/* Right: Status + Action Icons - use flex-shrink-0 to keep them from squishing */}
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      {/* Status Badge */}
                      <span className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                        caseItem.status?.toLowerCase() === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : caseItem.status?.toLowerCase() === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {caseItem.status || 'Pending'}
                      </span>

                      {/* VIEW Icon Button (links to detail page) */}
                      <a
                        href={`/cases/${caseItem.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                        aria-label="View case"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </a>

                      {/* EDIT Icon Button (links to edit page) */}
                      <a
                        href={`/cases/${caseItem.id}/edit`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
                        aria-label="Edit case"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}