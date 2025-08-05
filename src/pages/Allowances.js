import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  DollarSign, 
  User, 
  Calendar,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const Allowances = () => {
  const { userProfile } = useAuth();
  const [allowances, setAllowances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAllowance, setEditingAllowance] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterType, setFilterType] = useState('');
  const [formData, setFormData] = useState({
    employee_id: '',
    allowance_type: '',
    amount: '',
    effective_date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Fetch data from Supabase
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch allowances - use created_at for ordering if effective_date doesn't exist
      const { data: allowancesData, error: allowancesError } = await supabase
        .from('allowances')
        .select(`
          *,
          employees (
            id,
            name,
            designation
          )
        `)
        .order('created_at', { ascending: false });

      if (allowancesError) {
        console.error('Allowances fetch error:', allowancesError);
        // If the error is about missing column, try without ordering
        if (allowancesError.message && allowancesError.message.includes('effective_date')) {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('allowances')
            .select(`
              *,
              employees (
                id,
                name,
                designation
              )
            `);
          
          if (fallbackError) throw fallbackError;
          setAllowances(fallbackData || []);
        } else {
          throw allowancesError;
        }
      } else {
        setAllowances(allowancesData || []);
      }

      // Fetch employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, name, designation')
        .order('name', { ascending: true });

      if (employeesError) throw employeesError;

      setEmployees(employeesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch allowances');
      setAllowances([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter allowances
  const filteredAllowances = allowances.filter(allowance => {
    const allowanceType = allowance.allowance_type || allowance.category || 'General';
    const matchesSearch = 
      allowance.employees?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allowanceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (allowance.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEmployee = !filterEmployee || allowance.employee_id === filterEmployee;
    const matchesType = !filterType || allowanceType === filterType;
    
    return matchesSearch && matchesEmployee && matchesType;
  });

  const handleAddAllowance = () => {
    setEditingAllowance(null);
    setFormData({
      employee_id: '',
      allowance_type: 'General',
      amount: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleEditAllowance = (allowance) => {
    setEditingAllowance(allowance);
    setFormData({
      employee_id: allowance.employee_id,
      allowance_type: allowance.allowance_type || 'General',
      amount: allowance.amount.toString(),
      description: allowance.description || ''
    });
    setShowModal(true);
  };

  const handleDeleteAllowance = async (allowanceId) => {
    if (!window.confirm('Are you sure you want to delete this allowance?')) return;
    
    try {
      const { error } = await supabase
        .from('allowances')
        .delete()
        .eq('id', allowanceId);

      if (error) throw error;
      
      toast.success('Allowance deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting allowance:', error);
      toast.error('Failed to delete allowance');
    }
  };

  const handleSaveAllowance = async () => {
    try {
      const allowanceData = {
        employee_id: formData.employee_id,
        category: formData.allowance_type, // Map allowance_type to category
        amount: parseFloat(formData.amount),
        description: formData.description || ''
      };

      if (editingAllowance) {
        // Update existing allowance
        const { error } = await supabase
          .from('allowances')
          .update(allowanceData)
          .eq('id', editingAllowance.id);

        if (error) throw error;
        toast.success('Allowance updated successfully');
      } else {
        // Create new allowance
        const { error } = await supabase
          .from('allowances')
          .insert([allowanceData]);

        if (error) throw error;
        toast.success('Allowance created successfully');
      }
      
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving allowance:', error);
      toast.error('Failed to save allowance');
    }
  };

  const exportAllowances = () => {
    const csvContent = [
      ['Employee', 'Category', 'Amount', 'Description', 'Created Date'],
      ...filteredAllowances.map(allowance => [
        allowance.employees?.name || '',
        allowance.category || allowance.allowance_type || 'General',
        allowance.amount,
        allowance.description || '',
        allowance.created_at ? new Date(allowance.created_at).toLocaleDateString() : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'allowances.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate summary statistics
  const totalAllowances = filteredAllowances.length;
  const totalAmount = filteredAllowances.reduce((sum, allowance) => sum + (allowance.amount || 0), 0);
  const uniqueTypes = [...new Set(filteredAllowances.map(allowance => 
    allowance.allowance_type || allowance.category || 'General'
  ))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Allowances</h1>
          <p className="text-gray-600">Manage employee allowances and benefits</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={exportAllowances}
            className="btn btn-outline"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={handleAddAllowance}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Add Allowance
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Allowances</p>
                <p className="text-2xl font-bold text-gray-900">{totalAllowances}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">BHD {totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <User size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Allowance Types</p>
                <p className="text-2xl font-bold text-gray-900">{uniqueTypes.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by employee, type, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>

            {/* Employee Filter */}
            <div>
              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="form-select"
              >
                <option value="">All Employees</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>{employee.name}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="form-select"
              >
                <option value="">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Allowances Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Allowance Type</th>
                  <th>Amount</th>
                  <th>Effective Date</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllowances.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      {searchTerm || filterEmployee || filterType
                        ? 'No allowances match your filters'
                        : 'No allowances found. Add your first allowance to get started.'}
                    </td>
                  </tr>
                ) : (
                  filteredAllowances.map((allowance) => (
                    <tr key={allowance.id}>
                      <td>
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User size={14} className="text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{allowance.employees?.name}</div>
                            <div className="text-sm text-gray-500">{allowance.employees?.designation}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-outline">
                          {allowance.allowance_type || allowance.category || 'General'}
                        </span>
                      </td>
                      <td className="font-mono font-medium text-green-600">
                        BHD {allowance.amount?.toFixed(2)}
                      </td>
                      <td className="font-mono">
                        {allowance.effective_date || 
                         (allowance.created_at ? new Date(allowance.created_at).toLocaleDateString() : '-')}
                      </td>
                      <td>{allowance.description || '-'}</td>
                      <td>
                        <div className="flex items-center gap-sm">
                          <button
                            onClick={() => handleEditAllowance(allowance)}
                            className="btn btn-ghost btn-sm"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteAllowance(allowance.id)}
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

      {/* Allowance Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingAllowance ? 'Edit Allowance' : 'Add Allowance'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee *
                  </label>
                  <select
                    value={formData.employee_id}
                    onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                    className="form-select"
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} - {employee.designation}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allowance Type *
                  </label>
                  <input
                    type="text"
                    value={formData.allowance_type}
                    onChange={(e) => setFormData({...formData, allowance_type: e.target.value})}
                    className="form-input"
                    placeholder="e.g., Housing, Transportation, Food"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (BHD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="form-input"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Effective Date *
                  </label>
                  <input
                    type="date"
                    value={formData.effective_date}
                    onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="form-textarea"
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex gap-sm mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAllowance}
                  disabled={!formData.employee_id || !formData.allowance_type || !formData.amount}
                  className="btn btn-primary flex-1"
                >
                  {editingAllowance ? 'Update' : 'Add'} Allowance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Allowances; 