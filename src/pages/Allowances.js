import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  DollarSign, 
  Users, 
  Filter,
  Search,
  Download,
  Upload
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const Allowances = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [allowances, setAllowances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAllowance, setEditingAllowance] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [totalAllowance, setTotalAllowance] = useState(0);
  const [allowanceCategories, setAllowanceCategories] = useState([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Master categories
  const masterCategories = [
    { id: 'petrol', name: 'Petrol', icon: '⛽', color: 'bg-blue-100 text-blue-800' },
    { id: 'mobile', name: 'Mobile Recharge', icon: '📱', color: 'bg-green-100 text-green-800' },
    { id: 'food', name: 'Food', icon: '🍽️', color: 'bg-orange-100 text-orange-800' },
    { id: 'transport', name: 'Transport', icon: '🚗', color: 'bg-purple-100 text-purple-800' },
    { id: 'accommodation', name: 'Accommodation', icon: '🏠', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'utilities', name: 'Utilities', icon: '⚡', color: 'bg-yellow-100 text-yellow-800' }
  ];

  useEffect(() => {
    fetchEmployees();
    fetchAllowances();
    fetchCategories();
  }, []);

  const fetchEmployees = async () => {
    try {
      const sampleEmployees = [
        // Workshop Employees (Fixed Salary)
        { id: 'emp-1', name: 'DEEPAK KUMAR', cpr: '123456789', category: 'Workshop', currentRate: 130.0 },
        { id: 'emp-2', name: 'ARUNKUMAR PC', cpr: '987654321', category: 'Workshop', currentRate: 210.0 },
        { id: 'emp-3', name: 'AMAL KOORARA', cpr: '456789123', category: 'Workshop', currentRate: 130.0 },
        { id: 'emp-4', name: 'SHIFIN RAPHEL', cpr: '789123456', category: 'Workshop', currentRate: 130.0 },
        { id: 'emp-5', name: 'ARUN MON', cpr: '321654987', category: 'Workshop', currentRate: 190.0 },
        { id: 'emp-6', name: 'AJITH KUMAR', cpr: '654321987', category: 'Workshop', currentRate: 130.0 },
        { id: 'emp-7', name: 'VISHNU', cpr: '147258369', category: 'Workshop', currentRate: 120.0 },
        { id: 'emp-8', name: 'RAVI KAMMARI', cpr: '963852741', category: 'Workshop', currentRate: 140.0 },
        { id: 'emp-9', name: 'YADHUKRISHNAN', cpr: '852963741', category: 'Workshop', currentRate: 135.0 },
        // Site Employees - Fixed Salary
        { id: 'emp-10', name: 'PRADEEP KUMAR', cpr: '741852963', category: 'Site', currentRate: 190.0 },
        { id: 'emp-11', name: 'JOHN SIMON', cpr: '369258147', category: 'Site', currentRate: 115.0 },
        { id: 'emp-12', name: 'RAJESH', cpr: '258147369', category: 'Site', currentRate: 130.0 },
        { id: 'emp-13', name: 'SREENATH KANKKARA', cpr: '147369258', category: 'Site', currentRate: 120.0 },
        // Site Employees - Hourly
        { id: 'emp-14', name: 'MD MATALIB MIAH', cpr: '963147258', category: 'Site', currentRate: 0.800 },
        { id: 'emp-15', name: 'KABIR HOSSAIN', cpr: '852741963', category: 'Site', currentRate: 1.300 },
        { id: 'emp-16', name: 'ABDUL RAHIM', cpr: '741963852', category: 'Site', currentRate: 0.800 },
        { id: 'emp-17', name: 'ALAM ABUL KASHEM', cpr: '369741852', category: 'Site', currentRate: 0.750 },
        { id: 'emp-18', name: 'ANOWAR HOSSAIN', cpr: '258963741', category: 'Site', currentRate: 0.800 },
        { id: 'emp-19', name: 'ABDUL MIAH ISAMAIL', cpr: '147852963', category: 'Site', currentRate: 0.800 },
        // Flexi Visa Employees
        { id: 'emp-20', name: 'FLEXI EMPLOYEE 1', cpr: '111222333', category: 'Flexi Visa', currentRate: 1.100 },
        { id: 'emp-21', name: 'FLEXI EMPLOYEE 2', cpr: '222333444', category: 'Flexi Visa', currentRate: 1.000 },
        { id: 'emp-22', name: 'FLEXI EMPLOYEE 3', cpr: '333444555', category: 'Flexi Visa', currentRate: 1.200 },
        { id: 'emp-23', name: 'FLEXI EMPLOYEE 4', cpr: '444555666', category: 'Flexi Visa', currentRate: 0.950 },
        { id: 'emp-24', name: 'FLEXI EMPLOYEE 5', cpr: '555666777', category: 'Flexi Visa', currentRate: 1.150 }
      ];
      setEmployees(sampleEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    }
  };

  const fetchAllowances = async () => {
    try {
      // Sample allowances data
      const sampleAllowances = [
        {
          id: 'allowance-1',
          employeeId: 'emp-1',
          employeeName: 'DEEPAK KUMAR',
          totalAmount: 100,
          categories: [
            { id: 'cat-1', name: 'Petrol', amount: 50, type: 'master' },
            { id: 'cat-2', name: 'Mobile Recharge', amount: 30, type: 'master' },
            { id: 'cat-3', name: 'Food', amount: 20, type: 'master' }
          ],
          effectiveDate: '2024-01-01',
          status: 'active'
        },
        {
          id: 'allowance-2',
          employeeId: 'emp-2',
          employeeName: 'ARUNKUMAR PC',
          totalAmount: 150,
          categories: [
            { id: 'cat-4', name: 'Petrol', amount: 80, type: 'master' },
            { id: 'cat-5', name: 'Transport', amount: 40, type: 'master' },
            { id: 'cat-6', name: 'Food', amount: 30, type: 'master' }
          ],
          effectiveDate: '2024-01-01',
          status: 'active'
        }
      ];
      setAllowances(sampleAllowances);
    } catch (error) {
      console.error('Error fetching allowances:', error);
      toast.error('Failed to load allowances');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Sample custom categories
      const sampleCategories = [
        { id: 'custom-1', name: 'Internet', icon: '🌐', color: 'bg-pink-100 text-pink-800' },
        { id: 'custom-2', name: 'Medical', icon: '🏥', color: 'bg-red-100 text-red-800' }
      ];
      setAllowanceCategories(sampleCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedEmployee || totalAllowance <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const employee = employees.find(emp => emp.id === selectedEmployee);
    if (!employee) {
      toast.error('Employee not found');
      return;
    }

    try {
      const newAllowance = {
        id: editingAllowance ? editingAllowance.id : `allowance-${Date.now()}`,
        employeeId: selectedEmployee,
        employeeName: employee.name,
        totalAmount: totalAllowance,
        categories: [], // Will be populated by category management
        effectiveDate: new Date().toISOString().split('T')[0],
        status: 'active'
      };

      if (editingAllowance) {
        setAllowances(prev => prev.map(a => a.id === editingAllowance.id ? newAllowance : a));
        toast.success('Allowance updated successfully');
      } else {
        setAllowances(prev => [newAllowance, ...prev]);
        toast.success('Allowance added successfully');
      }

      // Reset form
      setSelectedEmployee('');
      setTotalAllowance(0);
      setEditingAllowance(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error saving allowance:', error);
      toast.error('Failed to save allowance');
    }
  };

  const handleEdit = (allowance) => {
    setEditingAllowance(allowance);
    setSelectedEmployee(allowance.employeeId);
    setTotalAllowance(allowance.totalAmount);
    setShowForm(true);
  };

  const handleDelete = (allowanceId) => {
    if (window.confirm('Are you sure you want to delete this allowance?')) {
      setAllowances(prev => prev.filter(a => a.id !== allowanceId));
      toast.success('Allowance deleted successfully');
    }
  };

  const addCategory = () => {
    if (!newCategory.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    const category = {
      id: `custom-${Date.now()}`,
      name: newCategory.trim(),
      icon: '📋',
      color: 'bg-gray-100 text-gray-800'
    };

    setAllowanceCategories(prev => [...prev, category]);
    setNewCategory('');
    toast.success('Category added successfully');
  };

  const removeCategory = (categoryId) => {
    setAllowanceCategories(prev => prev.filter(c => c.id !== categoryId));
    toast.success('Category removed successfully');
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'BHD 0';
    return new Intl.NumberFormat('en-BH', {
      style: 'currency',
      currency: 'BHD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredAllowances = allowances.filter(allowance => {
    const matchesSearch = allowance.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || allowance.categories.some(cat => cat.name === filterCategory);
    return matchesSearch && matchesCategory;
  });

  const allCategories = [...masterCategories, ...allowanceCategories];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Allowances</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage employee allowances and benefits
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCategoryManager(true)}
                className="btn btn-outline flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Manage Categories</span>
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add Allowance</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">Search Employee</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                  placeholder="Search by employee name..."
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Filter by Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input"
              >
                <option value="">All Categories</option>
                {allCategories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Total Allowances</label>
              <div className="text-2xl font-bold text-primary-600">
                {formatCurrency(allowances.reduce((sum, a) => sum + a.totalAmount, 0))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Allowances Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Employee Allowances ({filteredAllowances.length})
          </h3>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Total Amount</th>
                  <th>Categories</th>
                  <th>Effective Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllowances.map((allowance) => (
                  <tr key={allowance.id}>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">{allowance.employeeName}</div>
                        <div className="text-sm text-gray-500">
                          {employees.find(emp => emp.id === allowance.employeeId)?.category}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="font-medium tabular-nums">{formatCurrency(allowance.totalAmount)}</div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {allowance.categories.map((category) => (
                          <span
                            key={category.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {category.name}: {formatCurrency(category.amount)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-gray-900">{allowance.effectiveDate}</div>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        allowance.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {allowance.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(allowance)}
                          className="btn btn-sm btn-outline"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(allowance.id)}
                          className="btn btn-sm btn-outline text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Allowance Form */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-3">
              <DollarSign size={20} className="text-primary-600" />
              <h3 className="text-lg font-medium text-gray-900">
                {editingAllowance ? 'Edit Allowance' : 'Add New Allowance'}
              </h3>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Select Employee *</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="input"
                    required
                  >
                    <option value="">Choose an employee...</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} - {employee.category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Total Allowance Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={totalAllowance}
                    onChange={(e) => setTotalAllowance(parseFloat(e.target.value) || 0)}
                    className="input"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAllowance(null);
                    setSelectedEmployee('');
                    setTotalAllowance(0);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>{editingAllowance ? 'Update Allowance' : 'Save Allowance'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Filter size={20} className="text-primary-600" />
                <h3 className="text-lg font-medium text-gray-900">Manage Allowance Categories</h3>
              </div>
              <button
                onClick={() => setShowCategoryManager(false)}
                className="btn btn-sm btn-outline"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-6">
              {/* Master Categories */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Master Categories</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {masterCategories.map((category) => (
                    <div
                      key={category.id}
                      className={`flex items-center space-x-2 p-3 rounded-lg border ${category.color}`}
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Categories */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Custom Categories</h4>
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="input flex-1"
                    placeholder="Enter new category name..."
                  />
                  <button
                    type="button"
                    onClick={addCategory}
                    className="btn btn-primary"
                  >
                    Add Category
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allowanceCategories.map((category) => (
                    <div
                      key={category.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${category.color}`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <button
                        onClick={() => removeCategory(category.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Allowances; 