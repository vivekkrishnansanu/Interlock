import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  DollarSign, 
  User, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const SalaryAdvances = () => {
  const { userProfile } = useAuth();
  const [advances, setAdvances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdvance, setEditingAdvance] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [formData, setFormData] = useState({
    employee_id: '',
    amount: '',
    reason: '',
    request_date: new Date().toISOString().split('T')[0]
  });

  // Fetch data from Supabase
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch salary advances
      const { data: advancesData, error: advancesError } = await supabase
        .from('salary_advances')
        .select(`
          *,
          employees (
            id,
            name,
            designation
          )
        `)
        .order('request_date', { ascending: false });

      if (advancesError) throw advancesError;

      // Fetch employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, name, designation')
        .order('name', { ascending: true });

      if (employeesError) throw employeesError;

      setAdvances(advancesData || []);
      setEmployees(employeesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch salary advances');
      setAdvances([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter advances
  const filteredAdvances = advances.filter(advance => {
    const matchesSearch = 
      advance.employees?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      advance.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || advance.status === filterStatus;
    const matchesEmployee = !filterEmployee || advance.employee_id === filterEmployee;
    
    return matchesSearch && matchesStatus && matchesEmployee;
  });

  const handleAddAdvance = () => {
    setEditingAdvance(null);
    setFormData({
      employee_id: '',
      amount: '',
      reason: '',
      request_date: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleEditAdvance = (advance) => {
    setEditingAdvance(advance);
    setFormData({
      employee_id: advance.employee_id,
      amount: advance.amount.toString(),
      reason: advance.reason,
      request_date: advance.request_date
    });
    setShowModal(true);
  };

  const handleSaveAdvance = async () => {
    try {
      const advanceData = {
        ...formData,
        amount: parseFloat(formData.amount),
        status: editingAdvance ? editingAdvance.status : 'pending'
      };

      if (editingAdvance) {
        // Update existing advance
        const { error } = await supabase
          .from('salary_advances')
          .update(advanceData)
          .eq('id', editingAdvance.id);

        if (error) throw error;
        toast.success('Salary advance updated successfully');
      } else {
        // Create new advance
        const { error } = await supabase
          .from('salary_advances')
          .insert([advanceData]);

        if (error) throw error;
        toast.success('Salary advance request created successfully');
      }
      
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving advance:', error);
      toast.error('Failed to save salary advance');
    }
  };

  const handleStatusChange = async (advanceId, newStatus) => {
    try {
      const { error } = await supabase
        .from('salary_advances')
        .update({ status: newStatus })
        .eq('id', advanceId);

      if (error) throw error;
      
      toast.success(`Advance ${newStatus} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const exportAdvances = () => {
    const csvContent = [
      ['Employee', 'Amount', 'Reason', 'Request Date', 'Status', 'Approval Date'],
      ...filteredAdvances.map(advance => [
        advance.employees?.name || '',
        advance.amount,
        advance.reason,
        advance.request_date,
        advance.status,
        advance.approval_date || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'salary_advances.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate summary statistics
  const totalAdvances = filteredAdvances.length;
  const totalAmount = filteredAdvances.reduce((sum, advance) => sum + (advance.amount || 0), 0);
  const pendingAdvances = filteredAdvances.filter(advance => advance.status === 'pending').length;

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
          <h1 className="text-2xl font-bold text-gray-900">Salary Advances</h1>
          <p className="text-gray-600">Manage employee salary advance requests</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-sm">
          <button
            onClick={exportAdvances}
            className="btn btn-outline"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={handleAddAdvance}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Request Advance
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Advances</p>
                <p className="text-2xl font-bold text-gray-900">{totalAdvances}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-sm">
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
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{pendingAdvances}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {/* Search */}
            <div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by employee or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-select"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
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
          </div>
        </div>
      </div>

      {/* Advances Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Request Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdvances.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      {searchTerm || filterStatus || filterEmployee
                        ? 'No advances match your filters'
                        : 'No salary advances found. Create your first advance request to get started.'}
                    </td>
                  </tr>
                ) : (
                  filteredAdvances.map((advance) => (
                    <tr key={advance.id}>
                      <td>
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User size={14} className="text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{advance.employees?.name}</div>
                            <div className="text-sm text-gray-500">{advance.employees?.designation}</div>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono font-medium text-green-600">
                        BHD {advance.amount?.toFixed(2)}
                      </td>
                      <td>{advance.reason}</td>
                      <td className="font-mono">{advance.request_date}</td>
                      <td>
                        <span className={`badge ${
                          advance.status === 'approved' 
                            ? 'badge-success' 
                            : advance.status === 'rejected'
                            ? 'badge-error'
                            : 'badge-warning'
                        }`}>
                          {advance.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-sm">
                          {advance.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(advance.id, 'approved')}
                                className="btn btn-ghost btn-sm text-green-600 hover:text-green-700"
                                title="Approve"
                              >
                                <CheckCircle size={14} />
                              </button>
                              <button
                                onClick={() => handleStatusChange(advance.id, 'rejected')}
                                className="btn btn-ghost btn-sm text-red-600 hover:text-red-700"
                                title="Reject"
                              >
                                <XCircle size={14} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleEditAdvance(advance)}
                            className="btn btn-ghost btn-sm"
                            title="Edit"
                          >
                            Edit
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

      {/* Advance Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingAdvance ? 'Edit Advance' : 'Request Salary Advance'}
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
                    Reason *
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className="form-textarea"
                    placeholder="Enter reason for advance"
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Request Date *
                  </label>
                  <input
                    type="date"
                    value={formData.request_date}
                    onChange={(e) => setFormData({...formData, request_date: e.target.value})}
                    className="form-input"
                    required
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
                  onClick={handleSaveAdvance}
                  disabled={!formData.employee_id || !formData.amount || !formData.reason}
                  className="btn btn-primary flex-1"
                >
                  {editingAdvance ? 'Update' : 'Request'} Advance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryAdvances; 