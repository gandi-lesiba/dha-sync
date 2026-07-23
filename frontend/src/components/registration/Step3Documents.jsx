import React, { useRef } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

const DOCUMENT_TYPES = [
  'Passport',
  'Visa',
  'Birth Certificate',
  'Photograph',
  'Police Clearance',
  'Medical Certificate',
  'Other'
];

export default function Step3Documents({ data, updateData }) {
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newDocuments = files.map((file) => ({
      file,
      name: file.name,
      type: 'Other',
      size: (file.size / 1024).toFixed(1) + ' KB',
    }));
    updateData({ documents: [...data.documents, ...newDocuments] });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeDocument = (index) => {
    const newDocs = [...data.documents];
    newDocs.splice(index, 1);
    updateData({ documents: newDocs });
  };

  const updateDocumentType = (index, type) => {
    const newDocs = [...data.documents];
    newDocs[index].type = type;
    updateData({ documents: newDocs });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">Supporting Documents</h2>
      <p className="text-sm text-gray-500">
        Upload supporting documents. Accepted: PDF, JPG, PNG, DOC (Max 10MB each)
      </p>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-dha-blue-400 transition"
      >
        <PhotoIcon className="w-12 h-12 mx-auto text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">Click or drag files here to upload</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
      </div>

      {data.documents.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Uploaded Documents</h3>
          {data.documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <PhotoIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">{doc.name}</p>
                  <p className="text-xs text-gray-400">{doc.size}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={doc.type}
                  onChange={(e) => updateDocumentType(index, e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-dha-blue-500 outline-none"
                >
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <button
                  onClick={() => removeDocument(index)}
                  className="p-1 text-red-400 hover:text-red-600 transition"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}