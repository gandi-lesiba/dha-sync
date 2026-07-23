import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Dashboard() {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await api.get('/cases/');
        setCases(response.data.cases || []);
      } catch (error) {
        console.error('Failed to fetch cases:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Tasks</h1>
      <p className="text-sm text-gray-500 mb-6">Welcome back, {user?.full_name} ({user?.role})</p>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dha-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <p className="text-gray-500">Total Cases: {cases.length}</p>
            <div className="mt-4 space-y-2">
              {cases.slice(0, 5).map((caseItem) => (
                <div key={caseItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{caseItem.case_number}</span>
                  <span className="text-sm text-gray-600">{caseItem.applicant_full_name}</span>
                  <span className={`status-badge status-${caseItem.status?.toLowerCase().replace(' ', '-') || 'pending'}`}>
                    {caseItem.status || 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}