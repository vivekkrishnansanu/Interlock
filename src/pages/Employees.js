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
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import EmployeeModal from '../components/EmployeeModal';
import { supabase } from '../lib/supabase';
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

  // Fetch employees from Supabase
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          sites (
            id,
            name,
            code
          )
        `)
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

  // Fetch sites from Supabase
  const fetchSites = async () => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('id, name, code')
        .order('name', { ascending: true });

      if (error) throw error;
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
                         employee.cpr.includes(searchTerm) ||
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

  const exportEmployees = () => {
    const csvContent = [
      ['Name', 'CPR', 'Designation', 'Site', 'Category', 'Employment Type', 'Work Type', 'NT Rate', 'ROT Rate', 'HOT Rate'],
      ...sortedEmployees.map(emp => [
        emp.name,
        emp.cpr,
        emp.designation,
        emp.sites?.name || '',
        emp.category,
        emp.employment_type,
        emp.work_type,
        emp.nt_rate,
        emp.rot_rate,
        emp.hot_rate
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
            onClick={exportEmployees}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </div>
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
                  <th>Site</th>
                  <th>Category</th>
                  <th>NT Rate</th>
                  <th>ROT Rate</th>
                  <th>HOT Rate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-12">
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
                        {employee.sites ? (
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-gray-400" />
                            <span className="text-sm">{employee.sites.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-outline text-xs">{employee.category}</span>
                      </td>
                                          <td className="font-mono text-sm">BHD {employee.nt_rate}</td>
                    <td className="font-mono text-sm">BHD {employee.rot_rate}</td>
                    <td className="font-mono text-sm">BHD {employee.hot_rate}</td>
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
          sites={sites}
          onClose={handleModalClose}
          onSave={handleEmployeeSave}
        />
      )}
    </div>
  );
};

export default Employees; 