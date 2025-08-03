import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Save, Shield, Crown, Briefcase, Calendar, MapPin } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    setValue
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword
  } = useForm();

  React.useEffect(() => {
    if (user) {
      setValue('name', user.name || '');
      setValue('email', user.email || '');
    }
  }, [user, setValue]);

  const onProfileSubmit = async (data) => {
    try {
      setLoading(true);
      await updateProfile(data);
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      setLoading(true);
      await changePassword(data.currentPassword, data.newPassword);
      resetPassword();
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'leadership': return <Crown className="h-5 w-5 text-yellow-600" />;
      case 'admin': return <Shield className="h-5 w-5 text-blue-600" />;
      case 'viewer': return <User className="h-5 w-5 text-gray-600" />;
      default: return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'leadership': return 'Leadership Team';
      case 'admin': return 'Administrator';
      case 'viewer': return 'Viewer';
      default: return role;
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'leadership': return 'Full access to leadership dashboard, financial overview, and strategic insights';
      case 'admin': return 'Full system access including user management and all operational features';
      case 'viewer': return 'Read-only access to view reports and data';
      default: return 'Limited access to system features';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      {/* User Info Card */}
      <div className="card p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-gray-900">{user?.name || 'User'}</h2>
            <p className="text-sm text-gray-600">{user?.email || 'user@example.com'}</p>
            <div className="flex items-center mt-2 space-x-2">
              {getRoleIcon(user?.role)}
              <span className="text-sm font-medium text-gray-700">
                {getRoleDisplayName(user?.role)}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="text-right">
              <p className="text-xs text-gray-500">Member since</p>
              <p className="text-sm font-medium text-gray-700">2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Information */}
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-4">
          {getRoleIcon(user?.role)}
          <h3 className="text-lg font-medium text-gray-900">Role Information</h3>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Role</p>
            <p className="text-sm text-gray-600">{getRoleDisplayName(user?.role)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Description</p>
            <p className="text-sm text-gray-600">{getRoleDescription(user?.role)}</p>
          </div>
          {user?.role === 'leadership' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                <h4 className="text-sm font-medium text-yellow-800">Leadership Access</h4>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                You have access to the Leadership Dashboard with financial overview, project insights, and strategic metrics.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'password'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Change Password
          </button>
        </nav>
      </div>

      {/* Profile Information Tab */}
      {activeTab === 'profile' && (
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <User className="h-6 w-6 text-primary-600" />
            <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
          </div>

          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                {...registerProfile('name', { required: 'Name is required' })}
                className="input"
                placeholder="Enter your name"
              />
              {profileErrors.name && (
                <p className="mt-1 text-sm text-red-600">{profileErrors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                {...registerProfile('email')}
                className="input bg-gray-50"
                disabled
                placeholder="Your email address"
              />
              <p className="mt-1 text-sm text-gray-500">
                Email cannot be changed. Contact your administrator if needed.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <input
                type="text"
                value={user?.role || ''}
                className="input bg-gray-50"
                disabled
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Save size={16} />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Change Password Tab */}
      {activeTab === 'password' && (
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Lock className="h-6 w-6 text-primary-600" />
            <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
          </div>

          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                {...registerPassword('currentPassword', { required: 'Current password is required' })}
                className="input"
                placeholder="Enter current password"
              />
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                {...registerPassword('newPassword', { 
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                className="input"
                placeholder="Enter new password"
              />
              {passwordErrors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                {...registerPassword('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: (value, formValues) => 
                    value === formValues.newPassword || 'Passwords do not match'
                })}
                className="input"
                placeholder="Confirm new password"
              />
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Lock size={16} />
                <span>{loading ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile; 