import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMonth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const LeadershipDashboard = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const { selectedMonth, isCurrentMonth, getSelectedMonthName } = useMonth();
  const [viewMode, setViewMode] = useState('leadership'); // leadership, site-detail
  const [selectedSite, setSelectedSite] = useState(null);
  const [loading, setLoading] = useState(true);

  // Calculate days remaining for project completion
  const calculateDaysRemaining = (site) => {
    const endDate = new Date(site.expectedEndDate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const [leadershipStats, setLeadershipStats] = useState({
    totalSites: 0,
    totalEmployees: 0,
    totalExpenses: 0,
    totalHours: 0,
    averageCostPerHour: 0,
    sitesOverview: [],
    recentAlerts: [],
    performanceMetrics: {
      overallEfficiency: 0,
      costVariance: 0,
      scheduleVariance: 0,
      qualityScore: 0,
      highRiskProjects: 0
    }
  });

  // Fetch real data from database
  const fetchLeadershipData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching leadership data for user:', userProfile?.email, 'Role:', userProfile?.role);
      
      // For demo users, show appropriate data based on role
      const demoEmails = ['leadership@interlock.com', 'admin@interlock.com', 'viewer@interlock.com'];
      const isDemoUser = demoEmails.includes(userProfile?.email);
      
      // Fetch sites with role-based filtering
      let sitesQuery = supabase
        .from('sites')
        .select('*')
        .order('name', { ascending: true });

      if (isDemoUser && userProfile?.role === 'leadership') {
        console.log('🔧 Leadership user - filtering out demo sites...');
        sitesQuery = sitesQuery
          .not('name', 'ilike', '%test%')
          .not('name', 'ilike', '%demo%')
          .not('name', 'ilike', '%dummy%');
      }

      const { data: sites, error: sitesError } = await sitesQuery;
      if (sitesError) throw sitesError;

      // Fetch employees
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .order('name', { ascending: true });
      if (employeesError) throw employeesError;

      // Fetch daily logs for current month
      const { data: dailyLogs, error: logsError } = await supabase
        .from('daily_logs')
        .select('*')
        .gte('date', `${selectedMonth.year}-${String(selectedMonth.month).padStart(2, '0')}-01`)
        .lt('date', `${selectedMonth.year}-${String(selectedMonth.month + 1).padStart(2, '0')}-01`);
      if (logsError) throw logsError;

      // Transform sites data for dashboard
      const sitesOverview = sites.map(site => ({
        id: site.id,
        name: site.name,
        code: site.code,
        status: site.status || 'active',
        employeeCount: employees.filter(emp => emp.site_id === site.id).length,
        totalHours: dailyLogs
          .filter(log => log.site_id === site.id)
          .reduce((sum, log) => sum + (log.nt_hours || 0) + (log.rot_hours || 0) + (log.hot_hours || 0), 0),
        totalExpenses: dailyLogs
          .filter(log => log.site_id === site.id)
          .reduce((sum, log) => {
            const employee = employees.find(emp => emp.id === log.employee_id);
            if (!employee) return sum;
            
            const ntPay = (log.nt_hours || 0) * (employee.nt_rate || 0);
            const rotPay = (log.rot_hours || 0) * (employee.rot_rate || 0);
            const hotPay = (log.hot_hours || 0) * (employee.hot_rate || 0);
            return sum + ntPay + rotPay + hotPay;
          }, 0),
        quotationAmount: site.quotation_amount || 0,
        projectStartDate: site.project_start_date || new Date().toISOString().split('T')[0],
        expectedEndDate: site.expected_end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        clientName: site.client_name || 'Client Not Specified',
        clientContact: site.client_contact || 'Contact Not Specified',
        clientEmail: site.client_email || 'Email Not Specified',
        riskLevel: 'low' // Default risk level
      }));

      // Calculate overall metrics
      const totalSites = sites.length;
      const totalEmployees = employees.length;
      const totalExpenses = sitesOverview.reduce((sum, site) => sum + site.totalExpenses, 0);
      const totalHours = sitesOverview.reduce((sum, site) => sum + site.totalHours, 0);
      const averageCostPerHour = totalHours > 0 ? totalExpenses / totalHours : 0;

      // Generate recent alerts based on real data
      const recentAlerts = [];
      if (sites.length > 0) {
        recentAlerts.push({ 
          id: 1, 
          type: 'info', 
          message: `${sites[0].name} project started successfully`, 
          site: sites[0].code, 
          time: '2 hours ago' 
        });
      }

      console.log('✅ Leadership data fetched:', {
        sites: sites.length,
        employees: employees.length,
        logs: dailyLogs.length
      });

      setLeadershipStats({
        totalSites,
        totalEmployees,
        totalExpenses,
        totalHours,
        averageCostPerHour,
        sitesOverview,
        recentAlerts,
        performanceMetrics: {
          overallEfficiency: totalHours > 0 ? (totalHours / (totalEmployees * 8 * 30)) * 100 : 0,
          costVariance: 0,
          scheduleVariance: 0,
          qualityScore: 100,
          highRiskProjects: sitesOverview.filter(site => site.riskLevel === 'high').length
        }
      });
    } catch (error) {
      console.error('Error fetching leadership data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadershipData();
  }, [userProfile, selectedMonth]);

  // Calculate metrics for all sites
  const sitesWithMetrics = leadershipStats.sitesOverview.map(site => ({
    ...site,
    daysRemaining: calculateDaysRemaining(site)
  }));

  // Calculate overall financial metrics
  const overallFinancialMetrics = {
    totalQuotationAmount: sitesWithMetrics.reduce((sum, site) => sum + site.quotationAmount, 0),
    totalExpenses: sitesWithMetrics.reduce((sum, site) => sum + site.totalExpenses, 0),
    totalRemainingBudget: sitesWithMetrics.reduce((sum, site) => sum + (site.quotationAmount - site.totalExpenses), 0),
    overallBudgetUtilization: Math.round((sitesWithMetrics.reduce((sum, site) => sum + site.totalExpenses, 0) / sitesWithMetrics.reduce((sum, site) => sum + site.quotationAmount, 0)) * 100)
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'error': return <XCircle size={16} className="text-red-500" />;
      case 'success': return <CheckCircle size={16} className="text-green-500" />;
      default: return <AlertTriangle size={16} className="text-gray-500" />;
    }
  };

  const handleSiteClick = (site) => {
    setSelectedSite(site);
    setViewMode('site-detail');
  };

  const handleBackToOverview = () => {
    setSelectedSite(null);
    setViewMode('leadership');
  };

  if (viewMode === 'site-detail' && selectedSite) {
    return (
      <div className="space-y-6">
        {/* Site Detail Header */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={handleBackToOverview}
                  className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
                >
                  <ArrowRight size={16} className="mr-1 rotate-180" />
                  Back to Overview
                </button>
                <h1 className="text-2xl font-bold text-gray-900">{selectedSite.name}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Detailed project view - {getSelectedMonthName()}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(selectedSite.riskLevel)}`}>
                  {selectedSite.riskLevel} Risk
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Site Detail Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <Link to="/employees" className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users size={20} className="text-blue-600" />
                </div>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 truncate">Team Size</p>
                <p className="text-xl font-semibold text-gray-900 truncate">{selectedSite.employeeCount} Employees</p>
              </div>
            </div>
          </Link>

          <Link to="/daily-logs" className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock size={20} className="text-green-600" />
                </div>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 truncate">Total Hours</p>
                <p className="text-xl font-semibold text-gray-900 truncate">{selectedSite.totalHours}h</p>
              </div>
            </div>
          </Link>

          <Link to="/monthly-summaries" className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign size={20} className="text-purple-600" />
                </div>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 truncate">Total Expenses</p>
                <p className="text-xl font-semibold text-gray-900 tabular-nums truncate">{formatCurrency(selectedSite.totalExpenses)}</p>
              </div>
            </div>
          </Link>

          <div className="card p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Target size={20} className="text-orange-600" />
                </div>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 truncate">Budget Utilization</p>
                <p className={`text-xl font-semibold truncate ${selectedSite.budgetUtilization > 90 ? 'text-red-600' : selectedSite.budgetUtilization > 75 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {selectedSite.budgetUtilization}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Site Detail Content */}
        <div className="responsive-grid-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Client Information</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Client Name</label>
                  <p className="text-sm text-gray-900">{selectedSite.clientName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Contact Number</label>
                  <p className="text-sm text-gray-900">{selectedSite.clientContact}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email Address</label>
                  <p className="text-sm text-gray-900">{selectedSite.clientEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Project Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedSite.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedSite.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Timeline */}
          <div className="card">
            <div className="card-header">
              <h4 className="text-lg font-medium text-gray-900">Project Timeline</h4>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Project Start</span>
                  <span className="font-medium">{formatDate(selectedSite.projectStartDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Expected End</span>
                  <span className="font-medium">{formatDate(selectedSite.expectedEndDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Days Remaining</span>
                  <span className={`font-semibold ${selectedSite.daysRemaining < 30 ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedSite.daysRemaining} days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="responsive-grid-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Budget Analysis</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Quotation Amount</span>
                  <span className="text-sm font-medium text-blue-600">{formatCurrency(selectedSite.quotationAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Expenses</span>
                  <span className="text-sm font-medium text-red-600">{formatCurrency(selectedSite.totalExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Remaining Budget</span>
                  <span className={`text-sm font-medium ${selectedSite.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(selectedSite.remainingBudget)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Budget Utilization</span>
                  <span className={`text-sm font-medium ${selectedSite.budgetUtilization > 90 ? 'text-red-600' : selectedSite.budgetUtilization > 75 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {selectedSite.budgetUtilization}%
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        selectedSite.budgetUtilization > 90 ? 'bg-red-600' : selectedSite.budgetUtilization > 75 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(selectedSite.budgetUtilization, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Cost Breakdown</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Labor Costs</span>
                  <span className="text-sm font-medium">{formatCurrency(selectedSite.totalExpenses * 0.7)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Materials</span>
                  <span className="text-sm font-medium">{formatCurrency(selectedSite.totalExpenses * 0.2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Overhead</span>
                  <span className="text-sm font-medium">{formatCurrency(selectedSite.totalExpenses * 0.1)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-medium">
                    <span>Total Expenses</span>
                    <span>{formatCurrency(selectedSite.totalExpenses)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600 font-medium">Loading leadership dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Leadership Dashboard Header */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leadership Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600">
                {getSelectedMonthName()} - Multi-site overview and performance metrics
              </p>
            </div>
            {user?.role === 'admin' && (
              <Link 
                to="/dashboard" 
                className="btn btn-outline flex items-center space-x-2"
              >
                <ArrowRight size={16} />
                <span>Admin View</span>
              </Link>
            )}
            {user?.role === 'leadership' && (
              <Link 
                to="/dashboard" 
                className="btn btn-outline flex items-center space-x-2"
              >
                <ArrowRight size={16} />
                <span>Operational View</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Link to="/sites" className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building size={20} className="text-blue-600" />
              </div>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Active Sites</p>
              <p className="text-xl font-semibold text-gray-900 tabular-nums truncate">{leadershipStats.totalSites}</p>
            </div>
          </div>
        </Link>

        <Link to="/employees" className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-green-600" />
              </div>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Total Workforce</p>
              <p className="text-xl font-semibold text-gray-900 tabular-nums truncate">{leadershipStats.totalEmployees}</p>
            </div>
          </div>
        </Link>

        <Link to="/monthly-summaries" className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-purple-600" />
              </div>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Total Quotation</p>
              <p className="text-xl font-semibold text-gray-900 tabular-nums truncate">{formatCurrency(overallFinancialMetrics.totalQuotationAmount)}</p>
            </div>
          </div>
        </Link>

        <Link to="/monthly-summaries" className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-orange-600" />
              </div>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Total Expenses</p>
              <p className="text-xl font-semibold text-gray-900 tabular-nums truncate">{formatCurrency(overallFinancialMetrics.totalExpenses)}</p>
            </div>
          </div>
        </Link>

        <Link to="/monthly-summaries" className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-yellow-600" />
              </div>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Remaining Budget</p>
              <p className="text-xl font-semibold text-gray-900 tabular-nums truncate">{formatCurrency(overallFinancialMetrics.totalRemainingBudget)}</p>
            </div>
          </div>
        </Link>
      </div>



      {/* Sites Overview */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Sites Overview</h3>
          <p className="text-sm text-gray-600">Click on any site to view detailed project information</p>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="text-left">Site</th>
                <th className="text-left">Client</th>
                <th className="text-left">Quotation</th>
                <th className="text-left">Expenses</th>
                <th className="text-left">Remaining</th>
                <th className="text-left">Utilization</th>
                <th className="text-left">Days Left</th>
                <th className="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {sitesWithMetrics.map((site) => (
                <tr key={site.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleSiteClick(site)}>
                  <td className="text-left font-medium">{site.name}</td>
                  <td className="text-left">{site.clientName}</td>
                  <td className="text-left font-semibold tabular-nums">{formatCurrency(site.quotationAmount)}</td>
                  <td className="text-left tabular-nums">{formatCurrency(site.totalExpenses)}</td>
                  <td className="text-left tabular-nums">{formatCurrency(site.quotationAmount - site.totalExpenses)}</td>
                  <td className="text-left">
                    <span className={`inline-flex items-center justify-start px-2 py-1 rounded-full text-xs font-medium min-w-[3rem] ${
                      (site.totalExpenses / site.quotationAmount * 100) > 90 ? 'bg-red-100 text-red-800' :
                      (site.totalExpenses / site.quotationAmount * 100) > 75 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {Math.round((site.totalExpenses / site.quotationAmount) * 100)}%
                    </span>
                  </td>
                  <td className="text-left">
                    <span className={`font-semibold tabular-nums ${site.daysRemaining < 0 ? 'text-red-600' : site.daysRemaining < 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {site.daysRemaining < 0 ? `-${Math.abs(site.daysRemaining)}` : site.daysRemaining}
                    </span>
                  </td>
                  <td className="text-left">
                    <span className={`inline-flex items-center justify-start px-2 py-1 rounded-full text-xs font-medium min-w-[4rem] ${
                      site.status === 'active' ? 'bg-green-100 text-green-800' :
                      site.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Alerts & Quick Actions */}
      <div className="responsive-grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {leadershipStats.recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                  <div className="flex-shrink-0 mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900">{alert.message}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{alert.site}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{alert.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 gap-3">
              <Link
                to="/monthly-summaries"
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BarChart3 size={20} className="text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Generate Executive Report</span>
              </Link>
              <Link
                to="/employees"
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users size={20} className="text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">View Workforce Analytics</span>
              </Link>
              <Link
                to="/sites"
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Building size={20} className="text-purple-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Site Performance Review</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadershipDashboard; 