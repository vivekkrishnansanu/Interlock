import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Filter, 
  Download, 
  Search,
  DollarSign,
  TrendingUp,
  CalendarDays,
  Building,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMonth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom'; // Added Link import

const Timecard = () => {
  const { user } = useAuth();
  const { selectedMonth, isCurrentMonth, getSelectedMonthName } = useMonth();
  
  // State for filters and data
  const [timecardData, setTimecardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState('');
  const [dateRange, setDateRange] = useState('month'); // month, week, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [availableSites, setAvailableSites] = useState([]);
  const [summary, setSummary] = useState({
    totalDays: 0,
    totalHours: 0,
    normalHours: 0,
    overtimeHours: 0,
    holidayOvertimeHours: 0,
    totalPay: 0,
    averageHoursPerDay: 0
  });

  useEffect(() => {
    fetchTimecardData();
    fetchAvailableSites();
  }, [selectedMonth, selectedSite, dateRange, startDate, endDate]);

  const fetchAvailableSites = async () => {
    try {
      // Sample sites - in real app, this would come from API
      const sites = [
        { id: 'site-1', name: 'Workshop Site #91', code: 'WS#91' },
        { id: 'site-2', name: 'Workshop Site #86', code: 'WS#86' },
        { id: 'site-3', name: 'Site A', code: 'SITE-A' },
        { id: 'site-4', name: 'Site B', code: 'SITE-B' }
      ];
      setAvailableSites(sites);
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const fetchTimecardData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate sample timecard data for the current user
      const sampleData = generateSampleTimecardData();
      
      // Apply filters
      let filteredData = sampleData;
      
      // Filter by site
      if (selectedSite) {
        filteredData = filteredData.filter(entry => entry.siteId === selectedSite);
      }
      
      // Filter by date range
      const dateFilteredData = filterByDateRange(filteredData);
      
      setTimecardData(dateFilteredData);
      calculateSummary(dateFilteredData);
    } catch (error) {
      console.error('Error fetching timecard data:', error);
      toast.error('Failed to load timecard data');
    } finally {
      setLoading(false);
    }
  };

  const generateSampleTimecardData = () => {
    // Generate realistic timecard data for the selected month
    const daysInMonth = new Date(selectedMonth.year, selectedMonth.month, 0).getDate();
    const currentDate = new Date();
    const isCurrentMonthSelected = isCurrentMonth;
    
    const data = [];
    const sites = [
      { id: 'site-1', name: 'Workshop Site #91', code: 'WS#91' },
      { id: 'site-2', name: 'Workshop Site #86', code: 'WS#86' },
      { id: 'site-3', name: 'Site A', code: 'SITE-A' }
    ];
    
    // Generate data for each working day
    for (let day = 1; day <= daysInMonth; day++) {
      // Skip weekends (Saturday = 6, Sunday = 0)
      const date = new Date(selectedMonth.year, selectedMonth.month - 1, day);
      const dayOfWeek = date.getDay();
      
      // Skip if it's current month and day hasn't happened yet
      if (isCurrentMonthSelected && day > currentDate.getDate()) {
        continue;
      }
      
      // Skip weekends (optional - some employees work weekends)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue;
      }
      
      // Randomly assign work days (80% chance of working)
      if (Math.random() > 0.2) {
        const site = sites[Math.floor(Math.random() * sites.length)];
        const normalHours = 8; // Standard 8-hour day
        const overtimeHours = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0; // 30% chance of overtime
        const holidayOvertimeHours = Math.random() > 0.9 ? Math.floor(Math.random() * 2) + 1 : 0; // 10% chance of holiday overtime
        
        data.push({
          id: `entry-${day}`,
          date: date.toISOString().split('T')[0],
          dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
          siteId: site.id,
          siteName: site.name,
          siteCode: site.code,
          normalHours,
          overtimeHours,
          holidayOvertimeHours,
          totalHours: normalHours + overtimeHours + holidayOvertimeHours,
          isHoliday: holidayOvertimeHours > 0,
          isFriday: dayOfWeek === 5,
          totalPay: calculateDailyPay(normalHours, overtimeHours, holidayOvertimeHours)
        });
      }
    }
    
    return data;
  };

  const calculateDailyPay = (normalHours, overtimeHours, holidayOvertimeHours) => {
    // Sample rate - in real app, this would come from employee data
    const normalRate = 15; // BHD per hour
    const overtimeRate = 22.5; // 1.5x normal rate
    const holidayRate = 30; // 2x normal rate
    
    return (normalHours * normalRate) + (overtimeHours * overtimeRate) + (holidayOvertimeHours * holidayRate);
  };

  const filterByDateRange = (data) => {
    if (dateRange === 'month') {
      return data; // Already filtered by month
    } else if (dateRange === 'week') {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return data.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= weekAgo && entryDate <= today;
      });
    } else if (dateRange === 'custom' && startDate && endDate) {
      return data.filter(entry => {
        return entry.date >= startDate && entry.date <= endDate;
      });
    }
    return data;
  };

  const calculateSummary = (data) => {
    const summary = data.reduce((acc, entry) => {
      acc.totalDays += 1;
      acc.totalHours += entry.totalHours;
      acc.normalHours += entry.normalHours;
      acc.overtimeHours += entry.overtimeHours;
      acc.holidayOvertimeHours += entry.holidayOvertimeHours;
      acc.totalPay += entry.totalPay;
      return acc;
    }, {
      totalDays: 0,
      totalHours: 0,
      normalHours: 0,
      overtimeHours: 0,
      holidayOvertimeHours: 0,
      totalPay: 0,
      averageHoursPerDay: 0
    });

    summary.averageHoursPerDay = summary.totalDays > 0 ? summary.totalHours / summary.totalDays : 0;
    setSummary(summary);
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
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const exportTimecard = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timecard-${user?.name || 'employee'}-${getSelectedMonthName()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Timecard exported successfully!');
  };

  const generateCSV = () => {
    const headers = ['Date', 'Day', 'Site', 'Normal Hours', 'Overtime Hours', 'Holiday OT Hours', 'Total Hours', 'Total Pay'];
    const rows = timecardData.map(entry => [
      entry.date,
      entry.dayOfWeek,
      entry.siteName,
      entry.normalHours,
      entry.overtimeHours,
      entry.holidayOvertimeHours,
      entry.totalHours,
      formatCurrency(entry.totalPay)
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
          <h1 className="text-2xl font-bold text-gray-900">My Timecard</h1>
          <p className="mt-1 text-sm text-gray-600">
            {getSelectedMonthName()} work hours and site assignments
            {!isCurrentMonth && (
              <span className="ml-2 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md">
                Historical View
              </span>
            )}
          </p>
        </div>
        <button
          onClick={exportTimecard}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Download size={20} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Site Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building size={16} className="inline mr-1" />
              Site
            </label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="input"
            >
              <option value="">All Sites</option>
              {availableSites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} ({site.code})
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input"
            >
              <option value="month">Current Month</option>
              <option value="week">Last 7 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/daily-logs" className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CalendarDays size={20} className="text-blue-600" />
              </div>
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Work Days</p>
              <p className="text-xl lg:text-2xl font-semibold text-gray-900 truncate">{summary.totalDays}</p>
            </div>
          </div>
        </Link>

        <Link to="/daily-logs" className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-green-600" />
              </div>
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Total Hours</p>
              <p className="text-xl lg:text-2xl font-semibold text-gray-900 truncate">{summary.totalHours}</p>
            </div>
          </div>
        </Link>

        <Link to="/daily-logs" className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-orange-600" />
              </div>
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Overtime Hours</p>
              <p className="text-xl lg:text-2xl font-semibold text-gray-900 truncate">{summary.overtimeHours + summary.holidayOvertimeHours}</p>
            </div>
          </div>
        </Link>

        <Link to="/monthly-summaries" className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-purple-600" />
              </div>
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Total Pay</p>
              <p className="text-xl lg:text-2xl font-semibold text-gray-900 tabular-nums truncate">{formatCurrency(summary.totalPay)}</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Detailed Breakdown */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Hourly Breakdown</h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Site</th>
                <th className="text-center">Normal Hours</th>
                <th className="text-center">Overtime Hours</th>
                <th className="text-center">Holiday OT</th>
                <th className="text-center">Total Hours</th>
                <th className="text-right">Daily Pay</th>
              </tr>
            </thead>
            <tbody>
              {timecardData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    No timecard entries found for the selected filters.
                  </td>
                </tr>
              ) : (
                timecardData.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="font-medium">{formatDate(entry.date)}</td>
                    <td className="text-gray-600">{entry.dayOfWeek}</td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="font-medium">{entry.siteName}</span>
                        <span className="text-xs text-gray-500">({entry.siteCode})</span>
                      </div>
                    </td>
                    <td className="text-center font-medium">{entry.normalHours}</td>
                    <td className="text-center">
                      <span className={`font-medium ${entry.overtimeHours > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                        {entry.overtimeHours}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`font-medium ${entry.holidayOvertimeHours > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        {entry.holidayOvertimeHours}
                      </span>
                    </td>
                    <td className="text-center font-semibold">{entry.totalHours}</td>
                    <td className="text-right font-semibold tabular-nums">{formatCurrency(entry.totalPay)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hourly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Normal Hours</h4>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{summary.normalHours}</p>
            <p className="text-sm text-gray-600">Regular working hours</p>
          </div>
        </div>

        <div className="card p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Overtime Hours</h4>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">{summary.overtimeHours}</p>
            <p className="text-sm text-gray-600">Regular overtime</p>
          </div>
        </div>

        <div className="card p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Holiday Overtime</h4>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{summary.holidayOvertimeHours}</p>
            <p className="text-sm text-gray-600">Holiday/Weekend work</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timecard; 