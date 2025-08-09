import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Coins, 
  Download, 
  Search, 
  Filter,
  User,
  MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { calculateDailyWage, calculateEmployeeMonthlySummary } from '../utils/wageCalculator';
import toast from 'react-hot-toast';

const Timecard = () => {
  const { userProfile } = useAuth();
  const [timecardData, setTimecardData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch timecard data from Supabase
  const fetchTimecardData = async () => {
    try {
      setLoading(true);
      
      // Fetch employees for filter dropdown
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, name, designation')
        .order('name', { ascending: true });

      if (employeesError) throw employeesError;

      // Fetch sites for filter dropdown
      const { data: sitesData, error: sitesError } = await supabase
        .from('sites')
        .select('id, name, code')
        .order('name', { ascending: true });

      if (sitesError) throw sitesError;
      
      // Fetch daily logs (all logs for admin view)
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

      if (error) throw error;
      
      // Calculate total pay for each daily log
      const dataWithPay = (data || []).map(log => {
        if (log.employees) {
          try {
            const wageCalculation = calculateDailyWage(log, log.employees);
            return {
              ...log,
              totalPay: wageCalculation.totalPay
            };
          } catch (error) {
            console.error('Error calculating wage for log:', log.date, error);
            return {
              ...log,
              totalPay: 0
            };
          }
        }
        return {
          ...log,
          totalPay: 0
        };
      });
      
      setTimecardData(dataWithPay);
      setEmployees(employeesData || []);
      setSites(sitesData || []);
    } catch (error) {
      console.error('Error fetching timecard data:', error);
      toast.error('Failed to fetch timecard data');
      setTimecardData([]);
      setEmployees([]);
      setSites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimecardData();
  }, []);

  // Filter timecard data
  const filteredData = timecardData.filter(entry => {
    const matchesSearch = 
      entry.employees?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.sites?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.sites?.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !filterDate || entry.date === filterDate;
    const matchesSite = !filterSite || entry.site_id === filterSite;
    const matchesEmployee = !filterEmployee || entry.employee_id === filterEmployee;
    
    return matchesSearch && matchesDate && matchesSite && matchesEmployee;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'site') {
      aValue = a.sites?.name || '';
      bValue = b.sites?.name || '';
    } else if (sortBy === 'employee') {
      aValue = a.employees?.name || '';
      bValue = b.employees?.name || '';
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
      ['Date', 'Employee', 'Site', 'Hours Worked', 'NT Hours', 'ROT Hours', 'HOT Hours', 'Total Pay'],
      ...sortedData.map(entry => [
        entry.date,
        entry.employees?.name || '',
        entry.sites?.name || '',
        entry.hours_worked,
        entry.nt_hours,
        entry.rot_hours,
        entry.hot_hours,
        entry.totalPay
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

  // Calculate summary statistics with allowances
  const calculateTimecardSummary = () => {
    if (sortedData.length === 0) {
      return { totalHours: 0, totalPay: 0, workDays: 0 };
    }

    // Group by employee to calculate monthly totals with allowances
    const employeeGroups = {};
    sortedData.forEach(entry => {
      const employeeId = entry.employee_id;
      if (!employeeGroups[employeeId]) {
        employeeGroups[employeeId] = {
          employee: entry.employees,
          logs: []
        };
      }
      employeeGroups[employeeId].logs.push(entry);
    });

    let totalHours = 0;
    let totalPay = 0;
    const uniqueDates = new Set(sortedData.map(entry => entry.date));

    Object.values(employeeGroups).forEach(({ employee, logs }) => {
      if (employee && logs.length > 0) {
        // Use unified calculation that includes allowances
        const monthlySummary = calculateEmployeeMonthlySummary(logs, employee);
        totalPay += monthlySummary.totalPay;
        totalHours += monthlySummary.totalHours;
      } else {
        // Fallback calculation
        logs.forEach(log => {
          totalHours += (log.nt_hours || 0) + (log.rot_hours || 0) + (log.hot_hours || 0);
          totalPay += log.totalPay || 0;
        });
      }
    });

    return {
      totalHours,
      totalPay,
      workDays: uniqueDates.size
    };
  };

  const { totalHours, totalPay, workDays } = calculateTimecardSummary();
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

  // Removed user profile check since no profiles are set up yet

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Timecard</h1>
          <p className="text-gray-600">Track work hours and earnings</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3">
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Coins size={20} className="text-green-600" />
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Work Days</p>
                <p className="text-2xl font-bold text-gray-900">{workDays}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
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

            {/* Employee Filter */}
            <div>
              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="form-select"
              >
                <option value="">All Employees</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
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
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
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
                placeholder="Filter by date"
              />
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
                </tr>
              </thead>
              <tbody>
                {sortedData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-500">
                      {searchTerm || filterDate || filterSite || filterEmployee
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
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User size={14} className="text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{entry.employees?.name}</div>
                            <div className="text-sm text-gray-500">{entry.employees?.designation}</div>
                          </div>
                        </div>
                      </td>
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
                        BHD {entry.totalPay?.toFixed(2)}
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