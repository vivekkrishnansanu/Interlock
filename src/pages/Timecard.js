import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Download, 
  Search, 
  Filter,
  User,
  MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const Timecard = () => {
  const { userProfile } = useAuth();
  const [timecardData, setTimecardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch timecard data from Supabase
  const fetchTimecardData = async () => {
    try {
      setLoading(true);
      
      // Fetch daily logs for the current user
      const { data, error } = await supabase
        .from('daily_logs')
        .select(`
          *,
          employees (
            id,
            name,
            designation,
            nt_rate,
            rot_rate,
            hot_rate
          ),
          sites (
            id,
            name,
            code
          )
        `)
        .eq('employee_id', userProfile?.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setTimecardData(data || []);
    } catch (error) {
      console.error('Error fetching timecard data:', error);
      toast.error('Failed to fetch timecard data');
      setTimecardData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile?.id) {
      fetchTimecardData();
    }
  }, [userProfile]);

  // Filter timecard data
  const filteredData = timecardData.filter(entry => {
    const matchesSearch = 
      entry.sites?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.sites?.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !filterDate || entry.date === filterDate;
    const matchesSite = !filterSite || entry.site_id === filterSite;
    
    return matchesSearch && matchesDate && matchesSite;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'site') {
      aValue = a.sites?.name || '';
      bValue = b.sites?.name || '';
    }
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const exportTimecard = () => {
    const csvContent = [
      ['Date', 'Site', 'Hours Worked', 'NT Hours', 'ROT Hours', 'HOT Hours', 'Total Pay'],
      ...sortedData.map(entry => [
        entry.date,
        entry.sites?.name || '',
        entry.hours_worked,
        entry.nt_hours,
        entry.rot_hours,
        entry.hot_hours,
        entry.total_pay
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timecard.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate summary statistics
  const totalHours = sortedData.reduce((sum, entry) => sum + (entry.hours_worked || 0), 0);
  const totalPay = sortedData.reduce((sum, entry) => sum + (entry.total_pay || 0), 0);
  const totalEntries = sortedData.length;

  // Get unique sites for filter
  const uniqueSites = [...new Set(timecardData.map(entry => entry.site_id))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userProfile?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No user profile found</h3>
          <p className="text-gray-500">Please log in to view your timecard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Timecard</h1>
          <p className="text-gray-600">Track your work hours and earnings</p>
        </div>
        <button
          onClick={exportTimecard}
          className="btn btn-outline"
        >
          <Download size={16} />
          Export
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}</p>
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
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">BHD {totalPay.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Work Days</p>
                <p className="text-2xl font-bold text-gray-900">{totalEntries}</p>
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
                  placeholder="Search by site..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Site Filter */}
            <div>
              <select
                value={filterSite}
                onChange={(e) => setFilterSite(e.target.value)}
                className="form-select"
              >
                <option value="">All Sites</option>
                {uniqueSites.map(siteId => {
                  const site = timecardData.find(entry => entry.site_id === siteId)?.sites;
                  return site ? (
                    <option key={siteId} value={siteId}>{site.name}</option>
                  ) : null;
                })}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Timecard Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <button
                      onClick={() => {
                        setSortBy('date');
                        setSortOrder(sortBy === 'date' && sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                      className="flex items-center gap-sm hover:text-blue-600"
                    >
                      Date
                      {sortBy === 'date' && (
                        <span className="text-blue-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th>
                    <button
                      onClick={() => {
                        setSortBy('site');
                        setSortOrder(sortBy === 'site' && sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                      className="flex items-center gap-sm hover:text-blue-600"
                    >
                      Site
                      {sortBy === 'site' && (
                        <span className="text-blue-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th>Hours Worked</th>
                  <th>NT Hours</th>
                  <th>ROT Hours</th>
                  <th>HOT Hours</th>
                  <th>Total Pay</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      {searchTerm || filterDate || filterSite
                        ? 'No entries match your filters'
                        : 'No timecard entries found. Your work hours will appear here once logged.'}
                    </td>
                  </tr>
                ) : (
                  sortedData.map((entry) => (
                    <tr key={entry.id}>
                      <td className="font-mono">{entry.date}</td>
                      <td>
                        <div className="flex items-center gap-sm">
                          <MapPin size={14} className="text-gray-400" />
                          <span>{entry.sites?.name}</span>
                        </div>
                      </td>
                      <td className="font-mono">{entry.hours_worked}</td>
                      <td className="font-mono">{entry.nt_hours}</td>
                      <td className="font-mono">{entry.rot_hours}</td>
                      <td className="font-mono">{entry.hot_hours}</td>
                      <td className="font-mono font-medium text-green-600">
                        BHD {entry.total_pay?.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timecard; 