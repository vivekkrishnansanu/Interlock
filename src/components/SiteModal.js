import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Building, MapPin, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

const SiteModal = ({ site, onClose, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const isEditing = !!site;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm();

  useEffect(() => {
    if (site) {
      setValue('name', site.name);
      setValue('code', site.code);
      setValue('location', site.location);
      setValue('description', site.description || '');
      setValue('status', site.status);
      setValue('quotationAmount', site.quotationAmount || '');
      setValue('clientName', site.clientName || '');
      setValue('clientContact', site.clientContact || '');
      setValue('clientEmail', site.clientEmail || '');
      setValue('projectStartDate', site.projectStartDate || '');
      setValue('expectedEndDate', site.expectedEndDate || '');
    } else {
      reset();
      setValue('status', 'active');
    }
  }, [site, setValue, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Validate site code format
      if (!/^[A-Z0-9#\-]+$/.test(data.code)) {
        toast.error('Site code can only contain uppercase letters, numbers, #, and -');
        return;
      }

      const siteData = {
        ...data,
        description: data.description.trim() || null,
        quotationAmount: parseFloat(data.quotationAmount) || 0,
        clientName: data.clientName.trim(),
        clientContact: data.clientContact.trim(),
        clientEmail: data.clientEmail.trim(),
        projectStartDate: data.projectStartDate,
        expectedEndDate: data.expectedEndDate
      };

      if (isEditing) {
        // Update existing site
        const updatedSite = {
          ...site,
          ...siteData
        };
        onSaved(updatedSite);
      } else {
        // Create new site
        const newSite = {
          id: `site-${Date.now()}`,
          ...siteData
        };
        onSaved(newSite);
      }
    } catch (error) {
      console.error('Error saving site:', error);
      toast.error('Failed to save site');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Building className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? 'Edit Site' : 'Add Site'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Site Name */}
            <div className="form-group">
              <label className="form-label">
                Site Name *
              </label>
              <input
                type="text"
                {...register('name', { 
                  required: 'Site name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
                className="input"
                placeholder="Enter site name"
              />
              {errors.name && (
                <p className="form-error">{errors.name.message}</p>
              )}
            </div>

            {/* Site Code */}
            <div className="form-group">
              <label className="form-label">
                Site Code *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  {...register('code', { 
                    required: 'Site code is required',
                    pattern: {
                      value: /^[A-Z0-9#\-]+$/,
                      message: 'Code can only contain uppercase letters, numbers, #, and -'
                    }
                  })}
                  className="input pl-10"
                  placeholder="WS#91"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              {errors.code && (
                <p className="form-error">{errors.code.message}</p>
              )}
              <p className="form-help">
                Use uppercase letters, numbers, #, and - only (e.g., WS#91, SITE-A)
              </p>
            </div>

            {/* Location */}
            <div className="form-group">
              <label className="form-label">
                Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  {...register('location', { 
                    required: 'Location is required',
                    minLength: { value: 3, message: 'Location must be at least 3 characters' }
                  })}
                  className="input pl-10"
                  placeholder="Enter site location"
                />
              </div>
              {errors.location && (
                <p className="form-error">{errors.location.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">
                Description
              </label>
              <textarea
                {...register('description')}
                rows="3"
                className="input"
                placeholder="Enter site description (optional)"
              />
            </div>

            {/* Quotation Amount */}
            <div className="form-group">
              <label className="form-label">
                Quotation Amount (BHD) *
              </label>
              <input
                type="number"
                step="0.001"
                min="0"
                {...register('quotationAmount', { 
                  required: 'Quotation amount is required',
                  min: { value: 0, message: 'Amount must be positive' }
                })}
                className="input"
                placeholder="Enter total expected amount"
              />
              {errors.quotationAmount && (
                <p className="form-error">{errors.quotationAmount.message}</p>
              )}
              <p className="form-help">
                Total expected amount quoted to the client for this project
              </p>
            </div>

            {/* Client Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">
                  Client Name *
                </label>
                <input
                  type="text"
                  {...register('clientName', { 
                    required: 'Client name is required',
                    minLength: { value: 2, message: 'Client name must be at least 2 characters' }
                  })}
                  className="input"
                  placeholder="Enter client name"
                />
                {errors.clientName && (
                  <p className="form-error">{errors.clientName.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Client Contact Number *
                </label>
                <input
                  type="tel"
                  {...register('clientContact', { 
                    required: 'Client contact is required',
                    pattern: {
                      value: /^[\+]?[0-9\s\-\(\)]+$/,
                      message: 'Please enter a valid phone number'
                    }
                  })}
                  className="input"
                  placeholder="Enter contact number"
                />
                {errors.clientContact && (
                  <p className="form-error">{errors.clientContact.message}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Client Email *
              </label>
              <input
                type="email"
                {...register('clientEmail', { 
                  required: 'Client email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address'
                  }
                })}
                className="input"
                placeholder="Enter client email"
              />
              {errors.clientEmail && (
                <p className="form-error">{errors.clientEmail.message}</p>
              )}
            </div>

            {/* Project Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">
                  Project Start Date *
                </label>
                <input
                  type="date"
                  {...register('projectStartDate', { 
                    required: 'Project start date is required'
                  })}
                  className="input"
                />
                {errors.projectStartDate && (
                  <p className="form-error">{errors.projectStartDate.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Expected End Date *
                </label>
                <input
                  type="date"
                  {...register('expectedEndDate', { 
                    required: 'Expected end date is required'
                  })}
                  className="input"
                />
                {errors.expectedEndDate && (
                  <p className="form-error">{errors.expectedEndDate.message}</p>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label">
                Status *
              </label>
              <select
                {...register('status', { required: 'Status is required' })}
                className="input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
              </select>
              {errors.status && (
                <p className="form-error">{errors.status.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                <Save size={16} className="mr-2" />
                {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SiteModal; 