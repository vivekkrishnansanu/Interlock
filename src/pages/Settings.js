import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Plus, Edit, Trash2, Save, XCircle, Settings as SettingsIcon, Users, Search, Shield, UserCheck, UserX, Mail, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiService from '../services/apiService';

const Settings = () => {
  const { userProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('holidays');
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState('');
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [editValue, setEditValue] = useState('');
  
  // User Management states
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'viewer',
    password: ''
  });

  // Check if user has permission to manage users
  const canManageUsers = userProfile?.role === 'admin' || userProfile?.role === 'editor';

  // Bahrain holidays for 2025
  const bahrainHolidays = [
    { date: '2025-01-01', name: 'New Year\'s Day', type: 'bahrain' },
    { date: '2025-01-28', name: 'Prophet Muhammad\'s Birthday', type: 'bahrain' },
    { date: '2025-05-01', name: 'Labour Day', type: 'bahrain' },
    { date: '2025-06-16', name: 'Eid al-Fitr (estimated)', type: 'bahrain' },
    { date: '2025-06-17', name: 'Eid al-Fitr (estimated)', type: 'bahrain' },
    { date: '2025-06-18', name: 'Eid al-Fitr (estimated)', type: 'bahrain' },
    { date: '2025-08-21', name: 'Eid al-Adha (estimated)', type: 'bahrain' },
    { date: '2025-08-22', name: 'Eid al-Adha (estimated)', type: 'bahrain' },
    { date: '2025-08-23', name: 'Eid al-Adha (estimated)', type: 'bahrain' },
    { date: '2025-09-15', name: 'Islamic New Year (estimated)', type: 'bahrain' },
    { date: '2025-12-16', name: 'Bahrain National Day', type: 'bahrain' },
    { date: '2025-12-17', name: 'Bahrain National Day', type: 'bahrain' },
  ];

  useEffect(() => {
    // Load custom holidays from localStorage
    const savedHolidays = localStorage.getItem('customHolidays');
    if (savedHolidays) {
      setHolidays(JSON.parse(savedHolidays));
    }
  }, []);

  // User Management useEffect
  useEffect(() => {
    if (canManageUsers && activeSection === 'users') {
      fetchUsers();
    }
  }, [canManageUsers, activeSection]);

  const saveHolidaysToStorage = (holidaysList) => {
    localStorage.setItem('customHolidays', JSON.stringify(holidaysList));
  };

  const addHoliday = () => {
    if (!newHoliday) {
      toast.error('Please enter a date');
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(newHoliday)) {
      toast.error('Please enter date in YYYY-MM-DD format');
      return;
    }

    // Check if date already exists
    const allHolidays = [...bahrainHolidays, ...holidays];
    if (allHolidays.some(h => h.date === newHoliday)) {
      toast.error('This date is already a holiday');
      return;
    }

    const holiday = {
      date: newHoliday,
      name: `Custom Holiday ${newHoliday}`,
      type: 'custom'
    };

    const updatedHolidays = [...holidays, holiday];
    setHolidays(updatedHolidays);
    saveHolidaysToStorage(updatedHolidays);
    setNewHoliday('');
    toast.success('Custom holiday added successfully');
  };

  const removeHoliday = (date) => {
    const updatedHolidays = holidays.filter(h => h.date !== date);
    setHolidays(updatedHolidays);
    saveHolidaysToStorage(updatedHolidays);
    toast.success('Custom holiday removed successfully');
  };

  const startEditHoliday = (holiday) => {
    setEditingHoliday(holiday);
    setEditValue(holiday.name);
  };

  const saveEditHoliday = () => {
    if (!editValue.trim()) {
      toast.error('Holiday name cannot be empty');
      return;
    }

    const updatedHolidays = holidays.map(h => 
      h.date === editingHoliday.date 
        ? { ...h, name: editValue.trim() }
        : h
    );
    
    setHolidays(updatedHolidays);
    saveHolidaysToStorage(updatedHolidays);
    setEditingHoliday(null);
    setEditValue('');
    toast.success('Holiday name updated successfully');
  };

  const cancelEditHoliday = () => {
    setEditingHoliday(null);
    setEditValue('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getHolidayTypeColor = (type) => {
    switch (type) {
      case 'bahrain':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'custom':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHolidayTypeLabel = (type) => {
    switch (type) {
      case 'bahrain':
        return 'Bahrain';
      case 'custom':
        return 'Custom';
      default:
        return 'Unknown';
    }
  };

  // User Management functions
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Check if user is a demo user
      const demoEmails = ['leadership@interlock.com', 'admin@interlock.com', 'viewer@interlock.com'];
      const isDemoUser = demoEmails.includes(userProfile?.email);
      
      if (isDemoUser) {
        console.log('Demo user detected, using mock data for users...');
        // For demo users, return mock data
        const mockUsers = [
          {
            id: 'admin-demo-id',
            name: 'Admin User',
            email: 'admin@interlock.com',
            role: 'admin',
            created_at: new Date().toISOString()
          },
          {
            id: 'leadership-demo-id',
            name: 'Leadership User', 
            email: 'leadership@interlock.com',
            role: 'leadership',
            created_at: new Date().toISOString()
          },
          {
            id: 'viewer-demo-id',
            name: 'Viewer User',
            email: 'viewer@interlock.com', 
            role: 'viewer',
            created_at: new Date().toISOString()
          },
          {
            id: 'editor-demo-id',
            name: 'Editor User',
            email: 'editor@interlock.com',
            role: 'editor', 
            created_at: new Date().toISOString()
          },
          {
            id: 'vivek-user-id',
            name: 'Vivek',
            email: 'vivekkrishnansanu@gmail.com',
            role: 'admin', 
            created_at: new Date().toISOString()
          }
        ];
        setUsers(mockUsers);
      } else {
        // For real users, use API service
        const data = await apiService.getUsers();
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'viewer',
      password: ''
    });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'viewer',
      password: ''
    });
    setShowModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await apiService.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingUser) {
        // Update existing user
        await apiService.updateUser(editingUser.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role
        });
        toast.success('User updated successfully');
      } else {
        // Create new user
        await apiService.createUser({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password
        });
        toast.success('User created successfully');
      }

      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(error.message || 'Failed to save user');
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: 'bg-red-100 text-red-800', icon: Shield },
      editor: { color: 'bg-blue-100 text-blue-800', icon: UserCheck },
      viewer: { color: 'bg-gray-100 text-gray-800', icon: UserX }
    };

    const config = roleConfig[role] || roleConfig.viewer;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} className="mr-1" />
        {role}
      </span>
    );
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navigation = [
    { name: 'Holidays', id: 'holidays', icon: Calendar },
    { name: 'User Management', id: 'users', icon: Users },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'holidays':
        return (
          <div className="space-y-6">
            {/* Bahrain Holidays Section */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center space-x-3">
                  <Calendar size={20} className="text-blue-600" />
                  <h2 className="text-lg font-medium text-gray-900">Bahrain Holidays 2025</h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {bahrainHolidays.length} holidays
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Official Bahrain public holidays. These cannot be modified.
                </p>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bahrainHolidays.map((holiday) => (
                    <div
                      key={holiday.date}
                      className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-blue-900">{holiday.name}</div>
                        <div className="text-sm text-blue-700">{formatDate(holiday.date)}</div>
                        <div className="text-xs text-blue-600 mt-1">
                          {holiday.date}
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getHolidayTypeColor(holiday.type)}`}>
                        {getHolidayTypeLabel(holiday.type)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Holidays Section */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar size={20} className="text-green-600" />
                    <h2 className="text-lg font-medium text-gray-900">Custom Holidays</h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {holidays.length} custom holidays
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Add custom holidays for your organization. These will be treated the same as official holidays.
                </p>
              </div>
              <div className="card-body">
                {/* Add New Holiday */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Custom Holiday
                    </label>
                    <input
                      type="date"
                      value={newHoliday}
                      onChange={(e) => setNewHoliday(e.target.value)}
                      className="input w-full"
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                  <button
                    onClick={addHoliday}
                    className="btn btn-primary flex items-center space-x-2 mt-6"
                  >
                    <Plus size={16} />
                    <span>Add Holiday</span>
                  </button>
                </div>

                {/* Custom Holidays List */}
                {holidays.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No custom holidays added yet.</p>
                    <p className="text-sm">Add your first custom holiday above.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {holidays.map((holiday) => (
                      <div
                        key={holiday.date}
                        className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div className="flex-1">
                          {editingHoliday?.date === holiday.date ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="input w-full text-sm"
                                placeholder="Holiday name"
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={saveEditHoliday}
                                  className="btn btn-sm btn-primary flex items-center space-x-1"
                                >
                                  <Save size={14} />
                                  <span>Save</span>
                                </button>
                                <button
                                  onClick={cancelEditHoliday}
                                  className="btn btn-sm btn-outline flex items-center space-x-1"
                                >
                                  <XCircle size={14} />
                                  <span>Cancel</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="font-medium text-green-900">{holiday.name}</div>
                              <div className="text-sm text-green-700">{formatDate(holiday.date)}</div>
                              <div className="text-xs text-green-600 mt-1">
                                {holiday.date}
                              </div>
                            </>
                          )}
                        </div>
                        {editingHoliday?.date !== holiday.date && (
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getHolidayTypeColor(holiday.type)}`}>
                              {getHolidayTypeLabel(holiday.type)}
                            </span>
                            <button
                              onClick={() => startEditHoliday(holiday)}
                              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => removeHoliday(holiday.date)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Holiday Rules Section */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center space-x-3">
                  <Calendar size={20} className="text-purple-600" />
                  <h2 className="text-lg font-medium text-gray-900">Holiday Rules</h2>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  How holidays affect daily log calculations
                </p>
              </div>
              <div className="card-body">
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-purple-900">Friday & Holiday Rules:</span>
                        <p className="text-purple-700 mt-1">
                          When an employee is not working on a Friday or Bahrain holiday, Normal Time (NT) hours are automatically set to 8.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-purple-900">Working on Holidays:</span>
                        <p className="text-purple-700 mt-1">
                          If an employee works on a Friday or holiday, they must manually enter their hours. No automatic adjustments are made.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-purple-900">Custom Holidays:</span>
                        <p className="text-purple-700 mt-1">
                          Custom holidays are treated the same as official Bahrain holidays for calculation purposes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'users':
        if (!canManageUsers) {
          return (
            <div className="text-center py-12">
              <Shield size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-500">You don't have permission to manage users.</p>
            </div>
          );
        }

        if (loading) {
          return (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-gray-600 font-medium">Loading users...</p>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h2>
                <p className="mt-2 text-gray-600">Manage user accounts and permissions</p>
              </div>
              <button
                onClick={handleAddUser}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <Plus size={16} className="mr-2" />
                Add User
              </button>
            </div>

            {/* Search */}
            <div className="card">
              <div className="card-body">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className="card">
              <div className="card-body">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-500">
                      {searchTerm ? 'No users match your search' : 'Get started by adding your first user'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                    <Users size={20} className="text-white" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                                  <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Mail size={16} className="text-gray-400 mr-2" />
                                <span className="text-sm text-gray-900">{user.email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getRoleBadge(user.role)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEditUser(user)}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                                  title="Edit user"
                                >
                                  <Edit size={16} />
                                </button>
                                {user.id !== userProfile?.id && (
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                                    title="Delete user"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <SettingsIcon size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a section</h3>
            <p className="text-gray-500">Choose a section from the sidebar to get started.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <SettingsIcon size={24} className="text-blue-600" />
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Manage system settings and configurations
          </p>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <nav className="mt-6">
            <div className="px-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Navigation
              </h3>
            </div>
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} className="mr-3" />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <Users size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {editingUser ? 'Update user information' : 'Enter user details'}
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter email address"
                  required
                  disabled={!!editingUser}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  required
                >
                  <option value="viewer">Viewer - Read-only access</option>
                  <option value="editor">Editor - Can create and edit data</option>
                  <option value="admin">Admin - Full access and user management</option>
                </select>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      placeholder="Enter password"
                      required={!editingUser}
                      minLength={6}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
