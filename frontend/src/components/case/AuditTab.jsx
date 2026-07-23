import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function AuditTab({ caseId }) {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, [caseId]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/audit/case/${caseId}`);
      setAuditLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading audit trail...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-800">Audit Trail</h3>
        <span className="text-xs text-gray-400">{auditLogs.length} records</span>
      </div>
      {auditLogs.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><p className="text-sm">No audit records found</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Old Value</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">New Value</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log, index) => (
                <tr key={log.id || index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-800">{log.username || 'System'}</td>
                  <td className="px-4 py-2 text-sm"><span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">{log.action}</span></td>
                  <td className="px-4 py-2 text-xs text-gray-500 max-w-xs truncate">{log.old_value || '-'}</td>
                  <td className="px-4 py-2 text-xs text-gray-500 max-w-xs truncate">{log.new_value || '-'}</td>
                  <td className="px-4 py-2 text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}