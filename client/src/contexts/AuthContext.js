import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Create separate contexts for Auth and Month
const AuthContext = createContext();
const MonthContext = createContext();

// Custom hook for auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Custom hook for month selection
export const useMonth = () => {
  const context = useContext(MonthContext);
  if (!context) {
    throw new Error('useMonth must be used within a MonthProvider');
  }
  return context;
};

// Month Provider Component
export const MonthProvider = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return {
      month: now.getMonth() + 1, // 1-12
      year: now.getFullYear()
    };
  });

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return {
      month: now.getMonth() + 1,
      year: now.getFullYear()
    };
  });

  const changeMonth = (month, year) => {
    setSelectedMonth({ month, year });
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(currentMonth);
  };

  const goToPreviousMonth = () => {
    const prevMonth = selectedMonth.month === 1 ? 12 : selectedMonth.month - 1;
    const prevYear = selectedMonth.month === 1 ? selectedMonth.year - 1 : selectedMonth.year;
    setSelectedMonth({ month: prevMonth, year: prevYear });
  };

  const goToNextMonth = () => {
    const nextMonth = selectedMonth.month === 12 ? 1 : selectedMonth.month + 1;
    const nextYear = selectedMonth.month === 12 ? selectedMonth.year + 1 : selectedMonth.year;
    setSelectedMonth({ month: nextMonth, year: nextYear });
  };

  const isCurrentMonth = selectedMonth.month === currentMonth.month && selectedMonth.year === currentMonth.year;

  const getMonthName = (month, year) => {
    return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getSelectedMonthName = () => getMonthName(selectedMonth.month, selectedMonth.year);
  const getCurrentMonthName = () => getMonthName(currentMonth.month, currentMonth.year);

  const value = {
    selectedMonth,
    currentMonth,
    changeMonth,
    goToCurrentMonth,
    goToPreviousMonth,
    goToNextMonth,
    isCurrentMonth,
    getSelectedMonthName,
    getCurrentMonthName
  };

  return (
    <MonthContext.Provider value={value}>
      {children}
    </MonthContext.Provider>
  );
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Check for demo user first
      const demoUser = localStorage.getItem('demo_user');
      if (demoUser) {
        const userData = JSON.parse(demoUser);
        setUser(userData);
        setToken('demo-token');
        setLoading(false);
        return;
      }

      if (token) {
        try {
          const response = await axios.get('/api/auth/profile');
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    // Demo mode authentication
    const demoUsers = {
      'admin@interlock.com': { id: 'demo-admin', name: 'Admin User', role: 'admin' },
      'viewer@interlock.com': { id: 'demo-viewer', name: 'Viewer User', role: 'viewer' },
      'leadership@interlock.com': { id: 'demo-leadership', name: 'Leadership User', role: 'leadership' }
    };

    // Check if it's a demo user
    if (demoUsers[email]) {
      const userData = demoUsers[email];
      const demoToken = 'demo-token-' + userData.role;
      
      setToken(demoToken);
      setUser(userData);
      localStorage.setItem('token', demoToken);
      localStorage.setItem('demo_user', JSON.stringify(userData));
      
      toast.success('Demo login successful!');
      return { success: true };
    }

    // Try API login if not demo user
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('demo_user');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      toast.success('User created successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/auth/profile', profileData);
      setUser(prev => ({ ...prev, ...profileData }));
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.post('/api/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Password change failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isViewer: user?.role === 'viewer' || user?.role === 'admin',
    isLeadership: user?.role === 'leadership'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 