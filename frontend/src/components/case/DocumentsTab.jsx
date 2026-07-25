import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { canWrite } from '../../utils/permissions';
import { DocumentIcon, ArrowUpTrayIcon, TrashIcon } from '@heroicons/react/24/outline';

const DOC_TYPES = ['Passport', 'Affidavit', 'Proof of Entry', 'Interview Notes', 'Other'];

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsTab({ caseId }) {
  const { user } = useAuth();
  const mayWrite = canWrite(user?.role);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, [caseId]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/documents/case/${caseId}`);
      setDocs(response.data || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('case_id', caseId);
    formData.append('document_type', docType);

    setUploading(true);
    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchDocuments();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Failed to upload document');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      window.alert('Failed to delete document.');
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading documents...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-medium text-gray-800">Documents ({docs.length})</h3>
        {mayWrite && (
          <div className="flex items-center gap-2">
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="border border-gray-300 rounded-lg text-sm px-2 py-1.5 focus:ring-2 focus:ring-dha-blue-500 outline-none"
            >
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 bg-dha-blue-600 hover:bg-dha-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50"
            >
              <ArrowUpTrayIcon className="w-4 h-4" /> {uploading ? 'Uploading…' : 'Upload'}
            </button>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />
          </div>
        )}
      </div>

      {docs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <DocumentIcon className="w-12 h-12 mx-auto" />
          <p className="mt-2 text-sm">No documents uploaded for this case</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
          {docs.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <div className="flex items-center gap-3 min-w-0">
                <DocumentIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{doc.file_name}</p>
                  <p className="text-xs text-gray-400">
                    {doc.document_type} · {formatSize(doc.file_size)} · uploaded by {doc.uploaded_by || 'Unknown'}
                    {doc.uploaded_at ? ` on ${new Date(doc.uploaded_at).toLocaleDateString()}` : ''}
                  </p>
                </div>
              </div>
              {mayWrite && (
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-gray-400 hover:text-red-600 flex-shrink-0"
                  aria-label="Delete document"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
