import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { canWrite } from '../utils/permissions';
import { DocumentIcon, TrashIcon } from '@heroicons/react/24/outline';

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsList() {
  const { user } = useAuth();
  const mayWrite = canWrite(user?.role);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/documents/');
      setDocs(response.data || []);
    } catch (err) {
      setError('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/documents/${id}`);
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      window.alert('Failed to delete document.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-600 mt-1">Files uploaded across your cases</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Case</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Uploaded By</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Uploaded At</th>
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
              ) : docs.length === 0 ? (
                <tr><td colSpan="7" className="px-4 py-12 text-center text-gray-400 text-sm">No documents uploaded yet.</td></tr>
              ) : (
                docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <div className="flex items-center gap-2">
                        <DocumentIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate max-w-xs">{doc.file_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link to={`/cases/${doc.case_id}`} className="text-dha-blue-600 hover:underline">
                        {doc.case_number}
                      </Link>
                      <div className="text-xs text-gray-400">{doc.applicant_full_name}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{doc.document_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatSize(doc.file_size)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{doc.uploaded_by || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {mayWrite && (
                        <button
                          onClick={() => handleDelete(doc.id)}
                          disabled={deletingId === doc.id}
                          className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                          aria-label="Delete document"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </td>
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
