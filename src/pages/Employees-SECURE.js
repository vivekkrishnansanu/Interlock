import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  User,
  Clock,
  DollarSign,
  Briefcase,
  XCircle,
  Edit, 
  Trash2, 
  MapPin,
  Loader2,
  Hash,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import EmployeeModal from '../components/EmployeeModal-SECURE';
import apiService from '../services/apiService';
import toast from 'react-hot-toast';

const Employees = () => {
  const { userProfile } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Fetch employees from secure API
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await apiService.getEmployees();
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sites from secure API
  const fetchSites = async () => {
    try {
      const data = await apiService.getSites();
      setSites(data || []);
    } catch (error) {
      console.error('Error fetching sites:', error);
      toast.error('Failed to fetch sites');
      setSites([]);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchSites();
  }, []);

  // Extract unique categories from real data
  const uniqueCategories = [...new Set(employees.map(emp => emp.category).filter(Boolean))];

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (employee.cpr && employee.cpr.includes(searchTerm)) ||
                         employee.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || employee.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Sort employees
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const aValue = a[sortBy] || '';
    const bValue = b[sortBy] || '';
    
    if (sortOrder === 'asc') {
      return aValue.toString().localeCompare(bValue.toString());
    } else {
      return bValue.toString().localeCompare(aValue.toString());
    }
  });

  const handleAddEmployee = () => {
    if (!apiService.canEdit(userProfile)) {
      toast.error('You do not have permission to add employees');
      return;
    }
    setEditingEmployee(null);
    setShowModal(true);
  };

  const handleEditEmployee = (employee) => {
    if (!apiService.canEdit(userProfile)) {
      toast.error('You do not have permission to edit employees');
      return;
    }
    setEditingEmployee(employee);
    setShowModal(true);
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!apiService.canDelete(userProfile)) {
      toast.error('You do not have permission to delete employees');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      await apiService.deleteEmployee(employeeId);
      toast.success('Employee deleted successfully');
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingEmployee(null);
  };

  const handleEmployeeSave = async (employeeData) => {
    setShowModal(false);
    setEditingEmployee(null);
    await fetchEmployees();
  };

  const exportEmployees = () => {
    const isViewer = userProfile?.role === 'viewer';
    
    const csvContent = [
      isViewer 
        ? ['Name', 'Designation', 'Site', 'Category', 'Employment Type', 'Work Type']
        : ['Name', 'CPR', 'Designation', 'Site', 'Category', 'Employment Type', 'Work Type', 'NT Rate', 'ROT Rate', 'HOT Rate'],
      ...sortedEmployees.map(emp => {
        const baseData = [
          emp.name,
          emp.designation,
          emp.sites?.name || '',
          emp.category,
          emp.employment_type || '',
          emp.work_type || ''
        ];
        
        if (isViewer) {
          return baseData;
        } else {
          return [
            ...baseData.slice(0, 1),
            emp.cpr || '',
            ...baseData.slice(1),
            emp.nt_rate || 0,
            emp.rot_rate || 0,
            emp.hot_rate || 0
          ];
        }
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees_${isViewer ? 'limited' : 'full'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600 font-medium">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Employees</h1>
              <p className="mt-2 text-gray-600">Manage your workforce and their details</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportEmployees}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <Download size={16} className="mr-2" />
                Export {userProfile?.role === 'viewer' ? '(Limited)' : '(Full)'}
              </button>
              {apiService.canEdit(userProfile) && (
                <button
                  onClick={handleAddEmployee}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <Plus size={16} className="mr-2" />
                  Add Employee
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search employees by name, CPR, or designation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                >
                  <option value="">All Categories</option>
                  {uniqueCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200" onClick={() => handleSort('name')}>
                    <div className="flex items-center space-x-2">
                      <User size={14} className="text-gray-400" />
                      <span>Employee</span>
                    </div>
                  </th>
                  {userProfile?.role !== 'viewer' && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200" onClick={() => handleSort('cpr')}>
                      <div className="flex items-center space-x-2">
                        <Hash size={14} className="text-gray-400" />
                        <span>CPR</span>
                      </div>
                    </th>
                  )}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200" onClick={() => handleSort('designation')}>
                    <div className="flex items-center space-x-2">
                      <Briefcase size={14} className="text-gray-400" />
                      <span>Designation</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200" onClick={() => handleSort('sites.name')}>
                    <div className="flex items-center space-x-2">
                      <MapPin size={14} className="text-gray-400" />
                      <span>Site</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200" onClick={() => handleSort('category')}>
                    <div className="flex items-center space-x-2">
                      <Filter size={14} className="text-gray-400" />
                      <span>Category</span>
                    </div>
                  </th>
                  {userProfile?.role !== 'viewer' && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200" onClick={() => handleSort('nt_rate')}>
                      <div className="flex items-center space-x-2">
                        <DollarSign size={14} className="text-gray-400" />
                        <span>NT Rate</span>
                      </div>
                    </th>
                  )}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <User size={20} className="text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.employment_type || 'Full-time'}</div>
                        </div>
                      </div>
                    </td>
                    {userProfile?.role !== 'viewer' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">{employee.cpr || 'N/A'}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.designation}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.sites?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {employee.category}
                      </span>
                    </td>
                    {userProfile?.role !== 'viewer' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">BHD {employee.nt_rate || 0}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {apiService.canEdit(userProfile) && (
                          <button
                            onClick={() => handleEditEmployee(employee)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                            title="Edit employee"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {apiService.canDelete(userProfile) && (
                          <button
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                            title="Delete employee"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        <Link
                          to={`/daily-logs?employee=${employee.id}`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                          title="View daily logs"
                        >
                          <Clock size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Empty State */}
          {sortedEmployees.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <User size={48} />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterCategory ? 'Try adjusting your search or filter criteria.' : 'Get started by adding your first employee.'}
              </p>
              {apiService.canEdit(userProfile) && !searchTerm && !filterCategory && (
                <div className="mt-6">
                  <button
                    onClick={handleAddEmployee}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Employee
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Employee Modal */}
      {showModal && (
        <EmployeeModal
          employee={editingEmployee}
          sites={sites}
          onSave={handleEmployeeSave}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default Employees; 