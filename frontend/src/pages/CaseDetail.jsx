import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  ClockIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';

// Tab components
import OverviewTab from '../components/case/OverviewTab';
import DocumentsTab from '../components/case/DocumentsTab';
import TimelineTab from '../components/case/TimelineTab';
import AuditTab from '../components/case/AuditTab';

const tabs = [
  { id: 'overview', label: 'Overview', icon: DocumentTextIcon },
  { id: 'documents', label: 'Documents', icon: UserCircleIcon },
  { id: 'timeline', label: 'Workflow Timeline', icon: ClockIcon },
  { id: 'audit', label: 'Audit Trail', icon: ChatBubbleLeftRightIcon },
];

const statusColors = {
  'Pending': 'status-pending',
  'Under Review': 'status-under-review',
  'Approved': 'status-approved',
  'Rejected': 'status-rejected',
  'Appeals': 'status-appeals',
  'Interview Scheduled': 'status-interview-scheduled',
};

export default function CaseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [caseData, setCaseData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');

  useEffect(() => {
    fetchCase();
  }, [id]);

  const fetchCase = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/cases/${id}`);
      setCaseData(response.data);
    } catch (error) {
      console.error('Failed to fetch case:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdate) return;
    try {
      await api.put(`/cases/${id}`, { status: statusUpdate });
      setShowStatusUpdate(false);
      setStatusUpdate('');
      fetchCase();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dha-blue-600"></div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Case not found</p>
        <Link to="/dashboard" className="text-dha-blue-600 hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab caseData={caseData} onUpdate={fetchCase} />;
      case 'documents':
        return <DocumentsTab caseId={id} />;
      case 'timeline':
        return <TimelineTab caseId={id} />;
      case 'audit':
        return <AuditTab caseId={id} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeftIcon className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Link>

      {/* Case Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">{caseData.case_number}</h1>
              <span className={`status-badge ${statusColors[caseData.status] || 'bg-gray-100 text-gray-800'}`}>
                {caseData.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {caseData.case_type} • {caseData.applicant_full_name} • {caseData.nationality}
            </p>
          </div>
          <div className="mt-3 md:mt-0 flex items-center space-x-2">
            <button
              onClick={() => setShowStatusUpdate(!showStatusUpdate)}
              className="inline-flex items-center px-3 py-2 text-sm bg-dha-blue-600 text-white rounded-lg hover:bg-dha-blue-700 transition"
            >
              <PencilSquareIcon className="w-4 h-4 mr-1" />
              Update Status
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-400">Officer</p>
            <p className="text-sm font-medium">{caseData.assigned_officer_name || 'Unassigned'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Priority</p>
            <p className="text-sm font-medium">{caseData.priority}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Created</p>
            <p className="text-sm font-medium">{new Date(caseData.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Deadline</p>
            <p className="text-sm font-medium">
              {caseData.statutory_deadline ? new Date(caseData.statutory_deadline).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Status Update Panel */}
      {showStatusUpdate && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-800">Update Case Status</h3>
            <button onClick={() => setShowStatusUpdate(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
            <select
              value={statusUpdate}
              onChange={(e) => setStatusUpdate(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dha-blue-500 outline-none"
            >
              <option value="">Select status...</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Appeals">Appeals</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={!statusUpdate}
              className="px-4 py-2 bg-dha-blue-600 text-white rounded-lg hover:bg-dha-blue-700 disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-dha-blue-600 text-dha-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}