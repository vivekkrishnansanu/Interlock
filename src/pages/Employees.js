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
  Loader2,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import EmployeeModal from '../components/EmployeeModal';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const Employees = () => {
  const { userProfile } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterVisaTypes, setFilterVisaTypes] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Fetch employees from Supabase
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Extract unique categories and visa types from real data
  const uniqueCategories = [...new Set(employees.map(emp => emp.category).filter(Boolean))];
  const uniqueVisaTypes = [...new Set(employees.map(emp => emp.visa_name).filter(Boolean))];
  
  // Predefined visa types for selection
  const predefinedVisaTypes = [
    'Interlock maintenance construction',
    'Interlock services', 
    'Hardscape contracting',
    'Golden Life Contracting',
    'IMC',
    'Bala Contracting'
  ];
  
  // Combine unique visa types from database with predefined ones
  const allVisaTypes = [...new Set([...uniqueVisaTypes, ...predefinedVisaTypes])];

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.cpr.includes(searchTerm) ||
                         employee.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || employee.category === filterCategory;
    const matchesVisaType = filterVisaTypes.length === 0 || filterVisaTypes.includes(employee.visa_name);
    
    return matchesSearch && matchesCategory && matchesVisaType;
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
    setEditingEmployee(null);
    setShowModal(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setShowModal(true);
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);

      if (error) throw error;
      
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

  // Handle employee save
  const handleEmployeeSaved = async (savedEmployee) => {
    setShowModal(false);
    setEditingEmployee(null);
    await fetchEmployees(); // Refresh the list
  };

  // Handle employee save (updated to work with new modal)
  const handleEmployeeSave = async (employeeData) => {
    setShowModal(false);
    setEditingEmployee(null);
    await fetchEmployees(); // Refresh the list
  };

  const exportEmployees = (selectedVisaTypes = []) => {
    // Filter employees based on selected visa types
    const employeesToExport = selectedVisaTypes.length > 0 
      ? sortedEmployees.filter(emp => selectedVisaTypes.includes(emp.visa_name))
      : sortedEmployees;

    const csvContent = [
      ['Name', 'CPR', 'Designation', 'Category', 'Employment Type', 'Work Type', 'Salary Type', 'Visa Name', 'Visa Expiry Date'],
      ...employeesToExport.map(emp => [
        emp.name,
        emp.cpr,
        emp.designation,
        emp.category,
        emp.employment_type || 'permanent',
        emp.work_type || 'workshop',
        emp.salary_type || 'monthly',
        emp.visa_name || '',
        emp.visa_expiry_date || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    setShowExportModal(false);
    toast.success('Employee data exported successfully!');
  };

  const handleVisaTypeToggle = (visaType) => {
    setFilterVisaTypes(prev => 
      prev.includes(visaType) 
        ? prev.filter(type => type !== visaType)
        : [...prev, visaType]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 size={24} className="animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">Employees</h1>
          <p className="text-gray-600">Manage your workforce and their details</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="btn btn-outline hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
          <button
            onClick={handleAddEmployee}
            className="btn btn-primary"
          >
            <Plus size={16} className="mr-2" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="form-select"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Visa Type Filter */}
            <div>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleVisaTypeToggle(e.target.value);
                  }
                }}
                className="form-select"
              >
                <option value="">Filter by Visa Type</option>
                {allVisaTypes.map(visaType => (
                  <option key={visaType} value={visaType}>{visaType}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Visa Type Filters */}
          {filterVisaTypes.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filterVisaTypes.map(visaType => (
                <span
                  key={visaType}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {visaType}
                  <button
                    onClick={() => handleVisaTypeToggle(visaType)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <XCircle size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Employees Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 hover:text-gray-700 transition-colors duration-200"
                    >
                      Name
                      {sortBy === 'name' && (
                        <span className="text-xs font-medium">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th>CPR</th>
                  <th>Designation</th>
                  <th>Category</th>
                  <th>Employment Type</th>
                  <th>Work Type</th>
                  <th>Salary Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12">
                      <div className="flex flex-col items-center space-y-3">
                        <User size={48} className="text-gray-300" />
                        <p className="text-gray-500">
                          {searchTerm || filterCategory
                            ? 'No employees match your filters'
                            : 'No employees found. Add your first employee to get started.'}
                        </p>
                        {!searchTerm && !filterCategory && (
                          <button
                            onClick={handleAddEmployee}
                            className="btn btn-primary"
                          >
                            <Plus size={16} className="mr-2" />
                            Add First Employee
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                            <User size={16} className="text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{employee.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-sm">{employee.cpr}</td>
                      <td className="text-sm">{employee.designation}</td>
                      <td>
                        <span className="badge badge-outline text-xs">{employee.category}</span>
                      </td>
                      <td>
                        <span className={`badge text-xs ${
                          employee.employment_type === 'permanent' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {employee.employment_type || 'permanent'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge text-xs ${
                          employee.work_type === 'workshop' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {employee.work_type || 'workshop'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge text-xs ${
                          employee.salary_type === 'monthly' 
                            ? 'bg-indigo-100 text-indigo-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {employee.salary_type || 'monthly'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditEmployee(employee)}
                            className="btn btn-ghost btn-sm hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="btn btn-ghost btn-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Employee Modal */}
      {showModal && (
        <EmployeeModal
          employee={editingEmployee}
          onClose={handleModalClose}
          onSave={handleEmployeeSave}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Export Employees</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select visa types to filter the export, or export all employees:
              </p>

              {/* Visa Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Visa Types:</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {allVisaTypes.map(visaType => (
                    <label key={visaType} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filterVisaTypes.includes(visaType)}
                        onChange={() => handleVisaTypeToggle(visaType)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{visaType}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Export Options */}
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => exportEmployees(filterVisaTypes)}
                  className="btn btn-primary w-full"
                >
                  <Download size={16} className="mr-2" />
                  Export Selected
                </button>
                <button
                  onClick={() => exportEmployees([])}
                  className="btn btn-outline w-full"
                >
                  Export All Employees
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees; 