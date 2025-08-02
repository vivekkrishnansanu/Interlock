import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  CheckCircle, 
  XCircle,
  TrendingDown,
  Calculator,
  Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMonth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom'; // Added Link import

const SalaryAdvances = () => {
  const { user } = useAuth();
  const { selectedMonth, isCurrentMonth, getSelectedMonthName } = useMonth();
  const isEditor = ['admin', 'editor'].includes(user?.role);
  
  // State for advances
  const [advances, setAdvances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  
  // Form state
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [deductionPeriod, setDeductionPeriod] = useState('12');
  const [requestReason, setRequestReason] = useState('');

  useEffect(() => {
    fetchAdvances();
    fetchEmployees();
  }, [selectedMonth]);

  const fetchEmployees = async () => {
    try {
      // Sample employees - in real app, this would come from API
      const sampleEmployees = [
        { id: 'emp-1', name: 'DEEPAK KUMAR', currentRate: 130.0 },
        { id: 'emp-2', name: 'ARUNKUMAR PC', currentRate: 210.0 },
        { id: 'emp-3', name: 'AMAL KOORARA', currentRate: 130.0 },
        { id: 'emp-4', name: 'SHIFIN RAPHEL', currentRate: 130.0 },
        { id: 'emp-5', name: 'ARUN MON', currentRate: 190.0 }
      ];
      setEmployees(sampleEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchAdvances = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Sample advance data - all automatically approved
      const sampleAdvances = [
        {
          id: 'adv-1',
          employeeId: 'emp-1',
          employeeName: 'DEEPAK KUMAR',
          amount: 1000,
          requestDate: '2025-02-15',
          status: 'active',
          deductionPeriod: 12,
          monthlyDeduction: 83.33,
          totalDeducted: 166.66,
          remainingAmount: 833.34,
          reason: 'Medical emergency',
          deductionStartMonth: '2025-02',
          currentMonth: selectedMonth
        },
        {
          id: 'adv-2',
          employeeId: 'emp-3',
          employeeName: 'AMAL KOORARA',
          amount: 500,
          requestDate: '2025-03-01',
          status: 'active',
          deductionPeriod: 6,
          monthlyDeduction: 83.33,
          totalDeducted: 83.33,
          remainingAmount: 416.67,
          reason: 'Home repair',
          deductionStartMonth: '2025-03',
          currentMonth: selectedMonth
        },
        {
          id: 'adv-3',
          employeeId: 'emp-2',
          employeeName: 'ARUNKUMAR PC',
          amount: 1500,
          requestDate: '2025-01-10',
          status: 'active',
          deductionPeriod: 3,
          monthlyDeduction: 500,
          totalDeducted: 1000,
          remainingAmount: 500,
          reason: 'Vehicle purchase',
          deductionStartMonth: '2025-01',
          currentMonth: selectedMonth
        }
      ];
      
      // Calculate current deductions based on selected month
      const updatedAdvances = sampleAdvances.map(advance => {
        const monthsElapsed = calculateMonthsElapsed(advance.deductionStartMonth, selectedMonth);
        const totalDeducted = Math.min(advance.monthlyDeduction * monthsElapsed, advance.amount);
        const remainingAmount = Math.max(advance.amount - totalDeducted, 0);
        const status = remainingAmount > 0 ? 'active' : 'completed';
        
        return {
          ...advance,
          totalDeducted,
          remainingAmount,
          status,
          currentMonthDeduction: calculateCurrentMonthDeduction(advance, selectedMonth)
        };
      });
      
      setAdvances(updatedAdvances);
    } catch (error) {
      console.error('Error fetching advances:', error);
      toast.error('Failed to load salary advances');
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthsElapsed = (startMonth, currentMonth) => {
    const start = new Date(startMonth + '-01');
    const current = new Date(currentMonth.year, currentMonth.month - 1, 1);
    const monthsElapsed = (current.getFullYear() - start.getFullYear()) * 12 + 
                         (current.getMonth() - start.getMonth());
    return Math.max(0, monthsElapsed);
  };

  const calculateCurrentMonthDeduction = (advance, currentMonth) => {
    const monthsElapsed = calculateMonthsElapsed(advance.deductionStartMonth, currentMonth);
    const totalDeducted = advance.monthlyDeduction * monthsElapsed;
    const remainingAmount = advance.amount - totalDeducted;
    
    if (remainingAmount <= 0) return 0;
    if (remainingAmount < advance.monthlyDeduction) return remainingAmount;
    return advance.monthlyDeduction;
  };

  const handleRequestAdvance = async (e) => {
    e.preventDefault();
    
    if (!selectedEmployee || !advanceAmount || !requestReason) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(advanceAmount);
    if (amount <= 0) {
      toast.error('Advance amount must be greater than 0');
      return;
    }

    const employee = employees.find(emp => emp.id === selectedEmployee);
    const monthlyDeduction = amount / parseInt(deductionPeriod);
    const currentMonth = `${selectedMonth.year}-${String(selectedMonth.month).padStart(2, '0')}`;

    try {
      const newAdvance = {
        id: `adv-${Date.now()}`,
        employeeId: selectedEmployee,
        employeeName: employee.name,
        amount: amount,
        requestDate: new Date().toISOString().split('T')[0],
        status: 'active',
        deductionPeriod: parseInt(deductionPeriod),
        monthlyDeduction: monthlyDeduction,
        totalDeducted: 0,
        remainingAmount: amount,
        reason: requestReason,
        deductionStartMonth: currentMonth,
        currentMonth: selectedMonth,
        currentMonthDeduction: monthlyDeduction
      };

      setAdvances(prev => [newAdvance, ...prev]);
      toast.success('Advance request submitted and approved automatically');
      
      // Reset form
      setSelectedEmployee('');
      setAdvanceAmount('');
      setDeductionPeriod('12');
      setRequestReason('');
      setShowRequestForm(false);
    } catch (error) {
      toast.error('Failed to submit advance request');
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 'BHD 0';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BHD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Clock size={16} className="text-blue-600" />;
      case 'completed': return <CheckCircle size={16} className="text-green-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  const calculateMonthlyDeduction = () => {
    if (!advanceAmount || !deductionPeriod) return 0;
    return parseFloat(advanceAmount) / parseInt(deductionPeriod);
  };

  const exportAdvances = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salary-advances-${getSelectedMonthName()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Advances exported successfully!');
  };

  const generateCSV = () => {
    const headers = ['Employee', 'Amount', 'Status', 'Request Date', 'Deduction Period', 'Monthly Deduction', 'Total Deducted', 'Remaining', 'Current Month Deduction', 'Reason'];
    const rows = advances.map(advance => [
      advance.employeeName,
      formatCurrency(advance.amount),
      advance.status,
      formatDate(advance.requestDate),
      `${advance.deductionPeriod} months`,
      formatCurrency(advance.monthlyDeduction),
      formatCurrency(advance.totalDeducted),
      formatCurrency(advance.remainingAmount),
      formatCurrency(advance.currentMonthDeduction),
      advance.reason
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salary Advances</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage employee salary advances and automatic deductions
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportAdvances}
            className="btn btn-outline flex items-center space-x-2"
          >
            <Download size={20} />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowRequestForm(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Request Advance</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/monthly-summaries" className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-blue-600" />
              </div>
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Total Advances</p>
              <p className="text-xl lg:text-2xl font-semibold text-gray-900 truncate">
                {formatCurrency(advances.reduce((sum, adv) => sum + adv.amount, 0))}
              </p>
            </div>
          </div>
        </Link>

        <Link to="/employees" className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-blue-600" />
              </div>
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Active Advances</p>
              <p className="text-xl lg:text-2xl font-semibold text-gray-900 truncate">
                {advances.filter(adv => adv.status === 'active').length}
              </p>
            </div>
          </div>
        </Link>

        <Link to="/employees" className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Completed</p>
              <p className="text-xl lg:text-2xl font-semibold text-gray-900 truncate">
                {advances.filter(adv => adv.status === 'completed').length}
              </p>
            </div>
          </div>
        </Link>

        <Link to="/monthly-summaries" className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingDown size={20} className="text-purple-600" />
              </div>
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">This Month Deductions</p>
              <p className="text-xl lg:text-2xl font-semibold text-gray-900 truncate">
                {formatCurrency(advances.reduce((sum, adv) => sum + (adv.currentMonthDeduction || 0), 0))}
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Advances Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Advance Requests & Deductions</h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Request Date</th>
                <th>Deduction Period</th>
                <th>Monthly Deduction</th>
                <th>Total Deducted</th>
                <th>Remaining</th>
                <th>This Month Deduction</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {advances.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-500">
                    <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>No advance requests found</p>
                    <button
                      onClick={() => setShowRequestForm(true)}
                      className="mt-2 text-primary-600 hover:text-primary-500"
                    >
                      Request your first advance
                    </button>
                  </td>
                </tr>
              ) : (
                advances.map((advance) => (
                  <tr key={advance.id} className="hover:bg-gray-50">
                    <td className="font-medium">{advance.employeeName}</td>
                    <td className="font-semibold text-green-600 tabular-nums">
                      {formatCurrency(advance.amount)}
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(advance.status)}`}>
                        {getStatusIcon(advance.status)}
                        <span className="ml-1 capitalize">{advance.status}</span>
                      </span>
                    </td>
                    <td>{formatDate(advance.requestDate)}</td>
                    <td className="text-center">{advance.deductionPeriod} months</td>
                    <td className="tabular-nums">{formatCurrency(advance.monthlyDeduction)}</td>
                    <td className="tabular-nums">{formatCurrency(advance.totalDeducted)}</td>
                    <td className="tabular-nums">{formatCurrency(advance.remainingAmount)}</td>
                    <td className="tabular-nums font-semibold text-blue-600">
                      {formatCurrency(advance.currentMonthDeduction)}
                    </td>
                    <td className="max-w-xs truncate">{advance.reason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Advance Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Request Salary Advance</h3>
              <button
                onClick={() => setShowRequestForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleRequestAdvance} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Employee</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Advance Amount (BHD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                  className="input"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Deduction Period</label>
                <select
                  value={deductionPeriod}
                  onChange={(e) => setDeductionPeriod(e.target.value)}
                  className="input"
                  required
                >
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="24">24 months</option>
                </select>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Calculator size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Monthly Deduction</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(calculateMonthlyDeduction())}
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Advance</label>
                <textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  className="input"
                  rows="3"
                  placeholder="Please provide a reason for the advance request..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryAdvances; 