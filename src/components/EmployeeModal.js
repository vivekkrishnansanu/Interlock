import React, { useState, useEffect } from 'react';
import { X, Save, User, Building, DollarSign, Calendar, Hash } from 'lucide-react';

const EmployeeModal = ({ employee, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    cpr: '',
    category: '',
    doj: '',
    employmentType: 'permanent',
    workType: '',
    salaryType: 'hourly',
    currentRate: '',
    previousRate: '',
    deductions: '',
    status: 'active'
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        cpr: employee.cpr || '',
        category: employee.category || '',
        doj: employee.doj || '',
        employmentType: employee.employmentType || 'permanent',
        workType: employee.workType || '',
        salaryType: employee.salaryType || 'hourly',
        currentRate: employee.currentRate || '',
        previousRate: employee.previousRate || '',
        deductions: employee.deductions || '',
        status: employee.status || 'active'
      });
    }
  }, [employee]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleEmploymentTypeChange = (newEmploymentType) => {
    setFormData({
      ...formData,
      employmentType: newEmploymentType,
      // Reset work type and salary type for flexi employees
      workType: newEmploymentType === 'flexi' ? 'site' : formData.workType,
      salaryType: newEmploymentType === 'flexi' ? 'hourly' : formData.salaryType
    });
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
                <Calendar size={16} className="mr-2" />
                Date of Joining *
                </label>
                <input
                type="date"
                value={formData.doj}
                onChange={(e) => setFormData({...formData, doj: e.target.value})}
                  className="input"
                required
                />
              </div>
            <div className="form-group">
              <label className="form-label flex items-center">
                <Building size={16} className="mr-2" />
                Employment Type *
                </label>
                <select
                value={formData.employmentType}
                onChange={(e) => handleEmploymentTypeChange(e.target.value)}
                className="input"
                required
              >
                <option value="permanent">Permanent</option>
                <option value="flexi">Flexi Visa</option>
              </select>
            </div>
          </div>

          {/* Employment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="input"
                >
                <option value="">Select Category</option>
                {formData.employmentType === 'flexi' ? (
                  <option value="Flexi Worker">Flexi Worker</option>
                ) : (
                  <>
                  <option value="Supervisor">Supervisor</option>
                    <option value="Technician">Technician</option>
                    <option value="Worker">Worker</option>
                  </>
                )}
                </select>
              </div>
            <div className="form-group">
              <label className="form-label">Work Type</label>
              <select
                value={formData.workType}
                onChange={(e) => setFormData({...formData, workType: e.target.value})}
                  className="input"
              >
                <option value="">Select Work Type</option>
                <option value="workshop">Workshop</option>
                <option value="site">Site</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Salary Type</label>
              <select
                value={formData.salaryType}
                onChange={(e) => setFormData({...formData, salaryType: e.target.value})}
                className="input"
                disabled={formData.employmentType === 'flexi'} // Flexi employees are always hourly
              >
                <option value="hourly">Hourly</option>
                {formData.employmentType === 'permanent' && (
                  <option value="fixed">Fixed</option>
                )}
              </select>
              {formData.employmentType === 'flexi' && (
                <p className="text-xs text-gray-500 mt-1">Flexi visa employees are always hourly</p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label flex items-center">
                <DollarSign size={16} className="mr-2" />
                Current Rate *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                value={formData.currentRate}
                onChange={(e) => setFormData({...formData, currentRate: parseFloat(e.target.value) || 0})}
                    className="input"
                placeholder={formData.salaryType === 'fixed' ? 'Monthly salary' : 'Hourly rate'}
                required
              />
                    </div>
                  </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Previous Rate</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.previousRate}
                onChange={(e) => setFormData({...formData, previousRate: parseFloat(e.target.value) || 0})}
                className="input"
                placeholder={formData.salaryType === 'fixed' ? 'Previous monthly salary' : 'Previous hourly rate'}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Deductions</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.deductions}
                onChange={(e) => setFormData({...formData, deductions: parseFloat(e.target.value) || 0})}
                className="input"
                placeholder="Monthly deductions"
              />
            </div>
          </div>

          {/* Allowance Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign size={16} className="text-blue-600" />
              <h4 className="text-sm font-medium text-gray-900">Allowance Management</h4>
            </div>
            <p className="text-sm text-gray-600">
              Employee allowances are managed separately in the <strong>Allowances</strong> section. 
              You can set up detailed allowance categories like petrol, mobile recharge, food, etc. 
              for each employee after creating their profile here.
            </p>
          </div>

          {/* Employment Type Info */}
          {formData.employmentType === 'flexi' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Building size={16} className="text-orange-600" />
                      </div>
                    </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-orange-800">Flexi Visa Employee</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    This employee is on a flexi visa (temporary/outsourced). They will always be on hourly basis and may have different work arrangements.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex items-center space-x-2"
              >
                <Save size={16} />
              <span>{employee ? 'Update Employee' : 'Add Employee'}</span>
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};

export default EmployeeModal; 