import React, { useState } from 'react';
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

const LeadershipDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { selectedMonth, isCurrentMonth, getSelectedMonthName } = useMonth();
  const [viewMode, setViewMode] = useState('leadership'); // leadership, site-detail
  const [selectedSite, setSelectedSite] = useState(null);

  // Calculate days remaining for project completion
  const calculateDaysRemaining = (site) => {
    const endDate = new Date(site.expectedEndDate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const [leadershipStats, setLeadershipStats] = useState({
    totalSites: 5,
    totalEmployees: 24,
    totalExpenses: 45680,
    totalHours: 3840,
    averageCostPerHour: 11.89,
    sitesOverview: [
      {
        id: 'site-1',
        name: 'Site A - Main Office',
        code: 'SITE-A',
        status: 'active',
        employeeCount: 8,
        totalHours: 128, // 2 days * 8 employees * 8 hours
        totalExpenses: 1520, // Much lower for early month
        quotationAmount: 20000,
        plannedHours: 800,
        actualHours: 128,
        plannedMilestones: 10,
        completedMilestones: 2, // Only 2 days into month
        projectStartDate: '2025-08-01',
        expectedEndDate: '2026-01-31', // ~150 days remaining
        clientName: 'ABC Corporation',
        clientContact: '+973 1234 5678',
        clientEmail: 'project@abccorp.com',
        riskLevel: 'low'
      },
      {
        id: 'site-2',
        name: 'Site B - Workshop',
        code: 'SITE-B',
        status: 'active',
        employeeCount: 6,
        totalHours: 96, // 2 days * 6 employees * 8 hours
        totalExpenses: 1280, // Much lower for early month
        quotationAmount: 15000,
        plannedHours: 520,
        actualHours: 96,
        plannedMilestones: 8,
        completedMilestones: 1, // Only 2 days into month
        projectStartDate: '2025-08-01',
        expectedEndDate: '2025-12-31', // ~120 days remaining
        clientName: 'XYZ Industries',
        clientContact: '+973 9876 5432',
        clientEmail: 'manager@xyzind.com',
        riskLevel: 'low'
      },
      {
        id: 'site-3',
        name: 'Site C - Construction',
        code: 'SITE-C',
        status: 'active',
        employeeCount: 5,
        totalHours: 80, // 2 days * 5 employees * 8 hours
        totalExpenses: 960, // Much lower for early month
        quotationAmount: 12000,
        plannedHours: 600,
        actualHours: 80,
        plannedMilestones: 12,
        completedMilestones: 1, // Only 2 days into month
        projectStartDate: '2025-08-01',
        expectedEndDate: '2026-02-28', // ~180 days remaining
        clientName: 'DEF Construction',
        clientContact: '+973 5555 1234',
        clientEmail: 'site@defconstruction.com',
        riskLevel: 'medium'
      },
      {
        id: 'site-4',
        name: 'Site D - Warehouse',
        code: 'SITE-D',
        status: 'active',
        employeeCount: 3,
        totalHours: 48, // 2 days * 3 employees * 8 hours
        totalExpenses: 560, // Much lower for early month
        quotationAmount: 7000,
        plannedHours: 250,
        actualHours: 48,
        plannedMilestones: 6,
        completedMilestones: 1, // Only 2 days into month
        projectStartDate: '2025-07-15', // Started earlier
        expectedEndDate: '2025-08-15', // Overdue by 15 days
        clientName: 'GHI Logistics',
        clientContact: '+973 7777 8888',
        clientEmail: 'warehouse@ghilogistics.com',
        riskLevel: 'high' // Changed to high risk due to being overdue
      },
      {
        id: 'site-5',
        name: 'Site E - Maintenance',
        code: 'SITE-E',
        status: 'active',
        employeeCount: 2,
        totalHours: 32, // 2 days * 2 employees * 8 hours
        totalExpenses: 248, // Much lower for early month
        quotationAmount: 3000,
        plannedHours: 180,
        actualHours: 32,
        plannedMilestones: 4,
        completedMilestones: 1, // Only 2 days into month
        projectStartDate: '2025-08-01',
        expectedEndDate: '2025-12-31', // ~120 days remaining
        clientName: 'JKL Services',
        clientContact: '+973 9999 0000',
        clientEmail: 'maintenance@jklservices.com',
        riskLevel: 'low'
      }
    ],
    recentAlerts: [
      { id: 1, type: 'info', message: 'Site A project started successfully', site: 'SITE-A', time: '2 hours ago' },
      { id: 2, type: 'success', message: 'Site B team mobilized and ready', site: 'SITE-B', time: '4 hours ago' },
      { id: 3, type: 'warning', message: 'Site C awaiting material delivery', site: 'SITE-C', time: '6 hours ago' },
      { id: 4, type: 'info', message: 'Site D equipment setup completed', site: 'SITE-D', time: '8 hours ago' },
      { id: 5, type: 'success', message: 'Site E maintenance schedule confirmed', site: 'SITE-E', time: '1 day ago' }
    ],
    performanceMetrics: {
      overallEfficiency: 15.2, // Much lower for early month
      costVariance: 2.3, // Positive variance for early stage
      scheduleVariance: -1.8, // Slightly behind schedule
      qualityScore: 98.2, // High quality for early stage
      highRiskProjects: 1 // Only one medium risk project
    }
  });

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