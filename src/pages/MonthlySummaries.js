import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Download, 
  Search, 
  Filter, 
  DollarSign, 
  Clock, 
  User,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const MonthlySummaries = () => {
  const { userProfile } = useAuth();
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());

  // Fetch monthly summaries from Supabase
  const fetchSummaries = async () => {
    try {
      setLoading(true);
      
      // Fetch daily logs grouped by month
      const { data: logsData, error: logsError } = await supabase
        .from('daily_logs')
        .select(`
          *,
          employees (
            id,
            name,
            designation,
            category,
            employment_type,
            work_type,
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
        .order('date', { ascending: false });

      if (logsError) throw logsError;

      // Process logs into monthly summaries
      const monthlyData = processLogsIntoSummaries(logsData || []);
      setSummaries(monthlyData);
    } catch (error) {
      console.error('Error fetching summaries:', error);
      toast.error('Failed to fetch monthly summaries');
      setSummaries([]);
    } finally {
      setLoading(false);
    }
  };

  const processLogsIntoSummaries = (logs) => {
    const monthlyGroups = {};
    
    logs.forEach(log => {
      const date = new Date(log.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = {
          month: monthKey,
          year: date.getFullYear(),
          monthName: date.toLocaleDateString('en-US', { month: 'long' }),
          employees: {},
          totalHours: 0,
          totalPay: 0,
          totalLogs: 0
        };
      }
      
      const employeeId = log.employee_id;
      if (!monthlyGroups[monthKey].employees[employeeId]) {
        monthlyGroups[monthKey].employees[employeeId] = {
          id: employeeId,
          name: log.employees?.name,
          designation: log.employees?.designation,
          category: log.employees?.category,
          employment_type: log.employees?.employment_type,
          work_type: log.employees?.work_type,
          nt_rate: log.employees?.nt_rate,
          rot_rate: log.employees?.rot_rate,
          hot_rate: log.employees?.hot_rate,
          totalHours: 0,
          ntHours: 0,
          rotHours: 0,
          hotHours: 0,
          totalPay: 0,
          workDays: 0
        };
      }
      
      const employee = monthlyGroups[monthKey].employees[employeeId];
      employee.totalHours += log.hours_worked || 0;
      employee.ntHours += log.nt_hours || 0;
      employee.rotHours += log.rot_hours || 0;
      employee.hotHours += log.hot_hours || 0;
      employee.totalPay += log.total_pay || 0;
      employee.workDays += 1;
      
      monthlyGroups[monthKey].totalHours += log.hours_worked || 0;
      monthlyGroups[monthKey].totalPay += log.total_pay || 0;
      monthlyGroups[monthKey].totalLogs += 1;
    });
    
    return Object.values(monthlyGroups).map(group => ({
      ...group,
      employees: Object.values(group.employees)
    }));
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  // Filter summaries
  const filteredSummaries = summaries.filter(summary => {
    const matchesSearch = summary.employees.some(emp => 
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesMonth = !filterMonth || summary.month === filterMonth;
    const matchesYear = !filterYear || summary.year.toString() === filterYear;
    
    return matchesSearch && matchesMonth && matchesYear;
  });

  const exportSummary = (summary) => {
    const csvContent = [
      ['Employee Name', 'Designation', 'Category', 'Employment Type', 'Work Type', 'Total Hours', 'NT Hours', 'ROT Hours', 'HOT Hours', 'Total Pay', 'Work Days'],
      ...summary.employees.map(emp => [
        emp.name,
        emp.designation,
        emp.category,
        emp.employment_type,
        emp.work_type,
        emp.totalHours,
        emp.ntHours,
        emp.rotHours,
        emp.hotHours,
        emp.totalPay,
        emp.workDays
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly_summary_${summary.month}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get unique months and years for filters
  const uniqueMonths = [...new Set(summaries.map(s => s.month))].sort().reverse();
  const uniqueYears = [...new Set(summaries.map(s => s.year))].sort().reverse();

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
          <h1 className="text-2xl font-bold text-gray-900">Monthly Summaries</h1>
          <p className="text-gray-600">View and export monthly employee summaries</p>
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
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>

            {/* Month Filter */}
            <div>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="form-select"
              >
                <option value="">All Months</option>
                {uniqueMonths.map(month => {
                  const [year, monthNum] = month.split('-');
                  const date = new Date(year, monthNum - 1);
                  return (
                    <option key={month} value={month}>
                      {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="form-select"
              >
                <option value="">All Years</option>
                {uniqueYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summaries */}
      <div className="space-y-md">
        {filteredSummaries.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No summaries found</h3>
              <p className="text-gray-500">
                {searchTerm || filterMonth || filterYear
                  ? 'No summaries match your filters'
                  : 'No monthly summaries available. Add daily logs to generate summaries.'}
              </p>
            </div>
          </div>
        ) : (
          filteredSummaries.map((summary) => (
            <div key={summary.month} className="card">
              <div className="card-header">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-sm">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {summary.monthName} {summary.year}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {summary.employees.length} employees • {summary.totalLogs} log entries
                    </p>
                  </div>
                  <div className="flex items-center gap-sm">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Hours</p>
                      <p className="text-lg font-semibold text-gray-900">{summary.totalHours.toFixed(1)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Pay</p>
                      <p className="text-lg font-semibold text-green-600">BHD {summary.totalPay.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => exportSummary(summary)}
                      className="btn btn-outline"
                    >
                      <Download size={16} />
                      Export
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="card-body">
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Designation</th>
                        <th>Category</th>
                        <th>Employment Type</th>
                        <th>Work Type</th>
                        <th>Total Hours</th>
                        <th>NT Hours</th>
                        <th>ROT Hours</th>
                        <th>HOT Hours</th>
                        <th>Total Pay</th>
                        <th>Work Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.employees.map((employee) => (
                        <tr key={employee.id}>
                          <td>
                            <div className="flex items-center gap-sm">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User size={14} className="text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{employee.name}</div>
                              </div>
                            </div>
                          </td>
                          <td>{employee.designation}</td>
                          <td>
                            <span className="badge badge-outline">{employee.category}</span>
                          </td>
                          <td>
                            <span className={`badge ${
                              employee.employment_type === 'permanent' 
                                ? 'badge-success' 
                                : 'badge-warning'
                            }`}>
                              {employee.employment_type}
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-outline">{employee.work_type}</span>
                          </td>
                          <td className="font-mono">{employee.totalHours.toFixed(1)}</td>
                          <td className="font-mono">{employee.ntHours.toFixed(1)}</td>
                          <td className="font-mono">{employee.rotHours.toFixed(1)}</td>
                          <td className="font-mono">{employee.hotHours.toFixed(1)}</td>
                          <td className="font-mono font-medium text-green-600">
                            BHD {employee.totalPay.toFixed(2)}
                          </td>
                          <td className="font-mono">{employee.workDays}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MonthlySummaries; 