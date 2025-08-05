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
      
      // Add hours and pay
      const employee = monthlyGroups[monthKey].employees[employeeId];
      employee.ntHours += log.nt_hours || 0;
      employee.rotHours += log.rot_hours || 0;
      employee.hotHours += log.hot_hours || 0;
      employee.totalHours += (log.nt_hours || 0) + (log.rot_hours || 0) + (log.hot_hours || 0);
      employee.totalPay += log.total_pay || 0;
      employee.workDays += 1;
      
      // Update monthly totals
      monthlyGroups[monthKey].totalHours += (log.nt_hours || 0) + (log.rot_hours || 0) + (log.hot_hours || 0);
      monthlyGroups[monthKey].totalPay += log.total_pay || 0;
      monthlyGroups[monthKey].totalLogs += 1;
    });
    
    // Convert to array format
    return Object.values(monthlyGroups).map(group => ({
      ...group,
      employees: Object.values(group.employees)
    }));
  };

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

  useEffect(() => {
    fetchSummaries();
  }, []);

  // Filter summaries
  const filteredSummaries = summaries.filter(summary => {
    const matchesSearch = !searchTerm || 
      summary.employees.some(emp => 
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.designation?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesMonth = !filterMonth || summary.month === filterMonth;
    const matchesYear = !filterYear || summary.year.toString() === filterYear;
    
    return matchesSearch && matchesMonth && matchesYear;
  });

  // Get unique months and years for filters
  const uniqueMonths = [...new Set(summaries.map(s => s.month))].sort().reverse();
  const uniqueYears = [...new Set(summaries.map(s => s.year))].sort().reverse();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600 font-medium">Loading monthly summaries...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Monthly Summaries</h1>
              <p className="mt-2 text-gray-600">View and export monthly employee summaries</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search */}
              <div>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Month Filter */}
              <div>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
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
        <div className="space-y-6">
          {filteredSummaries.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <Calendar size={48} />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No summaries found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || filterMonth || filterYear
                    ? 'No summaries match your filters'
                    : 'No monthly summaries available. Add daily logs to generate summaries.'}
                </p>
              </div>
            </div>
          ) : (
            filteredSummaries.map((summary) => (
              <div key={summary.month} className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {summary.monthName} {summary.year}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {summary.employees.length} employees • {summary.totalLogs} log entries
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
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
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        <Download size={16} className="mr-2" />
                        Export
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Designation</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employment Type</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Work Type</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Hours</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">NT Hours</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ROT Hours</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">HOT Hours</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Pay</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Work Days</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {summary.employees.map((employee) => (
                          <tr key={employee.id} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                    <User size={20} className="text-white" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-gray-900">{employee.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.designation}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                {employee.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${
                                employee.employment_type === 'permanent' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {employee.employment_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                {employee.work_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{employee.totalHours.toFixed(1)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{employee.ntHours.toFixed(1)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{employee.rotHours.toFixed(1)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{employee.hotHours.toFixed(1)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono font-medium text-green-600">
                              BHD {employee.totalPay.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{employee.workDays}</td>
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
    </div>
  );
};

export default MonthlySummaries; 