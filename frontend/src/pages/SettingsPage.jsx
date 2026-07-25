import React from 'react';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  ClipboardDocumentListIcon,
  BuildingOfficeIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';

const SHORTCUTS = [
  {
    icon: UsersIcon,
    label: 'Manage Users & Roles',
    description: 'Change roles, deactivate or remove staff accounts',
    to: '/users',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: ClipboardDocumentListIcon,
    label: 'Audit Log Export',
    description: 'Review and export the full compliance audit trail',
    to: '/audit',
    color: 'bg-gray-100 text-gray-600',
  },
  {
    icon: BuildingOfficeIcon,
    label: 'Detention Centre Registry',
    description: 'Manage facilities and capacity thresholds',
    to: null,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: BellAlertIcon,
    label: 'Notification Templates',
    description: 'Edit email/SMS templates for case notifications',
    to: null,
    color: 'bg-green-100 text-green-600',
  },
];

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">System configuration shortcuts</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SHORTCUTS.map((s) => {
          const content = (
            <div
              className={`h-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-start gap-3 transition ${
                s.to ? 'hover:shadow-md hover:border-dha-blue-200' : 'opacity-60 cursor-not-allowed'
              }`}
            >
              <div className={`p-2.5 rounded-lg ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{s.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
                {!s.to && <p className="text-xs text-gray-400 mt-1 italic">Coming soon</p>}
              </div>
            </div>
          );
          return s.to ? (
            <Link key={s.label} to={s.to}>{content}</Link>
          ) : (
            <div key={s.label}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
