import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Calendar, 
  MapPin,
  User,
  Building
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalSites: 0,
    totalHours: 0,
    totalPay: 0,
    recentLogs: [],
    topEmployees: [],
    siteSummary: []
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data from Supabase
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch employees count
      const { count: employeesCount, error: employeesError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });

      if (employeesError) throw employeesError;

      // Fetch sites count
      const { count: sitesCount, error: sitesError } = await supabase
        .from('sites')
        .select('*', { count: 'exact', head: true });

      if (sitesError) throw sitesError;

      // Fetch recent daily logs
      const { data: recentLogs, error: logsError } = await supabase
        .from('daily_logs')
        .select(`
          *,
          employees (
            id,
            name,
            designation
          ),
          sites (
            id,
            name,
            code
          )
        `)
        .order('date', { ascending: false })
        .limit(10);

      if (logsError) throw logsError;

      // Calculate totals from logs
      const totalHours = recentLogs?.reduce((sum, log) => sum + (log.hours_worked || 0), 0) || 0;
      const totalPay = recentLogs?.reduce((sum, log) => sum + (log.total_pay || 0), 0) || 0;

      // Get top employees by hours worked
      const { data: topEmployees, error: topEmployeesError } = await supabase
        .from('daily_logs')
        .select(`
          employees (
            id,
            name,
            designation
          ),
          hours_worked
        `)
        .order('hours_worked', { ascending: false })
        .limit(5);

      if (topEmployeesError) throw topEmployeesError;

      // Get site summary
      const { data: siteSummary, error: siteSummaryError } = await supabase
        .from('daily_logs')
        .select(`
          sites (
            id,
            name,
            code
          ),
          hours_worked,
          total_pay
        `)
        .order('hours_worked', { ascending: false })
        .limit(5);

      if (siteSummaryError) throw siteSummaryError;

      setStats({
        totalEmployees: employeesCount || 0,
        totalSites: sitesCount || 0,
        totalHours,
        totalPay,
        recentLogs: recentLogs || [],
        topEmployees: topEmployees || [],
        siteSummary: siteSummary || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
      setStats({
        totalEmployees: 0,
        totalSites: 0,
        totalHours: 0,
        totalPay: 0,
        recentLogs: [],
        topEmployees: [],
        siteSummary: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {userProfile?.full_name || 'User'}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Building size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Sites</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSites}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHours.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign size={24} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Pay</p>
                <p className="text-2xl font-bold text-gray-900">BHD {stats.totalPay.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity and Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="card-body">
            {stats.recentLogs.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center gap-sm p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{log.employees?.name}</p>
                      <p className="text-sm text-gray-600">
                        Worked {log.hours_worked} hours at {log.sites?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        BHD {log.total_pay?.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">{log.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Employees */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Top Employees</h3>
          </div>
          <div className="card-body">
            {stats.topEmployees.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No employee data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.topEmployees.map((item, index) => (
                  <div key={index} className="flex items-center gap-sm p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.employees?.name}</p>
                      <p className="text-sm text-gray-600">{item.employees?.designation}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">
                        {item.hours_worked} hours
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Site Performance */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Site Performance</h3>
        </div>
        <div className="card-body">
          {stats.siteSummary.length === 0 ? (
            <div className="text-center py-8">
              <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No site data available</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Site</th>
                    <th>Code</th>
                    <th>Hours Worked</th>
                    <th>Total Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.siteSummary.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="flex items-center gap-sm">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="font-medium">{item.sites?.name}</span>
                        </div>
                      </td>
                      <td className="font-mono">{item.sites?.code}</td>
                      <td className="font-mono">{item.hours_worked}</td>
                      <td className="font-mono font-medium text-green-600">
                        BHD {item.total_pay?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 