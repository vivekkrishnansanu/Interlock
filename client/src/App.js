import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, MonthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LeadershipDashboard from './pages/LeadershipDashboard';
import Employees from './pages/Employees';
import DailyLogs from './pages/DailyLogs';
import MonthlySummaries from './pages/MonthlySummaries';
import Sites from './pages/Sites';
import WorkSites from './pages/WorkSites';
import Timecard from './pages/Timecard';
import SalaryAdvances from './pages/SalaryAdvances';
import Allowances from './pages/Allowances';
import Profile from './pages/Profile';
import { Toaster } from 'react-hot-toast';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = 'viewer' }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access control
  const roleHierarchy = { viewer: 1, admin: 2, leadership: 3 };
  const userRoleLevel = roleHierarchy[user.role] || 1;
  const requiredRoleLevel = roleHierarchy[requiredRole] || 1;

  if (userRoleLevel < requiredRoleLevel) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Role-based Dashboard Component
const RoleBasedDashboard = () => {
  const { user } = useAuth();
  
  // Leadership users see leadership dashboard by default
  if (user?.role === 'leadership') {
    return <LeadershipDashboard />;
  }
  
  // Admin and viewer users see normal dashboard
  return <Dashboard />;
};

// App Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><RoleBasedDashboard /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/leadership" element={<ProtectedRoute requiredRole="admin"><LeadershipDashboard /></ProtectedRoute>} />
      <Route path="/employees" element={<ProtectedRoute requiredRole="admin"><Employees /></ProtectedRoute>} />
      <Route path="/daily-logs" element={<ProtectedRoute requiredRole="admin"><DailyLogs /></ProtectedRoute>} />
      <Route path="/monthly-summaries" element={<ProtectedRoute><MonthlySummaries /></ProtectedRoute>} />
      <Route path="/sites" element={<ProtectedRoute requiredRole="admin"><Sites /></ProtectedRoute>} />
      <Route path="/work-sites" element={<ProtectedRoute><WorkSites /></ProtectedRoute>} />
      <Route path="/timecard" element={<ProtectedRoute><Timecard /></ProtectedRoute>} />
      <Route path="/salary-advances" element={<ProtectedRoute><SalaryAdvances /></ProtectedRoute>} />
      <Route path="/allowances" element={<ProtectedRoute><Allowances /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    </Routes>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <MonthProvider>
        <AppRoutes />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </MonthProvider>
    </AuthProvider>
  );
};

export default App; 