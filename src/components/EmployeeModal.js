import React, { useState, useEffect } from 'react';
import { X, Save, User, Building, DollarSign, Calendar, Hash, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const EmployeeModal = ({ employee, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    cpr: '',
    designation: '',
    site_id: '',
    category: 'General',
    nt_rate: 0,
    rot_rate: 0,
    hot_rate: 0,
    allowance: 0,
    deductions: 0,
    notes: ''
  });
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch sites for dropdown
  useEffect(() => {
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
      }
    };

    fetchSites();
  }, []);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        cpr: employee.cpr || '',
        designation: employee.designation || '',
        site_id: employee.site_id || '',
        category: employee.category || 'General',
        nt_rate: employee.nt_rate || 0,
        rot_rate: employee.rot_rate || 0,
        hot_rate: employee.hot_rate || 0,
        allowance: employee.allowance || 0,
        deductions: employee.deductions || 0,
        notes: employee.notes || ''
      });
    }
  }, [employee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const employeeData = {
        name: formData.name,
        cpr: formData.cpr,
        designation: formData.designation,
        site_id: formData.site_id || null,
        category: formData.category,
        nt_rate: parseFloat(formData.nt_rate) || 0,
        rot_rate: parseFloat(formData.rot_rate) || 0,
        hot_rate: parseFloat(formData.hot_rate) || 0,
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
                <Building size={16} className="mr-2" />
                Work Site
              </label>
              <select
                value={formData.site_id}
                onChange={(e) => setFormData({...formData, site_id: e.target.value})}
                className="input"
              >
                <option value="">Select Site</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name} ({site.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="input"
              >
                <option value="General">General</option>
                <option value="Skilled">Skilled</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
          </div>

          {/* Rate Information */}
          <div className="border-t pt-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Rate Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label flex items-center">
                  <DollarSign size={16} className="mr-2" />
                  NT Rate *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.nt_rate}
                  onChange={(e) => setFormData({...formData, nt_rate: e.target.value})}
                  className="input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label flex items-center">
                  <DollarSign size={16} className="mr-2" />
                  ROT Rate *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rot_rate}
                  onChange={(e) => setFormData({...formData, rot_rate: e.target.value})}
                  className="input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label flex items-center">
                  <DollarSign size={16} className="mr-2" />
                  HOT Rate *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.hot_rate}
                  onChange={(e) => setFormData({...formData, hot_rate: e.target.value})}
                  className="input"
                  required
                />
              </div>
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