import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  ChartBarIcon,
  DocumentPlusIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { path: '/cases/new', icon: DocumentPlusIcon, label: 'New Case' },
    { path: '/deportation', icon: ArrowPathIcon, label: 'Deportation' },
    { path: '/reports', icon: ChartBarIcon, label: 'Reports' },
    { path: '/admin', icon: UserGroupIcon, label: 'Admin', role: 'Admin' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (item.role) {
      return user?.role === item.role || user?.role === 'Admin';
    }
    return true;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`bg-dha-blue-800 text-white transition-all duration-300 flex flex-col ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Brand */}
        <div className={`flex items-center h-16 px-4 border-b border-dha-blue-700 ${collapsed ? 'justify-center' : ''}`}>
          <ShieldCheckIcon className="w-8 h-8 text-white flex-shrink-0" />
          {!collapsed && (
            <span className="ml-2 text-lg font-semibold">DHA-Sync</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 transition ${
                      isActive
                        ? 'bg-dha-blue-700 border-r-4 border-white'
                        : 'hover:bg-dha-blue-700'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="ml-3 text-sm">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info */}
        <div className={`border-t border-dha-blue-700 p-4 ${collapsed ? 'text-center' : ''}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-dha-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium">
                {user?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            {!collapsed && (
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.full_name}</p>
                <p className="text-xs text-dha-blue-200 truncate">{user?.role}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="w-full mt-2 flex items-center justify-center px-3 py-2 text-sm text-dha-blue-200 hover:text-white hover:bg-dha-blue-700 rounded-lg transition"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
              Logout
            </button>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 border-t border-dha-blue-700 hover:bg-dha-blue-700 transition"
        >
          {collapsed ? (
            <ChevronRightIcon className="w-5 h-5 mx-auto" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5 mx-auto" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}