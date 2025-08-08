import React, { useState, useEffect } from 'react';
import { X, Save, User, Building, DollarSign, Calendar, Hash, Briefcase, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const EmployeeModal = ({ employee, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    cpr: '',
    designation: '',
    employment_type: 'permanent',
    salary_type: 'monthly',
    basic_pay: 0,
    hourly_wage: 0,
    allowance: 0,
    deductions: 0,
    notes: ''
  });

  const [loading, setLoading] = useState(false);



  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        cpr: employee.cpr || '',
        designation: employee.designation || '',
        employment_type: employee.employment_type || 'permanent',
        salary_type: employee.salary_type || 'monthly',
        basic_pay: employee.basic_pay || 0,
        hourly_wage: employee.hourly_wage || 0,
        allowance: employee.allowance || 0,
        deductions: employee.deductions || 0,
        notes: employee.notes || ''
      });
    }
  }, [employee]);

  // Update salary type when employment type changes
  const handleEmploymentTypeChange = (type) => {
    setFormData({
      ...formData,
      employment_type: type,
      salary_type: type === 'permanent' ? 'monthly' : 'hourly',
      basic_pay: type === 'permanent' ? formData.basic_pay : 0,
      hourly_wage: type === 'flexi visa' ? formData.hourly_wage : 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const employeeData = {
        name: formData.name,
        cpr: formData.cpr,
        designation: formData.designation,
        employment_type: formData.employment_type,
        salary_type: formData.salary_type,
        basic_pay: formData.employment_type === 'permanent' ? parseFloat(formData.basic_pay) || 0 : 0,
        hourly_wage: formData.employment_type === 'flexi visa' ? parseFloat(formData.hourly_wage) || 0 : 0,
        // Set default rates based on employment type
        nt_rate: formData.employment_type === 'permanent' ? 0 : parseFloat(formData.hourly_wage) || 0,
        rot_rate: formData.employment_type === 'permanent' ? 0 : (parseFloat(formData.hourly_wage) || 0) * 1.25,
        hot_rate: formData.employment_type === 'permanent' ? 0 : (parseFloat(formData.hourly_wage) || 0) * 1.5,
        allowance: parseFloat(formData.allowance) || 0,
        deductions: parseFloat(formData.deductions) || 0,
        notes: formData.notes
      };

      let result;
      if (employee) {
        // Update existing employee
        const { data, error } = await supabase
          .from('employees')
          .update(employeeData)
          .eq('id', employee.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
        toast.success('Employee updated successfully!');
      } else {
        // Create new employee
        const { data, error } = await supabase
          .from('employees')
          .insert([employeeData])
          .select()
          .single();

        if (error) throw error;
        result = data;
        toast.success('Employee added successfully!');
      }

      onSave(result);
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error(error.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label flex items-center">
                <User size={16} className="mr-2" />
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label flex items-center">
                <Hash size={16} className="mr-2" />
                CPR Number *
              </label>
              <input
                type="text"
                value={formData.cpr}
                onChange={(e) => setFormData({...formData, cpr: e.target.value})}
                className="input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label flex items-center">
                <Briefcase size={16} className="mr-2" />
                Designation *
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({...formData, designation: e.target.value})}
                className="input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label flex items-center">
                <Calendar size={16} className="mr-2" />
                Employment Type *
              </label>
              <select
                value={formData.employment_type}
                onChange={(e) => handleEmploymentTypeChange(e.target.value)}
                className="input"
                required
              >
                <option value="permanent">Permanent Employee</option>
                <option value="flexi visa">Flexi Visa Employee</option>
              </select>
            </div>
          </div>

          {/* Salary Information */}
          <div className="border-t pt-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Salary Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.employment_type === 'permanent' ? (
                <div className="form-group">
                  <label className="form-label flex items-center">
                    <DollarSign size={16} className="mr-2" />
                    Basic Pay (Monthly) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.basic_pay}
                    onChange={(e) => setFormData({...formData, basic_pay: e.target.value})}
                    className="input"
                    placeholder="e.g., 3120.000"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Monthly basic pay for dynamic rate calculation
                  </p>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label flex items-center">
                    <Clock size={16} className="mr-2" />
                    Hourly Wage *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.hourly_wage}
                    onChange={(e) => setFormData({...formData, hourly_wage: e.target.value})}
                    className="input"
                    placeholder="e.g., 15.50"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Per hour wage for flexi visa employees
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Allowance and Deductions */}
          <div className="border-t pt-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Allowance & Deductions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Allowance</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.allowance}
                  onChange={(e) => setFormData({...formData, allowance: e.target.value})}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Deductions</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.deductions}
                  onChange={(e) => setFormData({...formData, deductions: e.target.value})}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="input"
              rows="3"
              placeholder="Additional notes about the employee..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save size={16} className="mr-2" />
                  {employee ? 'Update Employee' : 'Add Employee'}
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal; 