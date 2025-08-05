import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MonthSelector from './MonthSelector';
import { 
  Home, 
  Users, 
  Calendar, 
  BarChart3, 
  Building, 
  MapPin, 
  Clock, 
  DollarSign, 
  CreditCard,
  Gift,
  User, 
  ChevronDown,
  LogOut,
  X,
  Menu,
  Settings
} from 'lucide-react';

const Layout = () => {
  const { user, userProfile, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigation = [
    { name: userProfile?.role === 'leadership' ? 'Leadership Dashboard' : 'Dashboard', href: '/', icon: Home, role: 'viewer' },
    { name: 'Leadership Dashboard', href: '/leadership', icon: BarChart3, role: 'leadership' },
    { name: 'Employees', href: '/employees', icon: Users, role: 'admin' },
    { name: 'Daily Logs', href: '/daily-logs', icon: Calendar, role: 'admin' },
    { name: 'Monthly Summaries', href: '/monthly-summaries', icon: BarChart3, role: 'viewer' },
    { name: 'Sites', href: '/sites', icon: Building, role: 'admin' },
    { name: 'Work Sites', href: '/work-sites', icon: MapPin, role: 'viewer' },
    { name: 'My Timecard', href: '/timecard', icon: Clock, role: 'viewer' },
    { name: 'Salary Advances', href: '/salary-advances', icon: CreditCard, role: 'viewer' },
    { name: 'Allowances', href: '/allowances', icon: Gift, role: 'admin' },
  ];

  const filteredNavigation = navigation.filter(item => {
    // For leadership users, don't show the separate Leadership Dashboard link since they already have it as default
    if (userProfile?.role === 'leadership' && item.href === '/leadership') {
      return false;
    }
    
    const roleHierarchy = { viewer: 1, admin: 2, leadership: 3 };
    const userRoleLevel = roleHierarchy[userProfile?.role] || 1;
    const requiredRoleLevel = roleHierarchy[item.role] || 1;
    return userRoleLevel >= requiredRoleLevel;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`layout-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl font-semibold text-gray-900 tracking-tight">Interlock</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="sidebar-nav">
          <div className="space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}
                >
                  <item.icon size={18} className="mr-3 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer - Profile Section */}
        <div className="sidebar-footer">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                <User size={16} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userProfile?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 capitalize truncate">
                  {userProfile?.role || 'viewer'}
                </p>
              </div>
            </div>
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <ChevronDown size={16} className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {userMenuOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Account</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User size={16} className="mr-3 text-gray-400" />
                    Profile Settings
                  </Link>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <LogOut size={16} className="mr-3 text-gray-400" />
                      Sign out
                    </button>
                    <button
                      onClick={() => {
                        // Force clear all local storage and redirect
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.href = '/login';
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                    >
                      <LogOut size={16} className="mr-3" />
                      Force Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="layout-main flex flex-col">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="flex items-center space-x-3">
                <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
                  {location.pathname === '/' && userProfile?.role === 'leadership' 
                    ? 'Leadership Dashboard' 
                    : filteredNavigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
                </h1>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-500">
                  {userProfile?.role || 'viewer'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MonthSelector />
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="layout-content flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout; 