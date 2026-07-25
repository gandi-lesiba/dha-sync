import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  UserGroupIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [officerWorkload, setOfficerWorkload] = useState([]);
  const [bottlenecks, setBottlenecks] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, productivityRes, overdueRes, pendingRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/officer-productivity'),
        api.get('/dashboard/overdue'),
        api.get('/cases?status=Pending&per_page=10'),
      ]);

      setStats(statsRes.data);

      // Map officer productivity to workload data
      setOfficerWorkload(productivityRes.data.slice(0, 6));

      // Format bottlenecks from overdue cases
      setBottlenecks(
        (overdueRes.data || []).slice(0, 3).map((c, i) => ({
          id: c.id,
          caseNumber: c.case_number,
          issue: getBottleneckIssue(c.status, c.days_overdue),
          days: c.days_overdue || 0,
        }))
      );

      // Format pending approvals
      setPendingApprovals(
        (pendingRes.data.cases || []).slice(0, 3).map((c) => ({
          id: c.id,
          caseNumber: c.case_number,
          type: c.case_type,
          action: c.action || 'Approve',
        }))
      );
    } catch (error) {
      console.error('Failed to fetch supervisor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBottleneckIssue = (status, days) => {
    if (days > 30) return 'stuck — reassign or escalate';
    if (days > 15) return 'pending review';
    return 'awaiting action';
  };

  const summaryCards = [
    { label: 'Open cases', value: stats.total_cases || 0, icon: UserGroupIcon, color: 'text-dha-blue-600' },
    { label: 'Avg. days in stage', value: stats.average_processing_days || 0, icon: ClockIcon, color: 'text-green-600' },
    { label: 'Cases stuck > 30 days', value: stats.overdue_cases || 0, icon: ExclamationTriangleIcon, color: 'text-red-600' },
    { label: 'Approvals pending', value: pendingApprovals.length, icon: CheckCircleIcon, color: 'text-yellow-600' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dha-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team Overview</h1>
        <p className="text-sm text-gray-500">Workload distribution and bottleneck alerts across your team</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workload by Case Officer */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Workload by Case Officer</h3>
          {officerWorkload.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No data available</p>
          ) : (
            <div className="space-y-3">
              {officerWorkload.map((officer) => (
                <div key={officer.officer_id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{officer.full_name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-dha-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min((officer.total_cases / 50) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{officer.total_cases}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottleneck Alerts */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Bottleneck Alerts</h3>
          {bottlenecks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No bottlenecks detected</p>
          ) : (
            <div className="space-y-4">
              {bottlenecks.map((alert, idx) => (
                <div key={idx} className="border-l-4 border-red-500 pl-3">
                  <p className="text-sm font-medium text-gray-800">{alert.caseNumber} stuck in Document Review</p>
                  <p className="text-xs text-red-600">{alert.days} days — {alert.issue}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Approvals */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Pending Approvals</h3>
          {pendingApprovals.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No pending approvals</p>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map((approval, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{approval.caseNumber}</p>
                    <p className="text-xs text-gray-500">{approval.type}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition">
                      Approve
                    </button>
                    <button className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}