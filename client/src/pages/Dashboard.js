import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  ArrowRight, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Calendar,
  MapPin,
  Building,
  Plus,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMonth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { selectedMonth, isCurrentMonth, getSelectedMonthName } = useMonth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalHours: 0,
    totalExpenses: 0,
    averageCostPerHour: 0
  });

  useEffect(() => {
    // Calculate current month statistics
    const currentMonthData = generateCurrentMonthData();
    const totalEmployees = currentMonthData.length;
    const totalHours = currentMonthData.reduce((sum, emp) => 
      sum + (emp.totalNormalTime || 0) + (emp.totalRegularOT || 0) + (emp.totalHolidayOT || 0), 0);
    const totalExpenses = currentMonthData.reduce((sum, emp) => sum + (emp.totalPay || 0), 0);
    const averageCostPerHour = totalHours > 0 ? totalExpenses / totalHours : 0;

    setStats({
      totalEmployees,
      totalHours: Math.round(totalHours),
      totalExpenses: Math.round(totalExpenses),
      averageCostPerHour: Math.round(averageCostPerHour * 100) / 100
    });
  }, [selectedMonth]);

  const generateCurrentMonthData = () => {
    // Sample data for current month
    return [
      {
        id: 1,
        name: 'DEEPAK KUMAR',
        totalNormalTime: 160,
        totalRegularOT: 20,
        totalHolidayOT: 8,
        totalPay: 4560,
        site: 'Workshop'
      },
      {
        id: 2,
        name: 'ARUNKUMAR PC',
        totalNormalTime: 160,
        totalRegularOT: 15,
        totalHolidayOT: 5,
        totalPay: 5200,
        site: 'Workshop'
      },
      {
        id: 3,
        name: 'AMAL KOORARA',
        totalNormalTime: 160,
        totalRegularOT: 12,
        totalHolidayOT: 3,
        totalPay: 3120,
        site: 'Workshop'
      },
      {
        id: 4,
        name: 'SHIFIN RAPHEL',
        totalNormalTime: 160,
        totalRegularOT: 18,
        totalHolidayOT: 6,
        totalPay: 3840,
        site: 'Workshop'
      },
      {
        id: 5,
        name: 'ARUN MON',
        totalNormalTime: 160,
        totalRegularOT: 25,
        totalHolidayOT: 10,
        totalPay: 6080,
        site: 'Workshop'
      },
      {
        id: 6,
        name: 'AJITH KUMAR',
        totalNormalTime: 160,
        totalRegularOT: 16,
        totalHolidayOT: 4,
        totalPay: 4160,
        site: 'Workshop'
      },
      {
        id: 7,
        name: 'VISHNU',
        totalNormalTime: 160,
        totalRegularOT: 14,
        totalHolidayOT: 2,
        totalPay: 2880,
        site: 'Workshop'
      },
      {
        id: 8,
        name: 'RAVI KAMMARI',
        totalNormalTime: 160,
        totalRegularOT: 22,
        totalHolidayOT: 7,
        totalPay: 4480,
        site: 'Workshop'
      },
      {
        id: 9,
        name: 'YADHUKRISHNAN',
        totalNormalTime: 160,
        totalRegularOT: 19,
        totalHolidayOT: 5,
        totalPay: 4000,
        site: 'Workshop'
      },
      {
        id: 10,
        name: 'PRADEEP KUMAR',
        totalNormalTime: 160,
        totalRegularOT: 20,
        totalHolidayOT: 8,
        totalPay: 4560,
        site: 'Site A'
      },
      {
        id: 11,
        name: 'JOHN SIMON',
        totalNormalTime: 160,
        totalRegularOT: 15,
        totalHolidayOT: 3,
        totalPay: 2640,
        site: 'Site B'
      },
      {
        id: 12,
        name: 'RAJESH',
        totalNormalTime: 160,
        totalRegularOT: 18,
        totalHolidayOT: 6,
        totalPay: 3840,
        site: 'Site C'
      },
      {
        id: 13,
        name: 'SREENATH KANKKARA',
        totalNormalTime: 160,
        totalRegularOT: 16,
        totalHolidayOT: 4,
        totalPay: 3200,
        site: 'Site D'
      },
      {
        id: 14,
        name: 'MD MATALIB MIAH',
        totalNormalTime: 160,
        totalRegularOT: 20,
        totalHolidayOT: 8,
        totalPay: 1440,
        site: 'Site E'
      },
      {
        id: 15,
        name: 'KABIR HOSSAIN',
        totalNormalTime: 160,
        totalRegularOT: 25,
        totalHolidayOT: 10,
        totalPay: 2400,
        site: 'Site F'
      },
      {
        id: 16,
        name: 'ABDUL RAHIM',
        totalNormalTime: 160,
        totalRegularOT: 18,
        totalHolidayOT: 6,
        totalPay: 1920,
        site: 'Site G'
      },
      {
        id: 17,
        name: 'ALAM ABUL KASHEM',
        totalNormalTime: 160,
        totalRegularOT: 22,
        totalHolidayOT: 7,
        totalPay: 1656,
        site: 'Site H'
      },
      {
        id: 18,
        name: 'ANOWAR HOSSAIN',
        totalNormalTime: 160,
        totalRegularOT: 20,
        totalHolidayOT: 8,
        totalPay: 1920,
        site: 'Site I'
      },
      {
        id: 19,
        name: 'ABDUL MIAH ISAMAIL',
        totalNormalTime: 160,
        totalRegularOT: 19,
        totalHolidayOT: 5,
        totalPay: 1920,
        site: 'Site J'
      }
    ];
  };

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return 'BHD 0';
    return new Intl.NumberFormat('en-BH', {
      style: 'currency',
      currency: 'BHD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const recentActivity = [
    { id: 1, action: 'Daily log added for DEEPAK KUMAR', time: '2 hours ago', type: 'log' },
    { id: 2, action: 'New employee ARUNKUMAR PC added', time: '4 hours ago', type: 'employee' },
    { id: 3, action: 'Monthly summary generated for January', time: '1 day ago', type: 'summary' },
    { id: 4, action: 'Site A expenses updated', time: '2 days ago', type: 'site' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600">
                {getSelectedMonthName()} {isCurrentMonth && <span className="badge badge-success ml-2">Current Month</span>}
              </p>
            </div>
            {user?.role === 'admin' && (
              <Link 
                to="/leadership" 
                className="btn btn-primary flex items-center space-x-2"
              >
                <Eye size={16} />
                <span>Leadership View</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="responsive-grid-4 gap-4">
        <Link to="/employees" className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-blue-600" />
              </div>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Total Employees</p>
              <p className="text-xl font-semibold text-gray-900 tabular-nums truncate">{stats.totalEmployees}</p>
            </div>
          </div>
        </Link>

        <Link to="/monthly-summaries" className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-green-600" />
              </div>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Total Pay</p>
              <p className="text-xl font-semibold text-gray-900 tabular-nums truncate">{formatCurrency(stats.totalExpenses)}</p>
            </div>
          </div>
        </Link>

        <Link to="/salary-advances" className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-red-600" />
              </div>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Advance Deductions</p>
              <p className="text-xl font-semibold text-gray-900 tabular-nums truncate">{formatCurrency(667)}</p>
            </div>
          </div>
        </Link>

        <Link to="/monthly-summaries" className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 size={20} className="text-blue-600" />
              </div>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Net Pay</p>
              <p className="text-xl font-semibold text-gray-900 tabular-nums truncate">{formatCurrency(stats.totalExpenses + 667)}</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="responsive-grid-4 gap-3">
            <Link to="/daily-logs" className="btn btn-outline flex items-center justify-center space-x-2 h-10">
              <Plus size={16} />
              <span>Add Daily Log</span>
            </Link>
            <Link to="/employees" className="btn btn-outline flex items-center justify-center space-x-2 h-10">
              <Users size={16} />
              <span>Manage Employees</span>
            </Link>
            <Link to="/sites" className="btn btn-outline flex items-center justify-center space-x-2 h-10">
              <Building size={16} />
              <span>Manage Sites</span>
            </Link>
            <Link to="/monthly-summaries" className="btn btn-outline flex items-center justify-center space-x-2 h-10">
              <Calendar size={16} />
              <span>Generate Report</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 