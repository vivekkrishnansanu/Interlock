import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MapPin, 
  Edit, 
  Trash2, 
  Building,
  Download 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const Sites = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    description: '',
    status: 'active'
  });

  // Fetch sites from Supabase
  const fetchSites = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setSites(data || []);
    } catch (error) {
      console.error('Error fetching sites:', error);
      toast.error('Failed to fetch sites');
      setSites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  // Filter sites
  const filteredSites = sites.filter(site => 
    site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (site.location && site.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddSite = () => {
    setEditingSite(null);
    setFormData({
      name: '',
      code: '',
      location: '',
      description: '',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEditSite = (site) => {
    setEditingSite(site);
    setFormData({
      name: site.name,
      code: site.code,
      location: site.location || '',
      description: site.description || '',
      status: site.status || 'active'
    });
    setShowModal(true);
  };

  const handleDeleteSite = async (siteId) => {
    if (!window.confirm('Are you sure you want to delete this site?')) return;
    
    try {
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', siteId);

      if (error) throw error;
      
      toast.success('Site deleted successfully');
      fetchSites();
    } catch (error) {
      console.error('Error deleting site:', error);
      toast.error('Failed to delete site');
    }
  };

  const handleSaveSite = async (savedSite) => {
    setShowModal(false);
    setEditingSite(null);
    await fetchSites(); // Refresh the list
  };

  const exportSites = () => {
    const csvContent = [
      ['Name', 'Code', 'Address', 'Contact Person', 'Phone', 'Email'],
      ...filteredSites.map(site => [
        site.name,
        site.code,
        site.address,
        site.contact_person,
        site.phone,
        site.email
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sites.csv';
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
          <h1 className="text-2xl font-bold text-gray-900">Work Sites</h1>
          <p className="text-gray-600">Manage your work sites and locations</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-sm">
          <button
            onClick={exportSites}
            className="btn btn-outline"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={handleAddSite}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Add Site
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="card-body">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
        </div>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
        {filteredSites.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Building size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sites found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'No sites match your search' : 'Get started by adding your first work site'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddSite}
                className="btn btn-primary"
              >
                <Plus size={16} />
                Add First Site
              </button>
            )}
          </div>
        ) : (
          filteredSites.map((site) => (
            <div key={site.id} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-sm">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MapPin size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{site.name}</h3>
                      <p className="text-sm text-gray-500">Code: {site.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-sm">
                    <button
                      onClick={() => handleEditSite(site)}
                      className="btn btn-ghost btn-sm"
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteSite(site.id)}
                      className="btn btn-ghost btn-sm text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Address:</span>
                    <p className="text-gray-600">{site.address || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Contact:</span>
                    <p className="text-gray-600">{site.contact_person || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <p className="text-gray-600">{site.phone || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <p className="text-gray-600">{site.email || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Site Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingSite ? 'Edit Site' : 'Add New Site'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="form-input"
                    placeholder="Enter site name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="form-input"
                    placeholder="Enter site code"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="form-textarea"
                    placeholder="Enter site address"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                    className="form-input"
                    placeholder="Enter contact person name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="form-input"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="form-input"
                    placeholder="Enter email address"
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
                  onClick={handleSaveSite}
                  disabled={!formData.name || !formData.code}
                  className="btn btn-primary flex-1"
                >
                  {editingSite ? 'Update' : 'Create'} Site
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sites; 