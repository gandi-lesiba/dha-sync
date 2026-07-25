import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

const STATUS_COLORS = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Under Review': 'bg-blue-100 text-blue-800',
  'Approved': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800',
  'Appeals': 'bg-purple-100 text-purple-800',
  'Interview Scheduled': 'bg-indigo-100 text-indigo-800',
};

const STATUS_OPTIONS = ['Pending', 'Under Review', 'Interview Scheduled', 'Appeals', 'Approved', 'Rejected'];

export default function CasesList() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, per_page: 15 };
      if (search) params.search = search;
      if (status) params.status = status;
      const response = await api.get('/cases/', { params });
      setCases(response.data.cases || []);
      setPages(response.data.pages || 1);
      setTotal(response.data.total || 0);
    } catch (err) {
      setError('Failed to load cases.');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timeout = setTimeout(fetchCases, 300);
    return () => clearTimeout(timeout);
  }, [fetchCases]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Cases</h1>
          <p className="text-gray-600 mt-1">{total} case{total === 1 ? '' : 's'} in view</p>
        </div>
        <Link
          to="/cases/new"
          className="inline-flex items-center gap-1.5 bg-dha-blue-600 hover:bg-dha-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-md transition"
        >
          <PlusIcon className="w-4 h-4" /> Register New Case
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            placeholder="Search case number, name, passport, nationality..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dha-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setPage(1); setStatus(e.target.value); }}
          className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-dha-blue-500 outline-none"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Case #</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Officer</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="px-4 py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-dha-blue-600"></div>
                </td></tr>
              ) : error ? (
                <tr><td colSpan="7" className="px-4 py-6 text-center text-red-600 text-sm">{error}</td></tr>
              ) : cases.length === 0 ? (
                <tr><td colSpan="7" className="px-4 py-12 text-center text-gray-400 text-sm">No cases found.</td></tr>
              ) : (
                cases.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.case_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{c.applicant_full_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{c.case_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{c.priority}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{c.assigned_officer_name || 'Unassigned'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-800'}`}>
                        {c.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/cases/${c.id}`} className="text-sm text-dha-blue-600 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-sm text-gray-600 disabled:text-gray-300 hover:text-dha-blue-600"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {pages}</span>
            <button
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              className="text-sm text-gray-600 disabled:text-gray-300 hover:text-dha-blue-600"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
