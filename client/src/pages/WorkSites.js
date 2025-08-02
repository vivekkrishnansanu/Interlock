import React, { useState, useEffect } from 'react';
import { MapPin, Users, Calendar, Filter, Search, BarChart3, Building, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom'; // Added Link import

const WorkSites = () => {
  const [workSites, setWorkSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [sites, setSites] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [siteSummary, setSiteSummary] = useState([]);

  // Demo data
  const demoEmployees = [
    {
      id: 'emp-1',
      name: 'DEEPAK KUMAR',
      cpr: '123456789',
      category: 'General',
      currentRate: 130.0
    },
    {
      id: 'emp-2',
      name: 'ARUNKUMAR PC',
      cpr: '987654321',
      category: 'Supervisor',
      currentRate: 210.0
    },
    {
      id: 'emp-3',
      name: 'AMAL KOORARA',
      cpr: '456789123',
      category: 'Skilled',
      currentRate: 130.0
    },
    {
      id: 'emp-4',
      name: 'SHIFIN RAPHEL',
      cpr: '789123456',
      category: 'General',
      currentRate: 130.0
    },
    {
      id: 'emp-5',
      name: 'ARUN MON',
      cpr: '321654987',
      category: 'Supervisor',
      currentRate: 190.0
    }
  ];

  const demoDailyLogs = [
    {
      id: 'log-1',
      employeeId: 'emp-1',
      employeeName: 'DEEPAK KUMAR',
      date: '2025-03-01',
      siteRef: 'WS#91',
      ntHours: 8,
      notHours: 2,
      hotHours: 0,
      totalPay: 275.0
    },
    {
      id: 'log-2',
      employeeId: 'emp-1',
      employeeName: 'DEEPAK KUMAR',
      date: '2025-03-02',
      siteRef: 'Site A',
      ntHours: 8,
      notHours: 1,
      hotHours: 0,
      totalPay: 247.5
    },
    {
      id: 'log-3',
      employeeId: 'emp-1',
      employeeName: 'DEEPAK KUMAR',
      date: '2025-03-03',
      siteRef: 'ILS#175',
      ntHours: 8,
      notHours: 0,
      hotHours: 0,
      totalPay: 1040.0
    },
    {
      id: 'log-4',
      employeeId: 'emp-2',
      employeeName: 'ARUNKUMAR PC',
      date: '2025-03-01',
      siteRef: 'WS#86',
      ntHours: 8,
      notHours: 1,
      hotHours: 1,
      totalPay: 367.5
    },
    {
      id: 'log-5',
      employeeId: 'emp-2',
      employeeName: 'ARUNKUMAR PC',
      date: '2025-03-02',
      siteRef: 'Site B',
      ntHours: 8,
      notHours: 2,
      hotHours: 0,
      totalPay: 315.0
    },
    {
      id: 'log-6',
      employeeId: 'emp-3',
      employeeName: 'AMAL KOORARA',
      date: '2025-03-01',
      siteRef: 'Site A',
      ntHours: 8,
      notHours: 0,
      hotHours: 0,
      totalPay: 1040.0
    },
    {
      id: 'log-7',
      employeeName: 'SHIFIN RAPHEL',
      date: '2025-03-02',
      siteRef: 'Site A',
      ntHours: 8,
      notHours: 1,
      hotHours: 0,
      totalPay: 1170.0
    },
    {
      id: 'log-8',
      employeeName: 'ARUN MON',
      date: '2025-03-03',
      siteRef: 'Site B',
      ntHours: 8,
      notHours: 2,
      hotHours: 0,
      totalPay: 1900.0
    }
  ];

  useEffect(() => {
    fetchWorkSitesData();
  }, []);

  useEffect(() => {
    const summary = getSiteSummary();
    setSiteSummary(summary);
  }, [workSites]);

  useEffect(() => {
    filterWorkSites();
  }, [selectedSite, selectedEmployee, dateRange]);

  const fetchWorkSitesData = async () => {
    try {
      setLoading(true);
      
      // Extract unique sites and employees
      const uniqueSites = [...new Set(demoDailyLogs.map(log => log.siteRef))];
      setSites(uniqueSites);
      setEmployees(demoEmployees);
      
      // Create site summaries instead of individual logs
      const siteSummaries = getSiteSummaries();
      setWorkSites(siteSummaries);
    } catch (error) {
      console.error('Error fetching work sites data:', error);
      toast.error('Failed to load work sites data');
    } finally {
      setLoading(false);
    }
  };

  const getSiteSummaries = () => {
    const siteStats = {};
    
    demoDailyLogs.forEach(log => {
      if (!siteStats[log.siteRef]) {
        siteStats[log.siteRef] = {
          id: log.siteRef,
          name: log.siteRef,
          code: log.siteRef,
          totalEmployees: new Set(),
          totalHours: 0,
          totalPay: 0,
          workDays: 0,
          status: 'active'
        };
      }
      
      siteStats[log.siteRef].totalEmployees.add(log.employeeName);
      siteStats[log.siteRef].totalHours += (log.ntHours + log.notHours + log.hotHours);
      siteStats[log.siteRef].totalPay += log.totalPay;
      siteStats[log.siteRef].workDays += 1;
    });

    return Object.values(siteStats).map(site => ({
      ...site,
      employeeCount: site.totalEmployees.size,
      totalEmployees: undefined // Remove the Set from the final object
    }));
  };

  const filterWorkSites = () => {
    let filtered = getSiteSummaries(); // Get fresh site summaries

    // Filter by site
    if (selectedSite) {
      filtered = filtered.filter(site => site.name === selectedSite);
    }

    // Filter by employee
    if (selectedEmployee) {
      const selectedEmployeeName = demoEmployees.find(emp => emp.id === selectedEmployee)?.name;
      if (selectedEmployeeName) {
        filtered = filtered.filter(site => {
          // Check if this employee worked at this site
          return demoDailyLogs.some(log => 
            log.siteRef === site.name && log.employeeName === selectedEmployeeName
          );
        });
      }
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const today = new Date();
      const daysAgo = parseInt(dateRange);
      const cutoffDate = new Date(today.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      
      filtered = filtered.filter(site => {
        // Check if there are any logs for this site within the date range
        return demoDailyLogs.some(log => {
          if (log.siteRef !== site.name) return false;
          const logDate = new Date(log.date);
          return logDate >= cutoffDate;
        });
      });
    }

    setWorkSites(filtered);
  };

  const getSiteSummary = () => {
    const siteStats = {};
    
    workSites.forEach(site => {
      if (!siteStats[site.name]) {
        siteStats[site.name] = {
          site: site.name,
          totalEmployees: site.employeeCount,
          totalHours: site.totalHours,
          totalPay: site.totalPay,
          workDays: site.workDays
        };
      }
    });

    return Object.values(siteStats);
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

  const handleViewDetails = (site) => {
    // Navigate to site detail view or show modal
    console.log('Viewing details for site:', site);
    // You can implement navigation or modal here
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Work Sites</h1>
        <p className="mt-1 text-sm text-gray-600">
          Track where employees are working across different sites
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site
            </label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="input"
            >
              <option value="">All Sites</option>
              {sites.map((site) => (
                <option key={site} value={site}>{site}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="input"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input"
            >
              <option value="all">All Time</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedSite('');
                setSelectedEmployee('');
                setDateRange('all');
              }}
              className="btn btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Site Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {siteSummary.map((summary) => (
          <Link key={summary.site} to="/daily-logs" className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{summary.site}</dt>
                  <dd className="text-lg font-medium text-gray-900">{summary.totalEmployees} employees</dd>
                  <dd className="text-sm text-gray-500">{summary.workDays} work days</dd>
                  <dd className="text-sm font-medium text-green-600">{formatCurrency(summary.totalPay)}</dd>
                </dl>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Work Sites Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Work Sites Overview</h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Site Name</th>
                <th>Site Code</th>
                <th>Employees</th>
                <th>Total Hours</th>
                <th>Total Pay</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workSites.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>No work sites found</p>
                  </td>
                </tr>
              ) : (
                workSites.map((site) => (
                  <tr key={site.id} className="hover:bg-gray-50">
                    <td className="font-medium">{site.name}</td>
                    <td>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {site.code}
                      </span>
                    </td>
                    <td className="text-center">{site.employeeCount}</td>
                    <td className="text-center">{site.totalHours}</td>
                    <td className="font-semibold text-green-600 tabular-nums">
                      {formatCurrency(site.totalPay)}
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        site.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {site.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(site)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye size={16} />
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

      {/* Employee Site Summary */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Employee Site Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Sites Worked</th>
                <th>Total Days</th>
                <th>Total Hours</th>
                <th>Total Pay</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => {
                const employeeLogs = demoDailyLogs.filter(log => log.employeeName === employee.name);
                const sitesWorked = [...new Set(employeeLogs.map(log => log.siteRef))];
                const totalDays = employeeLogs.length;
                const totalHours = employeeLogs.reduce((sum, log) => 
                  sum + log.ntHours + log.notHours + log.hotHours, 0
                );
                const totalPay = employeeLogs.reduce((sum, log) => sum + log.totalPay, 0);

                return (
                  <tr key={employee.id}>
                    <td className="font-medium">{employee.name}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {sitesWorked.map((site) => (
                          <span key={site} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {site}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{totalDays}</td>
                    <td>{totalHours}</td>
                    <td className="font-medium text-green-600">{formatCurrency(totalPay)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkSites; 