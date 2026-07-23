import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { DocumentIcon, ArrowDownTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function DocumentsTab({ caseId }) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [caseId]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/documents/case/${caseId}`);
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('case_id', caseId);
    formData.append('document_type', 'Other');

    setUploading(true);
    try {
      await api.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await fetchDocuments();
    } catch (error) {
      console.error('Failed to upload document:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('Delete this document?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      await fetchDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading documents...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-800">Case Documents</h3>
        <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-dha-blue-600 text-white rounded-lg hover:bg-dha-blue-700 transition">
          <span className="text-sm">{uploading ? 'Uploading...' : 'Upload Document'}</span>
          <input type="file" onChange={handleUpload} className="hidden" disabled={uploading} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
        </label>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <DocumentIcon className="w-12 h-12 mx-auto text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">No documents uploaded</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <DocumentIcon className="w-8 h-8 text-dha-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{doc.file_name}</p>
                  <p className="text-xs text-gray-400">{doc.document_type} • {doc.uploaded_by || 'Unknown'} • {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600"><ArrowDownTrayIcon className="w-4 h-4" /></button>
                {user?.role !== 'Auditor' && (
                  <button onClick={() => handleDelete(doc.id)} className="p-1 text-red-400 hover:text-red-600"><XMarkIcon className="w-4 h-4" /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}