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
  MapPin
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
  const [filterWorkType, setFilterWorkType] = useState('');
  const [filterEmploymentType, setFilterEmploymentType] = useState('');
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

  // Extract unique categories and work types from real data
  const uniqueCategories = [...new Set(employees.map(emp => emp.category))];
  const uniqueWorkTypes = [...new Set(employees.map(emp => emp.work_type))];
  const uniqueEmploymentTypes = [...new Set(employees.map(emp => emp.employment_type))];

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.cpr.includes(searchTerm) ||
                         employee.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || employee.category === filterCategory;
    const matchesWorkType = !filterWorkType || employee.work_type === filterWorkType;
    const matchesEmploymentType = !filterEmploymentType || employee.employment_type === filterEmploymentType;
    
    return matchesSearch && matchesCategory && matchesWorkType && matchesEmploymentType;
  });

  // Sort employees
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'site') {
      aValue = a.sites?.name || '';
      bValue = b.sites?.name || '';
    }
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
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
    if (!confirm('Are you sure you want to delete this employee?')) return;
    
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

  const handleEmployeeSaved = () => {
    fetchEmployees();
    handleModalClose();
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600">Manage your workforce and their details</p>
            </div>
        <div className="flex flex-col sm:flex-row gap-sm">
          <button
            onClick={exportEmployees}
            className="btn btn-outline"
          >
            <Download size={16} />
            Export
          </button>
              <button
                onClick={handleAddEmployee}
            className="btn btn-primary"
              >
            <Plus size={16} />
            Add Employee
              </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-md">
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

            {/* Work Type Filter */}
            <div>
              <select
                value={filterWorkType}
                onChange={(e) => setFilterWorkType(e.target.value)}
                className="form-select"
              >
                <option value="">All Work Types</option>
                {uniqueWorkTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Employment Type Filter */}
            <div>
              <select
                value={filterEmploymentType}
                onChange={(e) => setFilterEmploymentType(e.target.value)}
                className="form-select"
              >
                <option value="">All Employment Types</option>
                {uniqueEmploymentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
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
                      onClick={() => {
                        setSortBy('name');
                        setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                      className="flex items-center gap-sm hover:text-blue-600"
                    >
                      Name
                      {sortBy === 'name' && (
                        <span className="text-blue-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                <th>CPR</th>
                  <th>Designation</th>
                  <th>
                    <button
                      onClick={() => {
                        setSortBy('site');
                        setSortOrder(sortBy === 'site' && sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                      className="flex items-center gap-sm hover:text-blue-600"
                    >
                      Site
                      {sortBy === 'site' && (
                        <span className="text-blue-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                <th>Category</th>
                <th>Employment Type</th>
                <th>Work Type</th>
                  <th>NT Rate</th>
                  <th>ROT Rate</th>
                  <th>HOT Rate</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
                {sortedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center py-8 text-gray-500">
                      {searchTerm || filterCategory || filterWorkType || filterEmploymentType
                        ? 'No employees match your filters'
                        : 'No employees found. Add your first employee to get started.'}
                  </td>
                </tr>
              ) : (
                  sortedEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{employee.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono">{employee.cpr}</td>
                      <td>{employee.designation}</td>
                      <td>
                        {employee.sites ? (
                          <div className="flex items-center gap-sm">
                            <MapPin size={14} className="text-gray-400" />
                            <span>{employee.sites.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-outline">{employee.category}</span>
                      </td>
                      <td>
                        <span className={`badge ${
                          employee.employment_type === 'permanent' 
                            ? 'badge-success' 
                            : 'badge-warning'
                        }`}>
                          {employee.employment_type}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-outline">{employee.work_type}</span>
                      </td>
                      <td className="font-mono">{employee.nt_rate}</td>
                      <td className="font-mono">{employee.rot_rate}</td>
                      <td className="font-mono">{employee.hot_rate}</td>
                      <td>
                        <div className="flex items-center gap-sm">
                          <button
                            onClick={() => handleEditEmployee(employee)}
                            className="btn btn-ghost btn-sm"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                            <button
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="btn btn-ghost btn-sm text-red-600 hover:text-red-700"
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
          onSave={handleEmployeeSaved}
        />
      )}
    </div>
  );
};

export default Employees; 