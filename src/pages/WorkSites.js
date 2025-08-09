import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  MapPin, 
  Edit, 
  Trash2,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { calculateDailyWage, calculateEmployeeMonthlySummary } from '../utils/wageCalculator';
import toast from 'react-hot-toast';

const WorkSites = () => {
  const { userProfile } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch data from Supabase with role-based filtering
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching data for user:', userProfile?.email, 'Role:', userProfile?.role);
      
      // For demo users, show appropriate data based on role
      const demoEmails = ['leadership@interlock.com', 'admin@interlock.com', 'viewer@interlock.com'];
      const isDemoUser = demoEmails.includes(userProfile?.email);
      
      // Fetch employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, name, designation, sites(name)')
        .order('name', { ascending: true });

      if (employeesError) throw employeesError;

      // Fetch daily logs with employee rates and allowances
      const { data: logsData, error: logsError } = await supabase
        .from('daily_logs')
        .select(`
          *,
          employees (
            id,
            name,
            designation,
            nt_rate,
            rot_rate,
            hot_rate,
            hourly_wage,
            basic_pay,
            employment_type,
            salary_type,
            allowance
          ),
          sites (
            id,
            name,
            code
          )
        `)
        .order('date', { ascending: false });

      if (logsError) throw logsError;

      // Fetch sites with role-based filtering
      let sitesQuery = supabase
        .from('sites')
        .select('id, name, code')
        .order('name', { ascending: true });

      if (isDemoUser && userProfile?.role === 'leadership') {
        console.log('🔧 Leadership user - filtering out demo sites...');
        sitesQuery = sitesQuery
          .not('name', 'ilike', '%test%')
          .not('name', 'ilike', '%demo%')
          .not('name', 'ilike', '%dummy%');
      }

      const { data: sitesData, error: sitesError } = await sitesQuery;

      if (sitesError) throw sitesError;

      console.log('✅ Data fetched:', {
        employees: employeesData?.length || 0,
        logs: logsData?.length || 0,
        sites: sitesData?.length || 0
      });

      // Group multiple entries per employee per day and calculate combined totals
      const groupedLogs = {};
      
      (logsData || []).forEach(log => {
        const key = `${log.employee_id}-${log.date}`;
        
        if (!groupedLogs[key]) {
          groupedLogs[key] = {
            id: log.id, // Use first entry's ID
            date: log.date,
            employee_id: log.employee_id,
            employees: log.employees,
            sites: log.sites, // Use first entry's site
            nt_hours: 0,
            rot_hours: 0,
            hot_hours: 0,
            is_holiday: log.is_holiday || false,
            is_friday: log.is_friday || false,
            entries: []
          };
        }
        
        // Sum up hours from all entries for this employee on this date
        groupedLogs[key].nt_hours += log.nt_hours || 0;
        groupedLogs[key].rot_hours += log.rot_hours || 0;
        groupedLogs[key].hot_hours += log.hot_hours || 0;
        
        // Keep track of individual entries for detailed view
        groupedLogs[key].entries.push({
          site: log.sites?.code || log.sites?.name || 'Unknown',
          nt_hours: log.nt_hours || 0,
          rot_hours: log.rot_hours || 0,
          hot_hours: log.hot_hours || 0
        });
      });

      // Calculate total pay for each grouped daily log and flatten structure
      const logsWithPay = Object.values(groupedLogs).map(log => {
        let totalPay = 0;
        if (log.employees) {
          try {
            const wageCalculation = calculateDailyWage(log, log.employees);
            totalPay = wageCalculation.totalPay;
          } catch (error) {
            console.error('Error calculating wage for log:', log.date, error);
            totalPay = 0;
          }
        }
        
        return {
          ...log,
          // Flatten employee data
          employeeName: log.employees?.name || 'Unknown Employee',
          employeeDesignation: log.employees?.designation || '',
          // Flatten hours data (now combined from multiple entries)
          ntHours: log.nt_hours || 0,
          notHours: log.rot_hours || 0, // ROT hours mapped to notHours for display
          hotHours: log.hot_hours || 0,
          adjustmentHours: 0, // No adjustment hours in our data
          // Flatten site data (show multiple sites if applicable)
          siteRef: log.entries.length > 1 
            ? `${log.entries.length} sites` 
            : (log.sites?.code || log.sites?.name || 'Unknown Site'),
          siteName: log.entries.length > 1
            ? log.entries.map(e => e.site).join(', ')
            : (log.sites?.name || 'Unknown Site'),
          // Add calculated pay
          totalPay: totalPay,
          // Add day type flags
          isHoliday: log.is_holiday || false,
          isFriday: log.is_friday || false,
          // Add hours worked
          hours_worked: (log.nt_hours || 0) + (log.rot_hours || 0) + (log.hot_hours || 0)
        };
      });

      setEmployees(employeesData || []);
      setDailyLogs(logsWithPay || []);
      setSites(sitesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
      setEmployees([]);
      setDailyLogs([]);
      setSites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter daily logs
  const filteredLogs = dailyLogs.filter(log => {
    const matchesSearch = 
      log.employees?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.sites?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.sites?.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSite = !filterSite || log.site_id === filterSite;
    const matchesEmployee = !filterEmployee || log.employee_id === filterEmployee;
    const matchesDate = !filterDate || log.date === filterDate;
    
    return matchesSearch && matchesSite && matchesEmployee && matchesDate;
  });

  // Sort logs
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'employee') {
      aValue = a.employees?.name || '';
      bValue = b.employees?.name || '';
    } else if (sortBy === 'site') {
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

  const handleAddLog = () => {
    setEditingLog(null);
    setShowModal(true);
  };

  const handleEditLog = (log) => {
    setEditingLog(log);
    setShowModal(true);
  };

  const handleDeleteLog = async (logId) => {
    if (!window.confirm('Are you sure you want to delete this log entry?')) return;
    
    try {
      const { error } = await supabase
        .from('daily_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;
      
      toast.success('Log entry deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting log:', error);
      toast.error('Failed to delete log entry');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingLog(null);
  };

  const handleLogSaved = () => {
    fetchData();
    handleModalClose();
  };

  const exportLogs = () => {
    const csvContent = [
      ['Date', 'Employee', 'Site', 'Hours Worked', 'NT Hours', 'ROT Hours', 'HOT Hours', 'Total Pay'],
      ...sortedLogs.map(log => [
        log.date,
        log.employees?.name || '',
        log.sites?.name || '',
        log.hours_worked,
        log.nt_hours,
        log.rot_hours,
        log.hot_hours,
        log.totalPay
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'daily_logs.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate summary statistics
  const calculateSummaryStats = () => {
    if (dailyLogs.length === 0) {
      return { totalHours: 0, totalPay: 0, workDays: 0 };
    }

    // Group logs by employee to calculate monthly totals with allowances
    const employeeGroups = {};
    dailyLogs.forEach(log => {
      const employeeId = log.employee_id || log.id; // fallback for mock data
      if (!employeeGroups[employeeId]) {
        employeeGroups[employeeId] = {
          employee: log.employees || { name: log.employeeName },
          logs: []
        };
      }
      employeeGroups[employeeId].logs.push(log);
    });

    let totalHours = 0;
    let totalPay = 0;
    let uniqueDates = new Set();

    Object.values(employeeGroups).forEach(({ employee, logs }) => {
      if (employee && logs.length > 0) {
        // Use unified calculation that includes allowances
        const monthlySummary = calculateEmployeeMonthlySummary(logs, employee);
        totalPay += monthlySummary.totalPay;
        totalHours += monthlySummary.totalHours;
        
        // Count unique dates
        logs.forEach(log => uniqueDates.add(log.date));
      } else {
        // Fallback for logs without employee data
        logs.forEach(log => {
          totalHours += (log.ntHours || log.nt_hours || 0) + 
                       (log.notHours || log.rot_hours || 0) + 
                       (log.hotHours || log.hot_hours || 0);
          totalPay += log.totalPay || 0;
          uniqueDates.add(log.date);
        });
      }
    });

    return {
      totalHours: totalHours,
      totalPay: totalPay,
      workDays: uniqueDates.size
    };
  };

  const summaryStats = calculateSummaryStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Daily Logs</h1>
          <p className="text-gray-600">Track daily work hours and site assignments</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={exportLogs}
            className="btn btn-outline"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={handleAddLog}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Add Log Entry
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.totalHours.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Pay</p>
                <p className="text-2xl font-bold text-gray-900">BHD {summaryStats.totalPay.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Work Days</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.workDays}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-md">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by employee or site..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>

            {/* Site Filter */}
            <div>
              <select
                value={filterSite}
                onChange={(e) => setFilterSite(e.target.value)}
                className="form-select"
              >
                <option value="">All Sites</option>
                {sites.map(site => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </div>

            {/* Employee Filter */}
            <div>
              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="form-select"
              >
                <option value="">All Employees</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>{employee.name}</option>
                ))}
              </select>
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
          </div>
        </div>
      </div>

      {/* Logs Table */}
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
                        setSortBy('employee');
                        setSortOrder(sortBy === 'employee' && sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                      className="flex items-center gap-sm hover:text-blue-600"
                    >
                      Employee
                      {sortBy === 'employee' && (
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedLogs.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-gray-500">
                      {searchTerm || filterSite || filterEmployee || filterDate
                        ? 'No log entries match your filters'
                        : 'No log entries found. Add your first log entry to get started.'}
                    </td>
                  </tr>
                ) : (
                  sortedLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="font-mono">{log.date}</td>
                      <td>
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User size={14} className="text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{log.employees?.name}</div>
                            <div className="text-sm text-gray-500">{log.employees?.designation}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-sm">
                          <MapPin size={14} className="text-gray-400" />
                          <span>{log.siteRef}</span>
                        </div>
                      </td>
                      <td className="font-mono">{log.hours_worked}</td>
                      <td className="font-mono">{log.nt_hours}</td>
                      <td className="font-mono">{log.rot_hours}</td>
                      <td className="font-mono">{log.hot_hours}</td>
                      <td className="font-mono font-medium text-green-600">
                        BHD {log.totalPay?.toFixed(2)}
                      </td>
                      <td>
                        <div className="flex items-center gap-sm">
                          <button
                            onClick={() => handleEditLog(log)}
                            className="btn btn-ghost btn-sm"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            className="btn btn-ghost btn-sm text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 size={14} />
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
      </div>

      {/* Log Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingLog ? 'Edit Log Entry' : 'Add Log Entry'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={editingLog?.date || ''}
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee *
                  </label>
                  <select className="form-select" required>
                    <option value="">Select Employee</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} - {employee.designation}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site *
                  </label>
                  <select className="form-select" required>
                    <option value="">Select Site</option>
                    {sites.map(site => (
                      <option key={site.id} value={site.id}>
                        {site.name} ({site.code})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hours Worked *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={editingLog?.hours_worked || ''}
                    className="form-input"
                    placeholder="8.0"
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-sm mt-6">
                <button
                  onClick={handleModalClose}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogSaved}
                  className="btn btn-primary flex-1"
                >
                  {editingLog ? 'Update' : 'Create'} Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkSites;