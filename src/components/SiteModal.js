import React, { useState, useEffect } from 'react';
import { X, Save, Building, MapPin, Hash } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const SiteModal = ({ site, onClose, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    description: '',
    status: 'active'
  });
  const isEditing = !!site;

  useEffect(() => {
    if (site) {
      setFormData({
        name: site.name || '',
        code: site.code || '',
        location: site.location || '',
        description: site.description || '',
        status: site.status || 'active'
      });
    } else {
      setFormData({
        name: '',
        code: '',
        location: '',
        description: '',
        status: 'active'
      });
    }
  }, [site]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate site code format
      if (!/^[A-Z0-9#\-]+$/.test(formData.code)) {
        toast.error('Site code can only contain uppercase letters, numbers, #, and -');
        return;
      }

      const siteData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        location: formData.location.trim() || null,
        description: formData.description.trim() || null,
        status: formData.status
      };

      let result;
      if (isEditing) {
        // Update existing site
        const { data, error } = await supabase
          .from('sites')
          .update(siteData)
          .eq('id', site.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
        toast.success('Site updated successfully!');
      } else {
        // Create new site
        const { data, error } = await supabase
          .from('sites')
          .insert([siteData])
          .select()
          .single();

        if (error) throw error;
        result = data;
        toast.success('Site added successfully!');
      }

      onSaved(result);
    } catch (error) {
      console.error('Error saving site:', error);
      toast.error(error.message || 'Failed to save site');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Building className="h-6 w-6 text-blue-600" />
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label flex items-center">
                <Building size={16} className="mr-2" />
                Site Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input"
                required
                placeholder="Enter site name"
              />
            </div>
            <div className="form-group">
              <label className="form-label flex items-center">
                <Hash size={16} className="mr-2" />
                Site Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className="input"
                required
                placeholder="e.g., SITE001"
                maxLength="10"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use uppercase letters, numbers, #, and - only
              </p>
            </div>
          </div>

          {/* Location and Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label flex items-center">
                <MapPin size={16} className="mr-2" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="input"
                placeholder="Enter site location"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="input"
              rows="3"
              placeholder="Enter site description..."
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
                  {isEditing ? 'Update Site' : 'Add Site'}
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiteModal; 