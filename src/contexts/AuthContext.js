import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useMonth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useMonth must be used within a MonthProvider');
  }
  return context;
};

export const MonthProvider = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  });

  const currentMonth = { month: new Date().getMonth() + 1, year: new Date().getFullYear() };

  const changeMonth = (month, year) => {
    setSelectedMonth({ month, year });
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(currentMonth);
  };

  const goToPreviousMonth = () => {
    setSelectedMonth(prev => {
      if (prev.month === 1) {
        return { month: 12, year: prev.year - 1 };
      }
      return { month: prev.month - 1, year: prev.year };
    });
  };

  const goToNextMonth = () => {
    setSelectedMonth(prev => {
      if (prev.month === 12) {
        return { month: 1, year: prev.year + 1 };
      }
      return { month: prev.month + 1, year: prev.year };
    });
  };

  const isCurrentMonth = selectedMonth.month === currentMonth.month && selectedMonth.year === currentMonth.year;

  const getMonthName = (month, year) => {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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

const MonthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  
  // Month selection state
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  });

  const currentMonth = { month: new Date().getMonth() + 1, year: new Date().getFullYear() };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile when user changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setUserProfile(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, role, name')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [user]);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('Login successful!');
      return { success: true, data };
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password, name) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) throw error;
      
      toast.success('Account created! Please check your email to confirm your account.');
      return { success: true, data };
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Registration failed');
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      console.log('Logout initiated...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('Supabase logout successful, clearing local state...');
      setUser(null);
      setUserProfile(null);
      toast.success('Logged out successfully');
      console.log('Logout completed successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) throw error;
      
      setUserProfile(prev => ({ ...prev, ...profileData }));
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Profile update failed');
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.message || 'Password change failed');
      return { success: false, error: error.message };
    }
  };

  // Role-based access control
  const roleHierarchy = {
    viewer: 1,
    admin: 2,
    leadership: 3,
  };

  const isAdmin = userProfile?.role === 'admin';
  const isLeadership = userProfile?.role === 'leadership';
  const isViewer = userProfile?.role === 'viewer';

  const hasPermission = (requiredRole) => {
    if (!userProfile) return false;
    return roleHierarchy[userProfile.role] >= roleHierarchy[requiredRole];
  };

  // Month selection functions
  const changeMonth = (month, year) => {
    setSelectedMonth({ month, year });
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(currentMonth);
  };

  const goToPreviousMonth = () => {
    setSelectedMonth(prev => {
      if (prev.month === 1) {
        return { month: 12, year: prev.year - 1 };
      }
      return { month: prev.month - 1, year: prev.year };
    });
  };

  const goToNextMonth = () => {
    setSelectedMonth(prev => {
      if (prev.month === 12) {
        return { month: 1, year: prev.year + 1 };
      }
      return { month: prev.month + 1, year: prev.year };
    });
  };

  const isCurrentMonth = selectedMonth.month === currentMonth.month && selectedMonth.year === currentMonth.year;

  const getMonthName = (month, year) => {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getSelectedMonthName = () => getMonthName(selectedMonth.month, selectedMonth.year);
  const getCurrentMonthName = () => getMonthName(currentMonth.month, currentMonth.year);

  const value = {
    user,
    userProfile,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    isAdmin,
    isLeadership,
    isViewer,
    hasPermission,
    roleHierarchy,
    // Month selection values
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
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 