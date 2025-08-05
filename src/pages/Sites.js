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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600 font-medium">Loading sites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Work Sites</h1>
              <p className="mt-2 text-gray-600">Manage your work sites and locations</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportSites}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <Download size={16} className="mr-2" />
                Export
              </button>
              <button
                onClick={handleAddSite}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <Plus size={16} className="mr-2" />
                Add Site
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search sites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              />
            </div>
          </div>
        </div>

        {/* Sites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <Building size={48} />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No sites found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'No sites match your search criteria.' : 'Get started by adding your first work site.'}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <button
                    onClick={handleAddSite}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <Plus size={16} className="mr-2" />
                    Add First Site
                  </button>
                </div>
              )}
            </div>
          ) : (
            filteredSites.map((site) => (
              <div key={site.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <MapPin size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{site.name}</h3>
                        <p className="text-sm text-gray-500">Code: {site.code}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditSite(site)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                        title="Edit site"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteSite(site.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                        title="Delete site"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Address:</span>
                      <p className="text-gray-600 mt-1">{site.address || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Contact:</span>
                      <p className="text-gray-600 mt-1">{site.contact_person || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Phone:</span>
                      <p className="text-gray-600 mt-1">{site.phone || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <p className="text-gray-600 mt-1">{site.email || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Site Modal would go here */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <Building size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingSite ? 'Edit Site' : 'Add New Site'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {editingSite ? 'Update site information' : 'Enter site details'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600">Site modal content would go here...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sites; 