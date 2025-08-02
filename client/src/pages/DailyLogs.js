import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  User,
  Save,
  Calculator,
  Clock,
  DollarSign,
  Briefcase,
  XCircle,
  Calendar,
  MapPin,
  Building,
  Users,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMonth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import EmployeeModal from '../components/EmployeeModal';

const DailyLogs = () => {
  const { user } = useAuth();
  const { selectedMonth, isCurrentMonth, getSelectedMonthName } = useMonth();
  const isEditor = ['admin', 'editor'].includes(user?.role);
  const [employees, setEmployees] = useState([]);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showBulkEntry, setShowBulkEntry] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [ntHours, setNtHours] = useState(0);
  const [notHours, setNotHours] = useState(0);
  const [hotHours, setHotHours] = useState(0);
  const [adjustmentHours, setAdjustmentHours] = useState(0);
  const [bulkNtHours, setBulkNtHours] = useState(0);
  const [bulkNotHours, setBulkNotHours] = useState(0);
  const [bulkHotHours, setBulkHotHours] = useState(0);
  const [bulkAdjustmentHours, setBulkAdjustmentHours] = useState(0);
  const [selectedSite, setSelectedSite] = useState('');
  const [isHoliday, setIsHoliday] = useState(false);
  const [isFriday, setIsFriday] = useState(false);
  const [calculations, setCalculations] = useState(null);
  const [selectedEmployeeInfo, setSelectedEmployeeInfo] = useState(null);
  const [bulkData, setBulkData] = useState('');
  const [bulkPreview, setBulkPreview] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [showHolidayManager, setShowHolidayManager] = useState(false);
  const [newHoliday, setNewHoliday] = useState('');
  const [sites, setSites] = useState([]);

  useEffect(() => {
    fetchEmployees();
    fetchDailyLogs();
    fetchSites();
  }, [selectedMonth]);

  useEffect(() => {
    const date = new Date(selectedDate);
    setIsFriday(date.getDay() === 5);
    const isHolidayDate = holidays.includes(selectedDate);
    setIsHoliday(isHolidayDate);
  }, [selectedDate, holidays]);

  useEffect(() => {
    if (selectedEmployee) {
      const employee = employees.find(emp => emp.id === selectedEmployee);
      setSelectedEmployeeInfo(employee);
    } else {
      setSelectedEmployeeInfo(null);
    }
  }, [selectedEmployee, employees]);

  useEffect(() => {
    if (selectedEmployee && (ntHours > 0 || notHours > 0 || hotHours > 0 || adjustmentHours !== 0)) {
      calculateWages();
    } else {
      setCalculations(null);
    }
  }, [selectedEmployee, ntHours, notHours, hotHours, adjustmentHours, isHoliday, isFriday]);

  const fetchEmployees = async () => {
    try {
      const sampleEmployees = [
        // Workshop Employees (Fixed Salary)
        {
          id: 'emp-1',
          name: 'DEEPAK KUMAR',
          cpr: '123456789',
          category: 'Workshop',
          doj: '2024-01-15',
          previousRate: 120.0,
          currentRate: 130.0,
          employmentType: 'permanent',
          workType: 'workshop',
          salaryType: 'fixed'
        },
        {
          id: 'emp-2',
          name: 'ARUNKUMAR PC',
          cpr: '987654321',
          category: 'Workshop',
          doj: '2024-02-01',
          previousRate: 200.0,
          currentRate: 210.0,
          employmentType: 'permanent',
          workType: 'workshop',
          salaryType: 'fixed'
        },
        {
          id: 'emp-3',
          name: 'AMAL KOORARA',
          cpr: '456789123',
          category: 'Workshop',
          doj: '2024-01-20',
          previousRate: 120.0,
          currentRate: 130.0,
          employmentType: 'permanent',
          workType: 'workshop',
          salaryType: 'fixed'
        },
        {
          id: 'emp-4',
          name: 'SHIFIN RAPHEL',
          cpr: '789123456',
          category: 'Workshop',
          doj: '2024-02-15',
          previousRate: 120.0,
          currentRate: 130.0,
          employmentType: 'permanent',
          workType: 'workshop',
          salaryType: 'fixed'
        },
        {
          id: 'emp-5',
          name: 'ARUN MON',
          cpr: '321654987',
          category: 'Workshop',
          doj: '2024-01-10',
          previousRate: 180.0,
          currentRate: 190.0,
          employmentType: 'permanent',
          workType: 'workshop',
          salaryType: 'fixed'
        },
        {
          id: 'emp-6',
          name: 'AJITH KUMAR',
          cpr: '654987321',
          category: 'Workshop',
          doj: '2024-02-20',
          previousRate: 130.0,
          currentRate: 130.0,
          employmentType: 'permanent',
          workType: 'workshop',
          salaryType: 'fixed'
        },
        {
          id: 'emp-7',
          name: 'VISHNU',
          cpr: '147258369',
          category: 'Workshop',
          doj: '2024-01-25',
          previousRate: 120.0,
          currentRate: 120.0,
          employmentType: 'permanent',
          workType: 'workshop',
          salaryType: 'fixed'
        },
        {
          id: 'emp-8',
          name: 'RAVI KAMMARI',
          cpr: '258369147',
          category: 'Workshop',
          doj: '2024-02-10',
          previousRate: 140.0,
          currentRate: 140.0,
          employmentType: 'permanent',
          workType: 'workshop',
          salaryType: 'fixed'
        },
        {
          id: 'emp-9',
          name: 'YADHUKRISHNAN',
          cpr: '369147258',
          category: 'Workshop',
          doj: '2024-01-30',
          previousRate: 125.0,
          currentRate: 135.0,
          employmentType: 'permanent',
          workType: 'workshop',
          salaryType: 'fixed'
        },
        // Site Employees (Fixed Salary)
        {
          id: 'emp-10',
          name: 'PRADEEP KUMAR',
          cpr: '951753852',
          category: 'Site',
          doj: '2024-01-05',
          previousRate: 180.0,
          currentRate: 190.0,
          employmentType: 'permanent',
          workType: 'site',
          salaryType: 'fixed'
        },
        {
          id: 'emp-11',
          name: 'JOHN SIMON',
          cpr: '753951852',
          category: 'Site',
          doj: '2024-02-05',
          previousRate: 110.0,
          currentRate: 115.0,
          employmentType: 'permanent',
          workType: 'site',
          salaryType: 'fixed'
        },
        {
          id: 'emp-12',
          name: 'RAJESH',
          cpr: '852753951',
          category: 'Site',
          doj: '2024-01-12',
          previousRate: 130.0,
          currentRate: 130.0,
          employmentType: 'permanent',
          workType: 'site',
          salaryType: 'fixed'
        },
        {
          id: 'emp-13',
          name: 'SREENATH KANKKARA',
          cpr: '753852951',
          category: 'Site',
          doj: '2024-02-12',
          previousRate: 120.0,
          currentRate: 120.0,
          employmentType: 'permanent',
          workType: 'site',
          salaryType: 'fixed'
        },
        // Site Employees (Hourly)
        {
          id: 'emp-14',
          name: 'MD MATALIB MIAH',
          cpr: '159357456',
          category: 'Site',
          doj: '2024-01-08',
          previousRate: 0.750,
          currentRate: 0.800,
          employmentType: 'permanent',
          workType: 'site',
          salaryType: 'hourly'
        },
        {
          id: 'emp-15',
          name: 'KABIR HOSSAIN',
          cpr: '357159456',
          category: 'Site',
          doj: '2024-02-08',
          previousRate: 1.200,
          currentRate: 1.300,
          employmentType: 'permanent',
          workType: 'site',
          salaryType: 'hourly'
        },
        {
          id: 'emp-16',
          name: 'ABDUL RAHIM',
          cpr: '456159357',
          category: 'Site',
          doj: '2024-01-18',
          previousRate: 0.800,
          currentRate: 0.800,
          employmentType: 'permanent',
          workType: 'site',
          salaryType: 'hourly'
        },
        {
          id: 'emp-17',
          name: 'ALAM ABUL KASHEM',
          cpr: '159456357',
          category: 'Site',
          doj: '2024-02-18',
          previousRate: 0.688,
          currentRate: 0.750,
          employmentType: 'permanent',
          workType: 'site',
          salaryType: 'hourly'
        },
        {
          id: 'emp-18',
          name: 'ANOWAR HOSSAIN',
          cpr: '357456159',
          category: 'Site',
          doj: '2024-01-22',
          previousRate: 0.750,
          currentRate: 0.800,
          employmentType: 'permanent',
          workType: 'site',
          salaryType: 'hourly'
        },
        {
          id: 'emp-19',
          name: 'ABDUL MIAH ISAMAIL',
          cpr: '456357159',
          category: 'Site',
          doj: '2024-02-22',
          previousRate: 0.750,
          currentRate: 0.800,
          employmentType: 'permanent',
          workType: 'site',
          salaryType: 'hourly'
        },
        // Flexi Visa Employees (Always Hourly)
        {
          id: 'emp-20',
          name: 'FLEXI EMPLOYEE 1',
          cpr: '111222333',
          category: 'Flexi Visa',
          doj: '2024-03-01',
          previousRate: 1.000,
          currentRate: 1.100,
          employmentType: 'flexi',
          workType: 'site',
          salaryType: 'hourly'
        },
        {
          id: 'emp-21',
          name: 'FLEXI EMPLOYEE 2',
          cpr: '222333444',
          category: 'Flexi Visa',
          doj: '2024-03-05',
          previousRate: 0.900,
          currentRate: 1.000,
          employmentType: 'flexi',
          workType: 'site',
          salaryType: 'hourly'
        },
        {
          id: 'emp-22',
          name: 'FLEXI EMPLOYEE 3',
          cpr: '333444555',
          category: 'Flexi Visa',
          doj: '2024-03-10',
          previousRate: 1.100,
          currentRate: 1.200,
          employmentType: 'flexi',
          workType: 'site',
          salaryType: 'hourly'
        },
        {
          id: 'emp-23',
          name: 'FLEXI EMPLOYEE 4',
          cpr: '444555666',
          category: 'Flexi Visa',
          doj: '2024-03-15',
          previousRate: 0.850,
          currentRate: 0.950,
          employmentType: 'flexi',
          workType: 'site',
          salaryType: 'hourly'
        },
        {
          id: 'emp-24',
          name: 'FLEXI EMPLOYEE 5',
          cpr: '555666777',
          category: 'Flexi Visa',
          doj: '2024-03-20',
          previousRate: 1.050,
          currentRate: 1.150,
          employmentType: 'flexi',
          workType: 'site',
          salaryType: 'hourly'
        }
      ];
      setEmployees(sampleEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    }
  };

  const fetchDailyLogs = async () => {
    try {
      setLoading(true);
      // Sample daily logs for current month
      const sampleLogs = [
        {
          id: 1,
          date: '2025-03-01',
          employeeName: 'DEEPAK KUMAR',
          ntHours: 8,
          notHours: 2,
          hotHours: 0,
          adjustmentHours: 0,
          siteRef: 'WS#91',
          isHoliday: false,
          isFriday: false,
          totalPay: 1040
        }
      ];
      
      // Filter by selected month
      const filteredLogs = sampleLogs.filter(log => {
        const logMonth = new Date(log.date).getMonth() + 1; // getMonth() returns 0-11, we need 1-12
        const logYear = new Date(log.date).getFullYear();
        return logMonth === selectedMonth.month && logYear === selectedMonth.year;
      });
      
      setDailyLogs(filteredLogs);
    } catch (error) {
      console.error('Error fetching daily logs:', error);
      toast.error('Failed to fetch daily logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      const sampleSites = [
        { id: 'site-1', name: 'Workshop #91', code: 'WS#91' },
        { id: 'site-2', name: 'Site A', code: 'SITE-A' },
        { id: 'site-3', name: 'Site B', code: 'SITE-B' },
        { id: 'site-4', name: 'Workshop #86', code: 'WS#86' },
        { id: 'site-5', name: 'ILS#175', code: 'ILS#175' },
        { id: 'site-6', name: 'Site C', code: 'SITE-C' },
        { id: 'site-7', name: 'Workshop #92', code: 'WS#92' },
        { id: 'site-8', name: 'Site D', code: 'SITE-D' }
      ];
      setSites(sampleSites);
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const calculateWages = () => {
    if (!selectedEmployeeInfo) return;

    const employee = selectedEmployeeInfo;
    const normalPay = (ntHours || 0) * (employee.currentRate || 0);
    const regularOTPay = (notHours || 0) * (employee.currentRate || 0) * 1.5;
    const holidayOTPay = (hotHours || 0) * (employee.currentRate || 0) * 2;
    const adjustmentPay = (adjustmentHours || 0) * (employee.currentRate || 0);
    const totalPay = normalPay + regularOTPay + holidayOTPay + adjustmentPay;
    const allowance = 0; // Fixed allowance
    const finalPay = totalPay + allowance;
    const deductions = 0;
    const advanceDeductions = 0;
    const netPay = finalPay - deductions - advanceDeductions;
    const roundedNetPay = Math.round(netPay * 10) / 10;

    setCalculations({
      normalPay,
      regularOTPay,
      holidayOTPay,
      adjustmentPay,
      totalPay,
      allowance,
      finalPay,
      deductions,
      advanceDeductions,
      netPay,
      roundedNetPay
    });
  };

  const calculateAdvanceDeductions = (employeeId) => {
    // Sample advance deductions calculation
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedEmployee || !selectedDate || !selectedSite) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (ntHours === 0 && notHours === 0 && hotHours === 0 && adjustmentHours === 0) {
      toast.error('Please enter at least some hours');
      return;
    }

    try {
      const newLog = {
        id: Date.now(),
        date: selectedDate,
        employeeName: selectedEmployeeInfo.name,
        ntHours,
        notHours,
        hotHours,
        adjustmentHours,
        siteRef: sites.find(s => s.id === selectedSite)?.code || selectedSite,
        isHoliday,
        isFriday,
        totalPay: calculations?.totalPay || 0
      };

      setDailyLogs(prev => [newLog, ...prev]);
      toast.success('Daily log added successfully');
      
      // Reset form
      setSelectedEmployee('');
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setNtHours(0);
      setNotHours(0);
      setHotHours(0);
      setAdjustmentHours(0);
      setSelectedSite('');
      setIsHoliday(false);
      setIsFriday(false);
      setCalculations(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding daily log:', error);
      toast.error('Failed to add daily log');
    }
  };

  const handleBulkSubmit = () => {
    // Handle CSV bulk import
    console.log('Bulk import submitted');
  };

  const handleBulkEntrySubmit = async (e) => {
    e.preventDefault();
    
    if (selectedEmployees.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }

    if (!selectedDate || !selectedSite) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (bulkNtHours === 0 && bulkNotHours === 0 && bulkHotHours === 0 && bulkAdjustmentHours === 0) {
      toast.error('Please enter at least some hours');
      return;
    }

    try {
      const newLogs = selectedEmployees.map(employeeId => {
        const employee = employees.find(emp => emp.id === employeeId);
        const normalPay = (bulkNtHours || 0) * (employee.currentRate || 0);
        const regularOTPay = (bulkNotHours || 0) * (employee.currentRate || 0) * 1.5;
        const holidayOTPay = (bulkHotHours || 0) * (employee.currentRate || 0) * 2;
        const adjustmentPay = (bulkAdjustmentHours || 0) * (employee.currentRate || 0);
        const totalPay = normalPay + regularOTPay + holidayOTPay + adjustmentPay;

        return {
          id: Date.now() + Math.random(),
          date: selectedDate,
          employeeName: employee.name,
          ntHours: bulkNtHours,
          notHours: bulkNotHours,
          hotHours: bulkHotHours,
          adjustmentHours: bulkAdjustmentHours,
          siteRef: sites.find(s => s.id === selectedSite)?.code || selectedSite,
          isHoliday,
          isFriday,
          totalPay
        };
      });

      setDailyLogs(prev => [...newLogs, ...prev]);
      toast.success(`Added daily logs for ${selectedEmployees.length} employees`);
      
      // Reset form
      setSelectedEmployees([]);
      setBulkNtHours(0);
      setBulkNotHours(0);
      setBulkHotHours(0);
      setBulkAdjustmentHours(0);
      setSelectedSite('');
      setShowBulkEntry(false);
    } catch (error) {
      console.error('Error adding bulk daily logs:', error);
      toast.error('Failed to add daily logs');
    }
  };

  const handleEmployeeSelection = (employeeId, checked) => {
    if (checked) {
      setSelectedEmployees(prev => [...prev, employeeId]);
    } else {
      setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
    }
  };

  const selectAllEmployees = () => {
    setSelectedEmployees(employees.map(emp => emp.id));
  };

  const clearAllEmployees = () => {
    setSelectedEmployees([]);
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 'BHD 0';
    }
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
      month: 'short',
      day: 'numeric'
    });
  };

  const handleBulkImport = () => {
    // Bulk import logic
    toast.info('Bulk import functionality coming soon');
  };

  const exportTemplate = () => {
    const template = 'Employee Name/CPR,Date,NT Hours,ROT Hours,HOT Hours,Site Code\nDEEPAK KUMAR,2025-03-01,8,2,0,WS#91';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'daily_logs_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const addHoliday = () => {
    if (newHoliday && !holidays.includes(newHoliday)) {
      setHolidays(prev => [...prev, newHoliday]);
      setNewHoliday('');
      toast.success('Holiday added');
    }
  };

  const removeHoliday = (date) => {
    setHolidays(prev => prev.filter(h => h !== date));
    toast.success('Holiday removed');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Daily Logs</h1>
              <p className="mt-2 text-sm text-gray-600">
                {getSelectedMonthName()}
                {isCurrentMonth && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Current Month
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {isEditor && (
                <button
                  onClick={() => setShowForm(true)}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Add Daily Log</span>
                </button>
              )}
              {isEditor && (
                <button
                  onClick={() => setShowBulkEntry(true)}
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <Users size={16} />
                  <span>Bulk Entry</span>
                </button>
              )}
              {isEditor && (
                <button
                  onClick={() => setShowBulkImport(true)}
                  className="btn btn-outline flex items-center space-x-2"
                >
                  <Upload size={16} />
                  <span>Bulk Import</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Daily Log Form */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-3">
              <Clock size={20} className="text-primary-600" />
              <h3 className="text-lg font-medium text-gray-900">Add Daily Log</h3>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Employee Selection */}
              <div className="form-group">
                <label className="form-label">Select Employee *</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Choose an employee...</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} - {employee.category} (Rate: {employee.currentRate})
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto-filled Employee Information */}
              {selectedEmployeeInfo && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <User size={16} className="text-blue-600" />
                    <h4 className="text-sm font-medium text-gray-900">Employee Information</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 text-xs uppercase tracking-wide">Name</span>
                      <div className="font-medium">{selectedEmployeeInfo.name}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs uppercase tracking-wide">CPR No.</span>
                      <div className="font-medium">{selectedEmployeeInfo.cpr}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs uppercase tracking-wide">Current Rate</span>
                      <div className="font-medium text-red-600">{selectedEmployeeInfo.currentRate}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Date and Site Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Work Date *</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Site *</label>
                  <select
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    className="input"
                    required
                  >
                    <option value="">Choose a site...</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name} ({site.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hours Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="form-group">
                  <label className="form-label">Normal Time (N.T) Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={ntHours}
                    onChange={(e) => setNtHours(parseFloat(e.target.value) || 0)}
                    className="input"
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Normal Overtime (N.O.T) Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={notHours}
                    onChange={(e) => setNotHours(parseFloat(e.target.value) || 0)}
                    className="input"
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Holiday Overtime (H.O.T) Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={hotHours}
                    onChange={(e) => setHotHours(parseFloat(e.target.value) || 0)}
                    className="input"
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Adjustment Hours
                    <span className="text-xs text-gray-500 ml-1">(Extra time distribution)</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="-24"
                    max="24"
                    value={adjustmentHours}
                    onChange={(e) => setAdjustmentHours(parseFloat(e.target.value) || 0)}
                    className="input"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use for distributing extra hours across days
                  </p>
                </div>
              </div>

              {/* Day Type Checkboxes */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHoliday}
                    onChange={(e) => setIsHoliday(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Holiday</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFriday}
                    onChange={(e) => setIsFriday(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Friday</span>
                </label>
              </div>

              {/* Wage Calculation Display */}
              {calculations && (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Calculator size={16} className="text-green-600" />
                    <h4 className="text-sm font-medium text-gray-900">Wage Calculation</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">N.T Pay:</span>
                      <div className="font-medium tabular-nums">{formatCurrency(calculations.normalPay)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">R.O.T Pay:</span>
                      <div className="font-medium tabular-nums">{formatCurrency(calculations.regularOTPay)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">H.O.T Pay:</span>
                      <div className="font-medium tabular-nums">{formatCurrency(calculations.holidayOTPay)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Adjustment Pay:</span>
                      <div className="font-medium tabular-nums">{formatCurrency(calculations.adjustmentPay)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Pay:</span>
                      <div className="font-medium tabular-nums">{formatCurrency(calculations.totalPay)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>Save Daily Log</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Entry Form */}
      {showBulkEntry && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-3">
              <Users size={20} className="text-primary-600" />
              <h3 className="text-lg font-medium text-gray-900">Bulk Entry - Multiple Employees</h3>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handleBulkEntrySubmit} className="space-y-6">
              {/* Employee Selection */}
              <div className="form-group">
                <label className="form-label">Select Employees *</label>
                <div className="flex items-center space-x-3 mb-3">
                  <button
                    type="button"
                    onClick={selectAllEmployees}
                    className="btn btn-outline text-xs"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearAllEmployees}
                    className="btn btn-outline text-xs"
                  >
                    Clear All
                  </button>
                  <span className="text-sm text-gray-600">
                    {selectedEmployees.length} employee(s) selected
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {employees.map((employee) => (
                    <label key={employee.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={(e) => handleEmployeeSelection(employee.id, e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {employee.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {employee.category} - {employee.currentRate}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date and Site Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Work Date *</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Site *</label>
                  <select
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    className="input"
                    required
                  >
                    <option value="">Choose a site...</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name} ({site.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hours Input */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="form-group">
                  <label className="form-label">Normal Time (N.T)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={bulkNtHours}
                    onChange={(e) => setBulkNtHours(parseFloat(e.target.value) || 0)}
                    className="input"
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Regular O.T (R.O.T)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={bulkNotHours}
                    onChange={(e) => setBulkNotHours(parseFloat(e.target.value) || 0)}
                    className="input"
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Holiday O.T (H.O.T)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={bulkHotHours}
                    onChange={(e) => setBulkHotHours(parseFloat(e.target.value) || 0)}
                    className="input"
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Adjustment Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="-24"
                    max="24"
                    value={bulkAdjustmentHours}
                    onChange={(e) => setBulkAdjustmentHours(parseFloat(e.target.value) || 0)}
                    className="input"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Day Type Checkboxes */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHoliday}
                    onChange={(e) => setIsHoliday(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Holiday</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFriday}
                    onChange={(e) => setIsFriday(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Friday</span>
                </label>
              </div>

              {/* Preview */}
              {selectedEmployees.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Eye size={16} className="text-blue-600" />
                    <h4 className="text-sm font-medium text-gray-900">Preview</h4>
                  </div>
                  <p className="text-sm text-gray-700">
                    Will create daily logs for <strong>{selectedEmployees.length} employee(s)</strong> with:
                  </p>
                  <div className="mt-2 text-sm text-gray-600">
                    <span>N.T: {bulkNtHours}h, </span>
                    <span>R.O.T: {bulkNotHours}h, </span>
                    <span>H.O.T: {bulkHotHours}h, </span>
                    <span>Adjustment: {bulkAdjustmentHours}h</span>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBulkEntry(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>Save Bulk Logs ({selectedEmployees.length})</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Logs Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Daily Logs ({dailyLogs.length})
          </h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="min-w-[100px]">Date</th>
                <th className="min-w-[150px]">Employee</th>
                <th className="min-w-[80px] text-center">N.T Hours</th>
                <th className="min-w-[80px] text-center">N.O.T Hours</th>
                <th className="min-w-[80px] text-center">H.O.T Hours</th>
                <th className="min-w-[80px] text-center">Adjustment Hours</th>
                <th className="min-w-[100px]">Site Ref</th>
                <th className="min-w-[120px]">Day Type</th>
                <th className="min-w-[120px] text-right">Total Pay</th>
              </tr>
            </thead>
            <tbody>
              {dailyLogs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>No daily logs found</p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="mt-2 text-primary-600 hover:text-primary-500"
                    >
                      Add your first daily log
                    </button>
                  </td>
                </tr>
              ) : (
                dailyLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="font-medium">{formatDate(log.date)}</td>
                    <td>{log.employeeName}</td>
                    <td className="text-center">{log.ntHours}</td>
                    <td className="text-center">{log.notHours}</td>
                    <td className="text-center">{log.hotHours}</td>
                    <td className="text-center">{log.adjustmentHours}</td>
                    <td>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {log.siteRef}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        {log.isHoliday && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Holiday
                          </span>
                        )}
                        {log.isFriday && !log.isHoliday && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Friday
                          </span>
                        )}
                        {!log.isHoliday && !log.isFriday && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Regular
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-right font-semibold text-green-600 tabular-nums">
                      {formatCurrency(log.totalPay)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Upload className="h-6 w-6 text-primary-600" />
            <h3 className="text-lg font-medium text-gray-900">Bulk Import Daily Logs</h3>
          </div>

          <div className="space-y-6">
            <div className="form-group">
              <label className="form-label">
                CSV Data (Employee Name/CPR, Date, NT Hours, ROT Hours, HOT Hours, Site Code)
              </label>
              <textarea
                value={bulkData}
                onChange={(e) => setBulkData(e.target.value)}
                className="input h-32"
                placeholder="DEEPAK KUMAR,2025-03-01,8,2,0,WS#91&#10;ARUNKUMAR PC,2025-03-01,8,1,1,SITE-A"
              />
              <p className="form-help">
                Format: Employee Name/CPR, Date (YYYY-MM-DD), NT Hours, ROT Hours, HOT Hours, Site Code
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowBulkImport(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                className="btn btn-outline"
              >
                Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyLogs; 