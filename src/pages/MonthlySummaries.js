import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMonth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  Download, 
  Calendar, 
  User, 
  Clock, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom'; // Added Link import

const MonthlySummaries = () => {
  const { user } = useAuth();
  const { selectedMonth, isCurrentMonth, getSelectedMonthName } = useMonth();
  const isEditor = ['admin', 'editor'].includes(user?.role);

  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sample data matching Excel format
  const sampleEmployees = [
    {
      id: 'emp-1',
      name: 'DEEPAK KUMAR',
      cpr: '123456789',
      category: 'General',
      doj: '2024-01-15',
      previousRate: 120.0,
      currentRate: 130.0,
      site: 'Site A'
    },
    {
      id: 'emp-2',
      name: 'ARUNKUMAR PC',
      cpr: '987654321',
      category: 'Supervisor',
      doj: '2024-02-01',
      previousRate: 200.0,
      currentRate: 210.0,
      site: 'Site B'
    },
    {
      id: 'emp-3',
      name: 'AMAL KOORARA',
      cpr: '456789123',
      category: 'Skilled',
      doj: '2024-01-20',
      previousRate: 120.0,
      currentRate: 130.0,
      site: 'Site A'
    },
    {
      id: 'emp-4',
      name: 'SHIFIN RAPHEL',
      cpr: '789123456',
      category: 'General',
      doj: '2024-02-10',
      previousRate: 120.0,
      currentRate: 130.0,
      site: 'Site A'
    },
    {
      id: 'emp-5',
      name: 'ARUN MON',
      cpr: '321654987',
      category: 'Supervisor',
      doj: '2024-01-25',
      previousRate: 180.0,
      currentRate: 190.0,
      site: 'Site B'
    }
  ];

  const sampleDailyLogs = [
    { employeeId: 'emp-1', date: '2025-03-01', ntHours: 8, notHours: 2, hotHours: 0 },
    { employeeId: 'emp-1', date: '2025-03-02', ntHours: 8, notHours: 1, hotHours: 0 },
    { employeeId: 'emp-1', date: '2025-03-03', ntHours: 8, notHours: 0, hotHours: 0 },
    { employeeId: 'emp-2', date: '2025-03-01', ntHours: 8, notHours: 1, hotHours: 1 },
    { employeeId: 'emp-2', date: '2025-03-02', ntHours: 8, notHours: 2, hotHours: 0 },
    { employeeId: 'emp-2', date: '2025-03-03', ntHours: 8, notHours: 1, hotHours: 0 },
    { employeeId: 'emp-3', date: '2025-03-01', ntHours: 8, notHours: 0, hotHours: 0 },
    { employeeId: 'emp-3', date: '2025-03-02', ntHours: 8, notHours: 1, hotHours: 0 },
    { employeeId: 'emp-3', date: '2025-03-03', ntHours: 8, notHours: 0, hotHours: 0 }
  ];

  useEffect(() => {
    generateMonthlySummary();
  }, [selectedMonth]); // Regenerate when month changes

  const generateMonthlySummary = () => {
    const currentMonth = selectedMonth.month;
    const currentYear = selectedMonth.year;
    
    // Sample daily logs for the selected month
    const sampleLogs = [
      // Deepak Kumar - has advance deduction of 83.33
      { employeeId: 'emp-1', employeeName: 'DEEPAK KUMAR', ntHours: 160, notHours: 20, hotHours: 8, totalPay: 2750, allowance: 50, deductions: 0, advanceDeductions: 83.33 },
      // Arun PC - has advance deduction of 500
      { employeeId: 'emp-2', employeeName: 'ARUNKUMAR PC', ntHours: 168, notHours: 15, hotHours: 5, totalPay: 3200, allowance: 75, deductions: 0, advanceDeductions: 500 },
      // Amal Koorara - has advance deduction of 83.33
      { employeeId: 'emp-3', employeeName: 'AMAL KOORARA', ntHours: 152, notHours: 18, hotHours: 6, totalPay: 2600, allowance: 45, deductions: 0, advanceDeductions: 83.33 },
      { employeeId: 'emp-4', employeeName: 'SHIFIN RAPHEL', ntHours: 160, notHours: 12, hotHours: 4, totalPay: 2400, allowance: 40, deductions: 0, advanceDeductions: 0 },
      { employeeId: 'emp-5', employeeName: 'ARUN MON', ntHours: 168, notHours: 25, hotHours: 10, totalPay: 3800, allowance: 80, deductions: 0, advanceDeductions: 0 },
      { employeeId: 'emp-6', employeeName: 'AJITH KUMAR', ntHours: 156, notHours: 16, hotHours: 7, totalPay: 2700, allowance: 55, deductions: 0, advanceDeductions: 0 },
      { employeeId: 'emp-7', employeeName: 'VISHNU', ntHours: 160, notHours: 14, hotHours: 5, totalPay: 2500, allowance: 50, deductions: 0, advanceDeductions: 0 },
      { employeeId: 'emp-8', employeeName: 'RAVI KAMMARI', ntHours: 164, notHours: 22, hotHours: 8, totalPay: 3100, allowance: 65, deductions: 0, advanceDeductions: 0 },
      { employeeId: 'emp-9', employeeName: 'YADHUKRISHNAN', ntHours: 160, notHours: 18, hotHours: 6, totalPay: 2800, allowance: 60, deductions: 0, advanceDeductions: 0 },
      { employeeId: 'emp-10', employeeName: 'MD MATALIB MIAH', ntHours: 168, notHours: 20, hotHours: 8, totalPay: 1800, allowance: 30, deductions: 0, advanceDeductions: 0 },
      { employeeId: 'emp-11', employeeName: 'KABIR HOSSAIN', ntHours: 160, notHours: 15, hotHours: 5, totalPay: 2200, allowance: 35, deductions: 0, advanceDeductions: 0 },
      { employeeId: 'emp-12', employeeName: 'ABDUL RAHIM', ntHours: 156, notHours: 18, hotHours: 7, totalPay: 1900, allowance: 40, deductions: 0, advanceDeductions: 0 },
      { employeeId: 'emp-13', employeeName: 'ALAM ABUL KASHEM', ntHours: 160, notHours: 16, hotHours: 6, totalPay: 1700, allowance: 30, deductions: 0, advanceDeductions: 0 },
      { employeeId: 'emp-14', employeeName: 'ANOWAR HOSSAIN', ntHours: 164, notHours: 19, hotHours: 8, totalPay: 2000, allowance: 35, deductions: 0, advanceDeductions: 0 },
      { employeeId: 'emp-15', employeeName: 'ABDUL MIAH ISAMAIL', ntHours: 160, notHours: 14, hotHours: 5, totalPay: 1800, allowance: 30, deductions: 0, advanceDeductions: 0 },
      { employeeId: 'emp-16', employeeName: 'PRADEEP KUMAR', ntHours: 168, notHours: 0, hotHours: 0, totalPay: 190, allowance: 0, deductions: 0, advanceDeductions: 0 },
      { employeeId: 'emp-17', employeeName: 'JOHN SIMON', ntHours: 168, notHours: 0, hotHours: 0, totalPay: 115, allowance: 0, deductions: 0, advanceDeductions: 0 },
      { employeeId: 'emp-18', employeeName: 'RAJESH', ntHours: 168, notHours: 0, hotHours: 0, totalPay: 130, allowance: 0, deductions: 0, advanceDeductions: 0 },
      { employeeId: 'emp-19', employeeName: 'SREENATH KANKKARA', ntHours: 168, notHours: 0, hotHours: 0, totalPay: 120, allowance: 0, deductions: 0, advanceDeductions: 0 }
    ];

    // Calculate monthly summary for each employee
    const monthlyData = sampleLogs.map(log => {
      const finalPay = log.totalPay + log.allowance;
      const netPay = finalPay - log.deductions - log.advanceDeductions;
      const roundedNetPay = Math.round(netPay * 10) / 10;

        return {
        ...log,
        finalPay,
        netPay,
        roundedNetPay
        };
      });

    // Calculate statistics
    const statistics = {
      totalEmployees: monthlyData.length,
      totalNormalHours: monthlyData.reduce((sum, log) => sum + log.ntHours, 0),
      totalRegularOTHours: monthlyData.reduce((sum, log) => sum + log.notHours, 0),
      totalHolidayOTHours: monthlyData.reduce((sum, log) => sum + log.hotHours, 0),
      totalPay: monthlyData.reduce((sum, log) => sum + log.totalPay, 0),
      totalAllowance: monthlyData.reduce((sum, log) => sum + log.allowance, 0),
      totalDeductions: monthlyData.reduce((sum, log) => sum + log.deductions, 0),
      totalAdvanceDeductions: monthlyData.reduce((sum, log) => sum + log.advanceDeductions, 0),
      totalRoundedNetPay: monthlyData.reduce((sum, log) => sum + log.roundedNetPay, 0),
      averageNetPay: monthlyData.length > 0 ? monthlyData.reduce((sum, log) => sum + log.roundedNetPay, 0) / monthlyData.length : 0
    };

    setMonthlyData({ employees: monthlyData, statistics });
  };

  const handleExportCSV = () => {
    if (!monthlyData) return;

    const headers = [
      'S.No',
      'Name',
      'Category',
      'CPR No.',
      'D.O.J',
      'PREVIOUS',
      'Rate',
      'No of Days',
      'Abs-ent',
      'Present Days',
      'Wages',
      'NOT (Hrs)',
      'NOT Amt',
      'H.OT (hrs)',
      'HOT Amt',
      'G.Wages',
      'Allow.',
      'Allow. Portion',
      'Net Paid',
      'Deductions',
      'After Deductions',
      'Roundoff'
    ];

    const csvRows = monthlyData.employeeSummaries.map((summary, index) => [
      index + 1,
      summary.employeeName,
      summary.employeeCategory,
      summary.employeeCPR,
      summary.employeeDOJ,
      summary.previousRate,
      summary.currentRate,
      summary.noOfDays,
      summary.absentDays,
      summary.presentDays,
      summary.wages,
      summary.notHours,
      summary.notAmount,
      summary.hotHours,
      summary.hotAmount,
      summary.grossWages,
      summary.allowance,
      summary.allowancePortion,
      summary.netPaid,
      summary.deductions,
      summary.afterDeductions,
      summary.roundoff
    ]);

    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wage-summary-${selectedMonth}-${selectedMonth.year}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('CSV exported successfully');
  };

  const formatCurrency = (amount) => {
    // Handle NaN, null, undefined values
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
          <h1 className="text-2xl font-bold text-gray-900">Monthly Summaries</h1>
          <p className="mt-1 text-sm text-gray-600">
            {getSelectedMonthName()} wage reports and analytics
            {!isCurrentMonth && (
              <span className="ml-2 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md">
                Historical Report
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={!monthlyData}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Download size={20} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Month/Year Selector - Now handled by global MonthSelector */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Selected Period:</span>
            <span className="text-sm font-semibold text-gray-900">{getSelectedMonthName()}</span>
          </div>
          {!isCurrentMonth && (
            <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md">
              Historical Data
            </span>
          )}
        </div>
      </div>

      {monthlyData && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/employees" className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Employees</dt>
                    <dd className="text-lg font-medium text-gray-900">{monthlyData.statistics.totalEmployees}</dd>
                  </dl>
                </div>
              </div>
            </Link>

            <Link to="/daily-logs" className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Pay</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(monthlyData.statistics.totalPay)}</dd>
                  </dl>
                </div>
              </div>
            </Link>

            <Link to="/salary-advances" className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Advance Deductions</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(monthlyData.statistics.totalAdvanceDeductions)}</dd>
                  </dl>
                </div>
              </div>
            </Link>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Net Pay</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(monthlyData.statistics.totalRoundedNetPay)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Summary Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Employee Summary</h3>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Employee Name</th>
                    <th>N.T Hours</th>
                    <th>N.O.T Hours</th>
                    <th>H.O.T Hours</th>
                    <th>Total Pay</th>
                    <th>Allowance</th>
                    <th>Final Pay</th>
                    <th>Deductions</th>
                    <th>Advance Deductions</th>
                    <th>Net Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.employees.map((employee, index) => (
                    <tr key={employee.employeeId}>
                      <td>{index + 1}</td>
                      <td className="font-medium">{employee.employeeName}</td>
                      <td>{employee.ntHours}</td>
                      <td>{employee.notHours}</td>
                      <td>{employee.hotHours}</td>
                      <td className="tabular-nums">{formatCurrency(employee.totalPay)}</td>
                      <td className="tabular-nums">{formatCurrency(employee.allowance)}</td>
                      <td className="tabular-nums">{formatCurrency(employee.finalPay)}</td>
                      <td className="tabular-nums text-red-600">{formatCurrency(employee.deductions)}</td>
                      <td className="tabular-nums text-red-600">{formatCurrency(employee.advanceDeductions)}</td>
                      <td className="font-medium text-green-600 tabular-nums">{formatCurrency(employee.roundedNetPay)}</td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="bg-yellow-50 font-bold">
                    <td colSpan="5">TOTAL</td>
                    <td className="tabular-nums">{formatCurrency(monthlyData.statistics.totalPay)}</td>
                    <td className="tabular-nums">{formatCurrency(monthlyData.statistics.totalAllowance)}</td>
                    <td className="tabular-nums">{formatCurrency(monthlyData.statistics.totalPay + monthlyData.statistics.totalAllowance)}</td>
                    <td className="tabular-nums text-red-600">{formatCurrency(monthlyData.statistics.totalDeductions)}</td>
                    <td className="tabular-nums text-red-600">{formatCurrency(monthlyData.statistics.totalAdvanceDeductions)}</td>
                    <td className="text-green-600 bg-yellow-200 tabular-nums">{formatCurrency(monthlyData.statistics.totalRoundedNetPay)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Hours Breakdown</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Normal Time Hours:</span>
                  <span className="font-medium">{monthlyData.statistics.totalNormalHours}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Normal Overtime Hours:</span>
                  <span className="font-medium">{monthlyData.statistics.totalRegularOTHours}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Holiday Overtime Hours:</span>
                  <span className="font-medium">{monthlyData.statistics.totalHolidayOTHours}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-medium">
                    <span>Total Hours:</span>
                    <span>{monthlyData.statistics.totalNormalHours + monthlyData.statistics.totalRegularOTHours + monthlyData.statistics.totalHolidayOTHours}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Pay Breakdown</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pay:</span>
                  <span className="font-medium">{formatCurrency(monthlyData.statistics.totalPay)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Allowance:</span>
                  <span className="font-medium">{formatCurrency(monthlyData.statistics.totalAllowance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deductions:</span>
                  <span className="font-medium text-red-600">{formatCurrency(monthlyData.statistics.totalDeductions)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Advance Deductions:</span>
                  <span className="font-medium text-red-600">{formatCurrency(monthlyData.statistics.totalAdvanceDeductions)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-medium text-green-600">
                    <span>Net Pay:</span>
                    <span>{formatCurrency(monthlyData.statistics.totalRoundedNetPay)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MonthlySummaries; 