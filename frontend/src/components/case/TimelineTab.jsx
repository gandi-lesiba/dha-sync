import React, { useState, useEffect } from 'react';
import api from '../../api';
import { ClockIcon, CheckCircleIcon, XCircleIcon, DocumentIcon } from '@heroicons/react/24/outline';

export default function TimelineTab({ caseId }) {
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

  const getStatusColor = (action) => {
    if (action.includes('CREATE')) return 'bg-blue-500';
    if (action.includes('UPDATE') || action.includes('CHANGE')) return 'bg-yellow-500';
    if (action.includes('APPROVE')) return 'bg-green-500';
    if (action.includes('REJECT')) return 'bg-red-500';
    if (action.includes('UPLOAD')) return 'bg-purple-500';
    return 'bg-gray-500';
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading timeline...</div>;

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-800">Workflow Timeline</h3>
      {auditLogs.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><ClockIcon className="w-12 h-12 mx-auto" /><p className="mt-2 text-sm">No activity recorded</p></div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          {auditLogs.map((log, index) => (
            <div key={log.id || index} className="relative pl-12 pb-6 last:pb-0">
              <div className={`absolute left-0 mt-1.5 w-8 h-8 rounded-full ${getStatusColor(log.action)} flex items-center justify-center text-white text-xs`}>
                {log.action.charAt(0)}
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">{log.username || 'System'} • {new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                  {log.old_value && log.new_value && (
                    <span className="text-xs text-gray-400">{log.old_value} → {log.new_value}</span>
                  )}
                </div>
                {log.ip_address && <p className="text-xs text-gray-400 mt-1">IP: {log.ip_address}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}