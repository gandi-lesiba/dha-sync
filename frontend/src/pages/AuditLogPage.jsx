import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [actions, setActions] = useState([]);
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 100 };
      if (actionFilter) params.action = actionFilter;
      const response = await api.get('/audit/', { params });
      setLogs(response.data || []);
    } catch (err) {
      setError('Failed to load audit log.');
    } finally {
      setLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => {
    api.get('/audit/actions').then((res) => setActions(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-gray-600 mt-1">Immutable log of every state-changing action</p>
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-dha-blue-500 outline-none"
        >
          <option value="">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Case</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="px-4 py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-dha-blue-600"></div>
                </td></tr>
              ) : error ? (
                <tr><td colSpan="6" className="px-4 py-6 text-center text-red-600 text-sm">{error}</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-12 text-center text-gray-400 text-sm">No audit entries found.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 align-top">
                    <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{log.username || 'System'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-dha-blue-50 text-dha-blue-700">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {log.case_number ? (
                        <Link to={`/cases/${log.case_id}`} className="text-dha-blue-600 hover:underline">
                          {log.case_number}
                        </Link>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate" title={log.new_value || ''}>
                      {log.new_value || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{log.ip_address || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
