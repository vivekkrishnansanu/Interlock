import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Coins, 
  Clock, 
  TrendingUp, 
  Calendar, 
  MapPin,
  User,
  Building,
  Plus,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  
  console.log('🔧 Dashboard rendering, userProfile:', userProfile);
  
  const [stats, setStats] = useState({
    totalEmployees: 0,
    permanentEmployees: 0,
    flexiVisaEmployees: 0,
    manpowerSupplyEmployees: 0,
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
      console.log('🔧 Fetching dashboard data...');
      setLoading(true);
      
      // Fetch employees with employment type breakdown
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('employment_type');

      if (employeesError) {
        console.log('Employees table might not exist yet:', employeesError);
      }

      // Calculate employment type counts
      const employeesData = employees || [];
      const employeesCount = employeesData.length;
      const permanentEmployees = employeesData.filter(emp => emp.employment_type === 'permanent').length;
      const flexiVisaEmployees = employeesData.filter(emp => emp.employment_type === 'flexi visa').length;
      const manpowerSupplyEmployees = employeesData.filter(emp => emp.employment_type === 'manpower supply').length;

      // Fetch sites count
      const { count: sitesCount, error: sitesError } = await supabase
        .from('sites')
        .select('*', { count: 'exact', head: true });

      if (sitesError) {
        console.log('Sites table might not exist yet:', sitesError);
      }

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

      if (logsError) {
        console.log('Daily logs table might not exist yet:', logsError);
      }

      // Calculate totals from logs
      const totalHours = recentLogs?.reduce((sum, log) => sum + (log.hours_worked || 0), 0) || 0;
      const totalPay = recentLogs?.reduce((sum, log) => sum + (log.total_pay || 0), 0) || 0;

      setStats({
        totalEmployees: employeesCount || 0,
        permanentEmployees: permanentEmployees || 0,
        flexiVisaEmployees: flexiVisaEmployees || 0,
        manpowerSupplyEmployees: manpowerSupplyEmployees || 0,
        totalSites: sitesCount || 0,
        totalHours,
        totalPay,
        recentLogs: recentLogs || [],
        topEmployees: [],
        siteSummary: []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Don't show error toast for empty data
      setStats({
        totalEmployees: 0,
        permanentEmployees: 0,
        flexiVisaEmployees: 0,
        manpowerSupplyEmployees: 0,
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
    console.log('🔧 Dashboard is loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  console.log('🔧 Dashboard rendering content, stats:', stats);
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {userProfile?.name || 'User'}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card hover:shadow-md transition-shadow duration-200">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Users size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-semibold text-gray-900 tracking-tight">{stats.totalEmployees}</p>
                </div>
              </div>
              {stats.totalEmployees === 0 && (
                <button
                  onClick={() => navigate('/employees')}
                  className="btn btn-ghost btn-sm hover:bg-blue-50 hover:text-blue-600"
                  title="Add Employee"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md transition-shadow duration-200">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Building size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Sites</p>
                  <p className="text-2xl font-semibold text-gray-900 tracking-tight">{stats.totalSites}</p>
                </div>
              </div>
              {stats.totalSites === 0 && (
                <button
                  onClick={() => navigate('/sites')}
                  className="btn btn-ghost btn-sm hover:bg-green-50 hover:text-green-600"
                  title="Add Site"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md transition-shadow duration-200">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Clock size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Hours</p>
                  <p className="text-2xl font-semibold text-gray-900 tracking-tight">{stats.totalHours.toFixed(1)}</p>
                </div>
              </div>
              {stats.totalHours === 0 && (
                <button
                  onClick={() => navigate('/daily-logs')}
                  className="btn btn-ghost btn-sm hover:bg-purple-50 hover:text-purple-600"
                  title="Add Daily Log"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md transition-shadow duration-200">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Coins size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pay</p>
                  <p className="text-2xl font-semibold text-gray-900 tracking-tight">BHD {stats.totalPay.toFixed(3)}</p>
                </div>
              </div>
              {stats.totalPay === 0 && (
                <button
                  onClick={() => navigate('/daily-logs')}
                  className="btn btn-ghost btn-sm hover:bg-orange-50 hover:text-orange-600"
                  title="Add Daily Log"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 tracking-tight mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/employees')}
                className="w-full btn btn-outline justify-start hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors duration-200"
              >
                <User size={16} className="mr-3" />
                Add Employee
              </button>
              <button
                onClick={() => navigate('/sites')}
                className="w-full btn btn-outline justify-start hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-colors duration-200"
              >
                <Building size={16} className="mr-3" />
                Add Work Site
              </button>
              <button
                onClick={() => navigate('/daily-logs')}
                className="w-full btn btn-outline justify-start hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-colors duration-200"
              >
                <Clock size={16} className="mr-3" />
                Add Daily Log
              </button>
              <button
                onClick={() => navigate('/allowances')}
                className="w-full btn btn-outline justify-start hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-colors duration-200"
              >
                <Coins size={16} className="mr-3" />
                Manage Allowances
              </button>
            </div>
                  </div>
      </div>

      {/* Employee Breakdown */}
      <div className="card mb-8">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Employee Breakdown</h3>
        </div>
        <div className="card-body">
          <div className="flex space-x-8">
            <div>
              <p className="text-sm text-gray-600">Company Visa</p>
              <p className="text-xl font-bold">{stats.permanentEmployees}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Flexi Visa</p>
              <p className="text-xl font-bold">{stats.flexiVisaEmployees}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Man Power Supply</p>
              <p className="text-xl font-bold">{stats.manpowerSupplyEmployees}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 tracking-tight mb-4">Recent Activity</h3>
            {stats.recentLogs.length > 0 ? (
              <div className="space-y-3">
                {stats.recentLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {log.employees?.name || 'Unknown Employee'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {log.sites?.name || 'Unknown Site'} • {new Date(log.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {(log.nt_hours + log.rot_hours + log.hot_hours).toFixed(1)}h
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No recent activity</p>
                <button
                  onClick={() => navigate('/daily-logs')}
                  className="btn btn-primary"
                >
                  Add First Log
                </button>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 tracking-tight mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <CheckCircle size={16} className="text-green-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Database Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <CheckCircle size={16} className="text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Authentication Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center">
                  <AlertCircle size={16} className="text-yellow-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Ready for Data Entry</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 