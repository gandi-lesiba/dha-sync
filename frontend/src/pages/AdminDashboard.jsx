import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  UsersIcon,
  ServerIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  UserPlusIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState({
    apiUptime: 99.96,
    activeUsers: 0,
    failedLogins: 0,
    storageUsed: 41,
  });
  const [activityFeed, setActivityFeed] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes, auditRes] = await Promise.all([
        api.get('/users'),
        api.get('/dashboard/stats'),
        api.get('/audit?limit=10'),
      ]);
      const users = usersRes.data;
      setSystemHealth({
        apiUptime: 99.96,
        activeUsers: users.filter(u => u.is_active).length,
        failedLogins: 3,
        storageUsed: 41,
      });
      setStats(statsRes.data);

      // Format activity feed
      const activities = (auditRes.data || []).slice(0, 6).map((a) => ({
        user: a.username || 'Unknown',
        action: a.action.replace(/_/g, ' '),
        target: a.case_number || '',
        time: a.timestamp ? new Date(a.timestamp).toLocaleString() : '',
      }));
      setActivityFeed(activities);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const healthCards = [
    { label: 'API uptime (30d)', value: `${systemHealth.apiUptime}%`, icon: ServerIcon, color: 'text-green-600' },
    { label: 'Active users', value: systemHealth.activeUsers, icon: UsersIcon, color: 'text-dha-blue-600' },
    { label: 'Failed logins (24h)', value: systemHealth.failedLogins, icon: ExclamationTriangleIcon, color: 'text-red-600' },
    { label: 'CDB storage used', value: `${systemHealth.storageUsed}%`, icon: ServerIcon, color: 'text-orange-600' },
  ];

  const shortcuts = [
    { icon: UsersIcon, label: 'Manage Users & Roles', color: 'bg-blue-100 text-blue-600', to: '/users' },
    { icon: BuildingOfficeIcon, label: 'Detention Centre Registry', color: 'bg-purple-100 text-purple-600', to: '/settings' },
    { icon: DocumentArrowDownIcon, label: 'Notification Templates', color: 'bg-green-100 text-green-600', to: '/settings' },
    { icon: Cog6ToothIcon, label: 'Audit Log Export', color: 'bg-gray-100 text-gray-600', to: '/audit' },
  ];

  // System health statuses
  const systemStatuses = [
    { name: 'API', status: 'OK' },
    { name: 'Database', status: 'OK' },
    { name: 'Notification Gateway', status: 'OK' },
    { name: 'Document Storage', status: 'DEGRADED' },
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
        <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
        <p className="text-sm text-gray-500">Health, user activity, and configuration shortcuts</p>
      </div>

      {/* Health Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {healthCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gray-50 ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Recent User Activity</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activityFeed.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-4 py-4 text-sm text-gray-400 text-center">No recent activity</td>
                  </tr>
                ) : (
                  activityFeed.map((activity, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-medium text-gray-800">{activity.user}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {activity.action}
                        {activity.target && <span className="text-dha-blue-600"> {activity.target}</span>}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-400">{activity.time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Configuration Shortcuts */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-4">Configuration Shortcuts</h3>
            <div className="space-y-3">
              {shortcuts.map((shortcut, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(shortcut.to)}
                  className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100"
                >
                  <div className={`p-2 rounded-lg ${shortcut.color}`}>
                    <shortcut.icon className="w-5 h-5" />
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700">{shortcut.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">System Health</h3>
            <div className="space-y-2">
              {systemStatuses.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700">{item.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    item.status === 'OK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}