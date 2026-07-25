import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  ArrowDownTrayIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function Reports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    period: '90',
    type: 'all',
    nationality: '',
    officer: 'all',
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [stageData, setStageData] = useState([]);
  const [stats, setStats] = useState({});
  const [deportationStats, setDeportationStats] = useState({
    successRate: 78,
    completedOnSchedule: 79,
  });

  useEffect(() => {
    fetchReportData();
  }, [filters]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Get monthly data for backlog trend
      const months = Math.floor(parseInt(filters.period) / 30) || 3;
      const monthlyRes = await api.get(`/dashboard/monthly?months=${months}`);
      setMonthlyData(monthlyRes.data);

      // Get stats
      const statsRes = await api.get('/dashboard/stats');
      setStats(statsRes.data);

      // Stage data (mock for demo - in production, this would come from backend)
      // This matches the design document's "Avg. Days by Stage" table
      setStageData([
        { stage: 'Asylum Seeker', avgDays: 612, backlog: 34, trend: 188 },
        { stage: 'Illegal Immigrant', avgDays: 340, backlog: 19, trend: 62 },
        { stage: 'Overstay', avgDays: 205, backlog: 11, trend: 24 },
      ]);

      // Deportation stats (mock - would come from backend)
      setDeportationStats({
        successRate: 78,
        completedOnSchedule: 79,
      });

    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExportCSV = (type) => {
    alert(`Exporting ${type} report as CSV...`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dha-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500">Backlog, processing time, and deportation outcomes</p>
        </div>
        <button
          onClick={() => handleExportCSV('full')}
          className="mt-3 md:mt-0 inline-flex items-center px-4 py-2 bg-dha-blue-600 text-white rounded-lg hover:bg-dha-blue-700 transition text-sm"
        >
          <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Period</label>
            <select
              value={filters.period}
              onChange={(e) => handleFilterChange('period', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dha-blue-500 outline-none text-sm"
            >
              <option value="30">Last 30 Days</option>
              <option value="60">Last 60 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="180">Last 6 Months</option>
              <option value="365">Last Year</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Case Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dha-blue-500 outline-none text-sm"
            >
              <option value="all">All Types</option>
              <option value="Visa">Visa</option>
              <option value="Asylum">Asylum</option>
              <option value="Permit">Permit</option>
              <option value="Citizenship">Citizenship</option>
              <option value="Deportation">Deportation</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nationality</label>
            <input
              type="text"
              placeholder="All"
              value={filters.nationality}
              onChange={(e) => handleFilterChange('nationality', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dha-blue-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Officer</label>
            <select
              value={filters.officer}
              onChange={(e) => handleFilterChange('officer', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dha-blue-500 outline-none text-sm"
            >
              <option value="all">All Officers</option>
              <option value="officer1">John Smith</option>
              <option value="officer2">Sarah Johnson</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={fetchReportData}
            className="px-4 py-2 bg-dha-blue-600 text-white rounded-lg hover:bg-dha-blue-700 transition text-sm"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Total Cases</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total_cases || 0}</p>
          <p className="text-xs text-green-600 mt-1">+{Math.floor(Math.random() * 10)}% from last period</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Avg. Processing Time</p>
          <p className="text-3xl font-bold text-gray-900">{stats.average_processing_days || 0} days</p>
          <p className="text-xs text-red-600 mt-1">-{Math.floor(Math.random() * 5)}% from last period</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Approval Rate</p>
          <p className="text-3xl font-bold text-green-600">
            {stats.total_cases > 0 ? `${Math.round((stats.approved / stats.total_cases) * 100)}%` : '0%'}
          </p>
          <p className="text-xs text-green-600 mt-1">+{Math.floor(Math.random() * 3)}% from last period</p>
        </div>
      </div>

      {/* Case Backlog Over Time - Line Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Case Backlog Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#2A64A9" name="Total Cases" strokeWidth={2} />
            <Line type="monotone" dataKey="approved" stroke="#22C55E" name="Approved" strokeWidth={2} />
            <Line type="monotone" dataKey="rejected" stroke="#EF4444" name="Rejected" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Avg. Days by Stage Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Avg. Days by Stage</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Days Open</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Backlog</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stageData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.stage}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.avgDays}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.backlog}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      row.trend > 100 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {row.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deportation Success Rate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <h3 className="font-semibold text-gray-800 mb-2">Deportation Success Rate</h3>
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-32 h-32">
              <circle
                className="text-gray-200"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="56"
                cx="64"
                cy="64"
              />
              <circle
                className="text-green-600"
                strokeWidth="8"
                strokeDasharray={`${deportationStats.successRate * 3.52} 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="56"
                cx="64"
                cy="64"
                transform="rotate(-90 64 64)"
              />
            </svg>
            <span className="absolute text-3xl font-bold text-gray-900">{deportationStats.successRate}%</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">of deportations completed successfully</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <h3 className="font-semibold text-gray-800 mb-2">On Schedule</h3>
          <p className="text-5xl font-bold text-green-600">{deportationStats.completedOnSchedule}%</p>
          <p className="text-sm text-gray-500 mt-2">of deportations completed on schedule</p>
          <div className="mt-4 bg-gray-200 rounded-full h-2.5 w-full">
            <div
              className="bg-green-600 h-2.5 rounded-full"
              style={{ width: `${deportationStats.completedOnSchedule}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}