import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LeadershipDashboard from './pages/LeadershipDashboard';
import Employees from './pages/Employees';
import Sites from './pages/Sites';
import DailyLogs from './pages/DailyLogs';
import MonthlySummaries from './pages/MonthlySummaries';
import SalaryAdvances from './pages/SalaryAdvances';
import Allowances from './pages/Allowances';
import Timecard from './pages/Timecard';
import WorkSites from './pages/WorkSites';
import Profile from './pages/Profile';

import Settings from './pages/Settings';
import { useAuth } from './contexts/AuthContext';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { userProfile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Force new deployment - remove API calls
function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<RoleBasedDashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leadership" element={<LeadershipDashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="sites" element={<Sites />} />
            <Route path="daily-logs" element={<DailyLogs />} />
            <Route path="monthly-summaries" element={<MonthlySummaries />} />
            <Route path="salary-advances" element={<SalaryAdvances />} />
            <Route path="allowances" element={<Allowances />} />
            <Route path="timecard" element={<Timecard />} />
            <Route path="work-sites" element={<WorkSites />} />
            <Route path="profile" element={<Profile />} />

            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
}

// Role-based dashboard routing
function RoleBasedDashboard() {
  const { userProfile, isLeadership, loading } = useAuth();
  
  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }
  
  // Leadership users default to Leadership Dashboard
  if (isLeadership) {
    return <Navigate to="/leadership" replace />;
  }
  
  // Admin and viewer users default to Normal Dashboard
  return <Navigate to="/dashboard" replace />;
}

export default App; 