import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, MapPin, Building, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import SiteModal from '../components/SiteModal';

const Sites = () => {
  const { isEditor } = useAuth();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSite, setEditingSite] = useState(null);

  // Demo data for sites
  const demoSites = [
    {
      id: 'site-1',
      name: 'Workshop Site #91',
      code: 'WS#91',
      location: 'Industrial Area, Manama',
      description: 'Main workshop facility for mechanical work',
      status: 'active',
      employeeCount: 12,
      totalHours: 156,
      totalPay: 18750.000,
      quotationAmount: 25000.000,
      clientName: 'ABC Manufacturing Co.',
      clientContact: '+973 1700 0001',
      clientEmail: 'info@abcmanufacturing.bh',
      projectStartDate: '2025-01-15',
      expectedEndDate: '2025-06-30'
    },
    {
      id: 'site-2',
      name: 'Site A - Construction',
      code: 'SITE-A',
      location: 'Seef District, Manama',
      description: 'High-rise construction project',
      status: 'active',
      employeeCount: 8,
      totalHours: 98,
      totalPay: 12450.000,
      quotationAmount: 18000.000,
      clientName: 'Seef Properties Ltd.',
      clientContact: '+973 1700 0002',
      clientEmail: 'projects@seefproperties.bh',
      projectStartDate: '2025-02-01',
      expectedEndDate: '2025-08-15'
    },
    {
      id: 'site-3',
      name: 'ILS Project #175',
      code: 'ILS#175',
      location: 'Hidd Industrial Area',
      description: 'Infrastructure development project',
      status: 'active',
      employeeCount: 15,
      totalHours: 203,
      totalPay: 25680.000,
      quotationAmount: 35000.000,
      clientName: 'Hidd Industrial Services',
      clientContact: '+973 1700 0003',
      clientEmail: 'contracts@hiddindustrial.bh',
      projectStartDate: '2025-01-01',
      expectedEndDate: '2025-12-31'
    },
    {
      id: 'site-4',
      name: 'Workshop Site #86',
      code: 'WS#86',
      location: 'Sitra Industrial Area',
      description: 'Secondary workshop for electrical work',
      status: 'inactive',
      employeeCount: 6,
      totalHours: 45,
      totalPay: 5670.000,
      quotationAmount: 8000.000,
      clientName: 'Sitra Engineering Co.',
      clientContact: '+973 1700 0004',
      clientEmail: 'engineering@sitraco.bh',
      projectStartDate: '2024-10-01',
      expectedEndDate: '2025-03-31'
    },
    {
      id: 'site-5',
      name: 'Maintenance Site B',
      code: 'MS-B',
      location: 'Juffair, Manama',
      description: 'Building maintenance and repairs',
      status: 'completed',
      employeeCount: 4,
      totalHours: 32,
      totalPay: 3840.000,
      quotationAmount: 5000.000,
      clientName: 'Juffair Properties',
      clientContact: '+973 1700 0005',
      clientEmail: 'maintenance@juffairproperties.bh',
      projectStartDate: '2024-11-01',
      expectedEndDate: '2025-01-31'
    }
  ];

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    // Filter sites based on search and filters
    filterSites();
  }, [searchTerm, statusFilter]);

  const fetchSites = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setSites(demoSites);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching sites:', error);
      toast.error('Failed to fetch sites');
      setLoading(false);
    }
  };

  const filterSites = () => {
    let filtered = demoSites;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(site =>
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(site => site.status === statusFilter);
    }

    setSites(filtered);
  };

  const handleAddSite = () => {
    setEditingSite(null);
    setShowModal(true);
  };

  const handleEditSite = (site) => {
    setEditingSite(site);
    setShowModal(true);
  };

  const handleDeleteSite = async (site) => {
    if (window.confirm(`Are you sure you want to delete site "${site.name}"?`)) {
      try {
        // Simulate API call
        setSites(prev => prev.filter(s => s.id !== site.id));
        toast.success('Site deleted successfully');
      } catch (error) {
        console.error('Error deleting site:', error);
        toast.error('Failed to delete site');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingSite(null);
  };

  const handleSiteSaved = (savedSite) => {
    if (editingSite) {
      // Update existing site
      setSites(prev => prev.map(site => 
        site.id === savedSite.id ? savedSite : site
      ));
      toast.success('Site updated successfully');
    } else {
      // Add new site
      const newSite = {
        ...savedSite,
        id: `site-${Date.now()}`,
        employeeCount: 0,
        totalHours: 0,
        totalPay: 0
      };
      setSites(prev => [newSite, ...prev]);
      toast.success('Site created successfully');
    }
    setShowModal(false);
  };

  const formatCurrency = (amount) => {
    if (isNaN(amount) || amount === null || amount === undefined) return 'BHD 0';
    return new Intl.NumberFormat('en-BH', {
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'completed':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Sites</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage work sites and track employee assignments
          </p>
        </div>
        {isEditor && (
          <button
            onClick={handleAddSite}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Site</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search sites by name, code, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sites Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Sites List</h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Site Name</th>
                <th>Site Code</th>
                <th>Location</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>No sites found</p>
                    {isEditor && (
                      <button
                        onClick={handleAddSite}
                        className="mt-2 text-primary-600 hover:text-primary-500"
                      >
                        Add your first site
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                sites.map((site) => (
                  <tr key={site.id} className="hover:bg-gray-50">
                    <td className="font-medium">{site.name}</td>
                    <td>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {site.code}
                      </span>
                    </td>
                    <td>{site.location}</td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        site.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {site.status}
                      </span>
                    </td>
                    <td>{formatDate(site.createdDate)}</td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditSite(site)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteSite(site)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={16} />
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

      {/* Empty State */}
      {sites.length === 0 && (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sites found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first work site.'
            }
          </p>
          {isEditor && !searchTerm && !statusFilter && (
            <button
              onClick={handleAddSite}
              className="btn btn-primary"
            >
              Add Your First Site
            </button>
          )}
        </div>
      )}

      {/* Site Modal */}
      {showModal && (
        <SiteModal
          site={editingSite}
          onClose={handleModalClose}
          onSaved={handleSiteSaved}
        />
      )}
    </div>
  );
};

export default Sites; 