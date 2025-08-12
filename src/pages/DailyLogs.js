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
  Clock,
  DollarSign,
  Briefcase,
  XCircle,
  Calendar,
  MapPin,
  Building,
  Users,
  Eye,
  ChevronUp,
  ChevronDown,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMonth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import EmployeeModal from '../components/EmployeeModal';
import { supabase } from '../lib/supabase';
import { calculateEmployeeMonthlySummary, calculateDailyWage } from '../utils/wageCalculator';

const DailyLogs = () => {
  const { user, userProfile } = useAuth();
  const { selectedMonth, isCurrentMonth, getSelectedMonthName } = useMonth();
  const isEditor = ['admin', 'editor'].includes(userProfile?.role);
  
  // REMOVED: Render counter that was causing issues
  
  const [employees, setEmployees] = useState([]);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showBulkEntry, setShowBulkEntry] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLogId, setEditingLogId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [ntHours, setNtHours] = useState(0);
  // String-controlled input to prevent unwanted coercion while typing
  const [ntHoursInput, setNtHoursInput] = useState('');
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
  const [showHolidaysAccordion, setShowHolidaysAccordion] = useState(false);
  const [newHoliday, setNewHoliday] = useState('');
  const [sites, setSites] = useState([]);



  // Bahrain holidays for 2025
  const bahrainHolidays = [
    '2025-01-01', // New Year's Day
    '2025-01-28', // Prophet Muhammad's Birthday
    '2025-05-01', // Labour Day
    '2025-06-16', // Eid al-Fitr (estimated)
    '2025-06-17', // Eid al-Fitr (estimated)
    '2025-06-18', // Eid al-Fitr (estimated)
    '2025-08-21', // Eid al-Adha (estimated)
    '2025-08-22', // Eid al-Adha (estimated)
    '2025-08-23', // Eid al-Adha (estimated)
    '2025-09-15', // Islamic New Year (estimated)
    '2025-12-16', // Bahrain National Day
    '2025-12-17', // Bahrain National Day
  ];

  // Keep numeric ntHours in sync with string input - DISABLED to prevent interference
  // useEffect(() => {
  //   const parsed = parseFloat(ntHoursInput);
  //   setNtHours(isNaN(parsed) ? 0 : parsed);
  // }, [ntHoursInput]);

  // Debug effect to monitor ntHoursInput changes
  useEffect(() => {
    console.log('ntHoursInput changed in useEffect:', ntHoursInput);
  }, [ntHoursInput]);

  // Debug effect to monitor ntHours changes
  useEffect(() => {
    console.log('ntHours changed in useEffect:', ntHours);
  }, [ntHours]);

  // Data loading and holiday detection
  useEffect(() => {
    fetchEmployees();
    fetchDailyLogs();
    fetchSites();
    setHolidays(bahrainHolidays);
  }, [selectedMonth.month, selectedMonth.year]);

  useEffect(() => {
    if (selectedEmployee) {
      const employee = employees.find(emp => emp.id === selectedEmployee);
      setSelectedEmployeeInfo(employee);
    } else {
      setSelectedEmployeeInfo(null);
    }
  }, [selectedEmployee, employees]);

  // Detect Fridays and holidays when date changes or custom holidays update
  useEffect(() => {
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    const isFri = dayOfWeek === 5;
    const isBH = bahrainHolidays.includes(selectedDate);
    const isCustom = holidays.includes(selectedDate);
    setIsFriday(isFri);
    setIsHoliday(isBH || isCustom);
  }, [selectedDate, holidays, bahrainHolidays]);

  // Safe auto-fill: only set NT to 8 on Friday/holiday if all hours are zero; never clear 8
  // Removed to avoid interfering with manual entry during Add flow
  // useEffect(() => {
  //   if (isEditing) return;
  //   if (isFriday || isHoliday) {
  //     if (ntHours === 0 && notHours === 0 && hotHours === 0) {
  //       setNtHours(8);
  //     }
  //   }
  // }, [isFriday, isHoliday, isEditing]);

  // DISABLED: All automatic hour adjustment logic removed to fix the "8" issue
  // Users can now manually enter any hours value without interference
  
  // REMOVED: This useEffect was causing infinite re-renders
  // useEffect(() => {
  //   console.log('ntHours state changed to:', ntHours);
  // }, [ntHours]);

  // Calculate wages when hours change
  // TEMPORARILY DISABLED: Testing if this is interfering with ntHours state
  /*
  useEffect(() => {
    if (selectedEmployeeInfo && (ntHours > 0 || notHours > 0 || hotHours > 0)) {
      calculateWages();
    } else {
      setCalculations(null);
    }
  }, [ntHours, notHours, hotHours, selectedEmployeeInfo]);
  */
  // useEffect(() => {
  //   // ALL AUTOMATIC CALCULATIONS DISABLED
  //   // User must manually trigger calculations if needed
  // }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
      setEmployees([]);
    }
  };

  const fetchDailyLogs = async () => {
    try {
      setLoading(true);
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
      
      // Group multiple entries per employee per day and calculate combined totals
      const groupedLogs = {};
      
      (data || []).forEach(log => {
        const key = `${log.employee_id}-${log.date}`;
        
        if (!groupedLogs[key]) {
          groupedLogs[key] = {
            id: log.id, // Use first entry's ID
            date: log.date,
            employee_id: log.employee_id,
            employees: log.employees,
            sites: log.sites, // Use first entry's site
            nt_hours: 0,
            rot_hours: 0,
            hot_hours: 0,
            is_holiday: log.is_holiday || false,
            is_friday: log.is_friday || false,
            entries: []
          };
        }
        
        // Sum up hours from all entries for this employee on this date
        groupedLogs[key].nt_hours += log.nt_hours || 0;
        groupedLogs[key].rot_hours += log.rot_hours || 0;
        groupedLogs[key].hot_hours += log.hot_hours || 0;
        
        // Keep track of individual entries for detailed view
        groupedLogs[key].entries.push({
          site: log.sites?.code || log.sites?.name || 'Unknown',
          nt_hours: log.nt_hours || 0,
          rot_hours: log.rot_hours || 0,
          hot_hours: log.hot_hours || 0
        });
      });

      // Calculate total pay for each grouped daily log and flatten structure
      const logsWithPay = Object.values(groupedLogs).map(log => {
        let totalPay = 0;
        if (log.employees) {
          try {
            console.log('Calculating wage for:', log.date, 'Employee:', log.employees.name);
            console.log('Employee data:', log.employees);
            console.log('Log hours:', { nt: log.nt_hours, rot: log.rot_hours, hot: log.hot_hours });
            
            const wageCalculation = calculateDailyWage(log, log.employees);
            console.log('Wage calculation result:', wageCalculation);
            totalPay = wageCalculation.totalPay;
          } catch (error) {
            console.error('Error calculating wage for log:', log.date, error);
            totalPay = 0;
          }
        }
        
        return {
          ...log,
          // Flatten employee data
          employeeName: log.employees?.name || 'Unknown Employee',
          employeeDesignation: log.employees?.designation || '',
          // Flatten hours data (now combined from multiple entries)
          ntHours: log.nt_hours || 0,
          notHours: log.rot_hours || 0, // ROT hours mapped to notHours for display
          hotHours: log.hot_hours || 0,
          adjustmentHours: 0, // No adjustment hours in our data
          // Flatten site data (show multiple sites if applicable)
          siteRef: log.entries.length > 1 
            ? `${log.entries.length} sites` 
            : (log.sites?.code || log.sites?.name || 'Unknown Site'),
          siteName: log.entries.length > 1
            ? log.entries.map(e => e.site).join(', ')
            : (log.sites?.name || 'Unknown Site'),
          // Add calculated pay
          totalPay: totalPay,
          // Add day type flags
          isHoliday: log.is_holiday || false,
          isFriday: log.is_friday || false,
          // Add entry count for reference
          entryCount: log.entries.length
        };
      });
      
      setDailyLogs(logsWithPay);
    } catch (error) {
      console.error('Error fetching daily logs:', error);
      toast.error('Failed to fetch daily logs');
      setDailyLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setSites(data || []);
    } catch (error) {
      console.error('Error fetching sites:', error);
      toast.error('Failed to fetch sites');
      setSites([]);
    }
  };

  // Calculate wages based on current hours and selected employee
  const calculateWages = () => {
    if (!selectedEmployeeInfo) return;
    
    try {
      const dailyLog = {
        date: selectedDate,
        ntHours: ntHours || 0,
        rotHours: notHours || 0,
        hotHours: hotHours || 0
      };
      
      const wageCalculation = calculateDailyWage(dailyLog, selectedEmployeeInfo);
      setCalculations(wageCalculation);
    } catch (error) {
      console.error('Error calculating wages:', error);
      setCalculations(null);
    }
  };

  // DISABLED: No more automatic hour adjustments - user must enter all hours manually
  const calculateFinalHours = () => {
    // Return hours exactly as entered - NO AUTOMATIC CHANGES
    return {
      ntHours: ntHours || 0,
      notHours: notHours || 0,
      hotHours: hotHours || 0
    };
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
      let result;
      
      if (isEditing) {
        // Update existing log
        const { data, error } = await supabase
          .from('daily_logs')
          .update({
            employee_id: selectedEmployee,
            date: selectedDate,
            nt_hours: ntHours,
            rot_hours: notHours, // ROT hours mapped from notHours
            hot_hours: hotHours,
            site_id: selectedSite,
            is_holiday: isHoliday,
            is_friday: isFriday,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingLogId);

        if (error) throw error;
        result = data;
        toast.success('Daily log updated successfully');
      } else {
        // Create new log
        const { data, error } = await supabase
          .from('daily_logs')
          .insert({
            employee_id: selectedEmployee,
            date: selectedDate,
            nt_hours: ntHours,
            rot_hours: notHours, // ROT hours mapped from notHours
            hot_hours: hotHours,
            site_id: selectedSite,
            is_holiday: isHoliday,
            is_friday: isFriday,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
        result = data;
        toast.success('Daily log added successfully');
      }
      
      // Reset form
      setSelectedEmployee('');
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setNtHours(0);
      setNtHoursInput('');
      setNotHours(0);
      setHotHours(0);
      setAdjustmentHours(0);
      setSelectedSite('');
      setIsHoliday(false);
      setIsFriday(false);
      setCalculations(null);
      setShowForm(false);
      setIsEditing(false);
      setEditingLogId(null);

      // Refresh the data
      await fetchDailyLogs();
    } catch (error) {
      console.error('Error saving daily log:', error);
      toast.error(isEditing ? 'Failed to update daily log' : 'Failed to add daily log');
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
      // Create array of entries to insert
      const logsToInsert = selectedEmployees.map(employeeId => ({
        employee_id: employeeId,
        date: selectedDate,
        nt_hours: bulkNtHours,
        rot_hours: bulkNotHours, // ROT hours mapped from bulkNotHours
        hot_hours: bulkHotHours,
        site_id: selectedSite,
        is_holiday: isHoliday,
        is_friday: isFriday,
        created_at: new Date().toISOString()
      }));

      // Save to database
      const { data, error } = await supabase
        .from('daily_logs')
        .insert(logsToInsert);

      if (error) throw error;

      toast.success(`Added daily logs for ${selectedEmployees.length} employees`);
      
      // Reset form
      setSelectedEmployees([]);
      setBulkNtHours(0);
      setBulkNotHours(0);
      setBulkHotHours(0);
      setBulkAdjustmentHours(0);
      setSelectedSite('');
      setShowBulkEntry(false);

      // Refresh the data
      await fetchDailyLogs();
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
      return 'BHD 0.00';
    }
    return new Intl.NumberFormat('en-BH', {
      style: 'currency',
      currency: 'BHD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 3
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
    const template = 'Employee Name/CPR,Date,NT Hours,ROT Hours,HOT Hours,Site Code\nExample Employee,2025-03-01,8,2,0,WS001';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'daily_logs_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const addHoliday = () => {
    if (newHoliday && !holidays.includes(newHoliday) && !bahrainHolidays.includes(newHoliday)) {
      setHolidays(prev => [...prev, newHoliday]);
      setNewHoliday('');
      toast.success('Custom holiday added');
    } else if (bahrainHolidays.includes(newHoliday)) {
      toast.error('This date is already a Bahrain holiday');
    } else {
      toast.error('Holiday already exists');
    }
  };

  const removeHoliday = (date) => {
    // Only allow removal of custom holidays, not Bahrain holidays
    if (bahrainHolidays.includes(date)) {
      toast.error('Cannot remove Bahrain holidays');
      return;
    }
    setHolidays(prev => prev.filter(h => h !== date));
    toast.success('Custom holiday removed');
  };

  // Get all holidays (Bahrain + custom)
  const getAllHolidays = () => {
    const allHolidays = [...bahrainHolidays, ...holidays.filter(h => !bahrainHolidays.includes(h))];
    return allHolidays.sort();
  };

  // Get holiday name for display
  const getHolidayName = (date) => {
    const holidayNames = {
      '2025-01-01': 'New Year\'s Day',
      '2025-01-28': 'Prophet Muhammad\'s Birthday',
      '2025-05-01': 'Labour Day',
      '2025-06-16': 'Eid al-Fitr',
      '2025-06-17': 'Eid al-Fitr',
      '2025-06-18': 'Eid al-Fitr',
      '2025-08-21': 'Eid al-Adha',
      '2025-08-22': 'Eid al-Adha',
      '2025-08-23': 'Eid al-Adha',
      '2025-09-15': 'Islamic New Year',
      '2025-12-16': 'Bahrain National Day',
      '2025-12-17': 'Bahrain National Day'
    };
    return holidayNames[date] || 'Custom Holiday';
  };

  // Calculate summary statistics
  const calculateSummaryStats = () => {
    if (dailyLogs.length === 0) {
      return { totalHours: 0, totalPay: 0, workDays: 0 };
    }

    // Group logs by employee to calculate monthly totals with allowances
    const employeeGroups = {};
    dailyLogs.forEach(log => {
      const employeeId = log.employee_id || log.id; // fallback for mock data
      if (!employeeGroups[employeeId]) {
        employeeGroups[employeeId] = {
          employee: log.employees || { name: log.employeeName },
          logs: []
        };
      }
      employeeGroups[employeeId].logs.push(log);
    });

    let totalHours = 0;
    let totalPay = 0;
    let uniqueDates = new Set();

    Object.values(employeeGroups).forEach(({ employee, logs }) => {
      if (employee && logs.length > 0) {
        // Use unified calculation that includes allowances
        const monthlySummary = calculateEmployeeMonthlySummary(logs, employee);
        totalPay += monthlySummary.totalPay;
        totalHours += monthlySummary.totalHours;
        
        // Count unique dates
        logs.forEach(log => uniqueDates.add(log.date));
      } else {
        // Fallback for logs without employee data
        logs.forEach(log => {
          totalHours += (log.ntHours || log.nt_hours || 0) + 
                       (log.notHours || log.rot_hours || 0) + 
                       (log.hotHours || log.hot_hours || 0);
          totalPay += log.totalPay || 0;
          uniqueDates.add(log.date);
        });
      }
    });

    return {
      totalHours: totalHours,
      totalPay: totalPay,
      workDays: uniqueDates.size
    };
  };

  const summaryStats = calculateSummaryStats();

  const openForm = () => {
    console.log('Opening form - resetting values');
    // Reset form to default values when opening
    setSelectedEmployee('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setNtHours(0);
    setNtHoursInput('');  // Start with empty string instead of '0'
    setNotHours(0);
    setHotHours(0);
    setAdjustmentHours(0);
    setSelectedSite('');
    setIsHoliday(false);
    setIsFriday(false);
    setCalculations(null);
    setIsEditing(false);
    setEditingLogId(null);
    setSelectedEmployeeInfo(null);
    
    setShowForm(true);
    // Smooth scroll to the form after it renders
    setTimeout(() => {
      const formElement = document.querySelector('[data-form="daily-log"]');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const openBulkEntry = () => {
    // Reset bulk form to default values when opening
    setSelectedEmployees([]);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setBulkNtHours(0);
    setBulkNotHours(0);
    setBulkHotHours(0);
    setBulkAdjustmentHours(0);
    setSelectedSite('');
    setIsHoliday(false);
    setIsFriday(false);
    
    setShowBulkEntry(true);
    // Smooth scroll to the bulk entry form after it renders
    setTimeout(() => {
      const formElement = document.querySelector('[data-form="bulk-entry"]');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const editLog = (log) => {
    console.log('editLog called with log:', log);
    console.log('log.ntHours:', log.ntHours);
    console.log('log.nt_hours:', log.nt_hours);
    console.log('log.notHours:', log.notHours);
    console.log('log.rot_hours:', log.rot_hours);
    console.log('log.hotHours:', log.hotHours);
    console.log('log.hot_hours:', log.hot_hours);
    
    setIsEditing(true);
    setEditingLogId(log.id);
    setSelectedEmployee(log.employee_id);
    setSelectedDate(log.date);
    // Use the processed field names that are displayed in the table
    const ntValue = log.ntHours || log.nt_hours || 0;
    const notValue = log.notHours || log.rot_hours || 0;
    const hotValue = log.hotHours || log.hot_hours || 0;
    
    console.log('Setting values:', { ntValue, notValue, hotValue });
    
    setNtHours(ntValue);
    setNtHoursInput(String(ntValue));
    setNotHours(notValue);
    setHotHours(hotValue);
    setAdjustmentHours(0); // Reset adjustment hours
    setSelectedSite(log.sites?.id || '');
    setShowForm(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingLogId(null);
    setShowForm(false);
    // Reset form to default values
    setSelectedEmployee('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setNtHours(0);
    setNtHoursInput('');
    setNotHours(0);
    setHotHours(0);
    setAdjustmentHours(0);
    setSelectedSite('');
  };

  const deleteLog = async (logId) => {
    if (!confirm('Are you sure you want to delete this daily log?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('daily_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      toast.success('Daily log deleted successfully');
      
      // Refresh the data
      await fetchDailyLogs();
    } catch (error) {
      console.error('Error deleting daily log:', error);
      toast.error('Failed to delete daily log');
    }
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
                  onClick={openForm}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>{isEditing ? 'Edit Daily Log' : 'Add Daily Log'}</span>
                </button>
              )}
              {isEditor && (
                <button
                  onClick={openBulkEntry}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Hours */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.totalHours.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Total Pay */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Pay</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summaryStats.totalPay)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Work Days */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Log Entries</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.workDays}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bahrain Holidays Section - HIDDEN */}
      {/* 
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar size={20} className="text-red-600" />
              <h3 className="text-lg font-medium text-gray-900">Bahrain Holidays & Fridays</h3>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowHolidaysAccordion(!showHolidaysAccordion)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
              >
                {showHolidaysAccordion ? (
                  <>
                    <span>▼</span>
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <span>▶</span>
                    <span>Show</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowHolidayManager(true)}
                className="btn btn-outline text-sm"
              >
                Manage Holidays
              </button>
            </div>
          </div>
        </div>
        
        {showHolidaysAccordion && (
          <div className="card-body border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  Bahrain Public Holidays 2025
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {bahrainHolidays.map((holiday) => (
                    <div key={holiday} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">
                        {formatDate(holiday)} - {getHolidayName(holiday)}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Official
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  Custom Holidays
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {holidays.filter(h => !bahrainHolidays.includes(h)).length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No custom holidays added</p>
                  ) : (
                    holidays.filter(h => !bahrainHolidays.includes(h)).map((holiday) => (
                      <div key={holiday} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{formatDate(holiday)}</span>
                        <button
                          onClick={() => removeHoliday(holiday)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <h5 className="text-sm font-medium text-yellow-800">Friday Rules</h5>
              </div>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>• <strong>Not Working:</strong> Automatically set to 8 NT hours (full day off)</p>
                <p>• <strong>Working:</strong> Actual hours + 8 additional HOT hours (compensation)</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <h5 className="text-sm font-medium text-red-800">Holiday Rules</h5>
              </div>
              <div className="text-sm text-red-700 space-y-1">
                <p>• <strong>Not Working:</strong> Automatically set to 8 NT hours (full day off)</p>
                <p>• <strong>Working:</strong> Actual hours + 8 additional HOT hours (compensation)</p>
              </div>
            </div>
          </div>
        )}
        
        {!showHolidaysAccordion && (
          <div className="p-4 text-center text-gray-500 border-t">
            <p>Click "Show" to view holiday information and rules</p>
          </div>
        )}
      </div>
      */}

      {/* Add Daily Log Form */}
      {showForm && (
        <div className="card border-2 border-blue-200 bg-blue-50/30" data-form="daily-log">
          <div className="card-header bg-blue-100/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock size={20} className="text-blue-600" />
                <h3 className="text-lg font-medium text-blue-900">
                  {isEditing ? 'Edit Daily Log' : 'Add Daily Log'}
                </h3>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-white/50"
              >
                <XCircle size={20} />
              </button>
            </div>
          </div>
          <div className="card-body max-h-[80vh] overflow-y-auto">
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
                      {employee.name} - {employee.designation} (Rate: {employee.salaryType === 'monthly' ? `BHD ${employee.basicPay || employee.basic_pay || 0}/month` : `BHD ${employee.hourlyWage || employee.hourly_wage || 0}/hour`})
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto-filled Employee Information */}
              {selectedEmployeeInfo && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
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
                      <div className="font-medium text-red-600">
                  {selectedEmployeeInfo.salaryType === 'monthly' 
                    ? `BHD ${selectedEmployeeInfo.basicPay || selectedEmployeeInfo.basic_pay || 0}/month` 
                    : `BHD ${selectedEmployeeInfo.hourlyWage || selectedEmployeeInfo.hourly_wage || 0}/hour`}
                </div>
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
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*\\.?[0-9]*"
                    value={ntHoursInput}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      console.log('NT Hours input changed to:', inputValue);
                      console.log('Current ntHoursInput before change:', ntHoursInput);
                      console.log('Current ntHours before change:', ntHours);
                      
                      setNtHoursInput(inputValue);
                      
                      // Immediately sync to numeric for calculations
                      const parsed = parseFloat(inputValue);
                      const numericValue = isNaN(parsed) ? 0 : parsed;
                      console.log('Setting ntHours to:', numericValue);
                      setNtHours(numericValue);
                      
                      console.log('After setting - ntHoursInput should be:', inputValue, 'ntHours should be:', numericValue);
                    }}
                    className="input"
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Regular O.T (R.O.T) Hours</label>
                  <input
                    type="number"
                    step="0.001"
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
                    step="0.001"
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
                    step="0.001"
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



              {/* Wage Calculation Display */}
              {calculations && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <DollarSign size={16} className="text-blue-600" />
                    <h4 className="text-sm font-medium text-gray-900">Wage Calculation Preview</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 text-xs uppercase tracking-wide">Normal Time</span>
                      <div className="font-medium text-green-600">
                        {ntHours} hrs × BHD {calculations.rates.ntRate?.toFixed(3) || '0.000'} = BHD {calculations.normalPay?.toFixed(3) || '0.000'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs uppercase tracking-wide">Regular Overtime</span>
                      <div className="font-medium text-blue-600">
                        {notHours} hrs × BHD {calculations.rates.rotRate?.toFixed(3) || '0.000'} = BHD {calculations.regularOTPay?.toFixed(3) || '0.000'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs uppercase tracking-wide">Holiday Overtime</span>
                      <div className="font-medium text-red-600">
                        {hotHours} hrs × BHD {calculations.rates.hotRate?.toFixed(3) || '0.000'} = BHD {calculations.holidayOTPay?.toFixed(3) || '0.000'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs uppercase tracking-wide">Total Daily Pay</span>
                      <div className="font-medium text-lg text-green-600">
                        BHD {calculations.totalPay?.toFixed(3) || '0.000'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={isEditing ? cancelEdit : () => setShowForm(false)}
                  className="btn btn-secondary"
                >
                  {isEditing ? 'Cancel Edit' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>{isEditing ? 'Update Daily Log' : 'Save Daily Log'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Entry Form */}
      {showBulkEntry && (
        <div className="card border-2 border-purple-200 bg-purple-50/30" data-form="bulk-entry">
          <div className="card-header bg-purple-100/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users size={20} className="text-purple-600" />
                <h3 className="text-lg font-medium text-purple-900">Bulk Entry - Multiple Employees</h3>
              </div>
              <button
                onClick={() => setShowBulkEntry(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-white/50"
              >
                <XCircle size={20} />
              </button>
            </div>
          </div>
          <div className="card-body max-h-[80vh] overflow-y-auto">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white">
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
                          {employee.designation} - {employee.salaryType === 'monthly' ? `BHD ${employee.basicPay || employee.basic_pay || 0}/month` : `BHD ${employee.hourlyWage || employee.hourly_wage || 0}/hour`}
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
                    step="0.001"
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
                    step="0.001"
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
                    step="0.001"
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
                    step="0.001"
                    min="-24"
                    max="24"
                    value={bulkAdjustmentHours}
                    onChange={(e) => setBulkAdjustmentHours(parseFloat(e.target.value) || 0)}
                    className="input"
                    placeholder="0"
                  />
                </div>
              </div>



              {/* Preview */}
              {selectedEmployees.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Users size={16} className="text-gray-600" />
                    <h4 className="text-sm font-medium text-gray-900">Preview</h4>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p>This will create daily logs for <strong>{selectedEmployees.length} employee(s)</strong> on <strong>{formatDate(selectedDate)}</strong></p>
                    <p className="mt-1">Total hours per employee: <strong>{(bulkNtHours || 0) + (bulkNotHours || 0) + (bulkHotHours || 0)} hours</strong></p>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
                  disabled={selectedEmployees.length === 0}
                >
                  <Save size={16} />
                  <span>Save Bulk Daily Logs</span>
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
                <th className="min-w-[80px] text-center">R.O.T Hours</th>
                <th className="min-w-[80px] text-center">H.O.T Hours</th>
                <th className="min-w-[80px] text-center">Adjustment Hours</th>
                <th className="min-w-[100px]">Site Ref</th>
                <th className="min-w-[120px]">Day Type</th>
                <th className="min-w-[120px] text-right">Total Pay</th>
                <th className="min-w-[120px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dailyLogs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>No daily logs found</p>
                    <button
                      onClick={openForm}
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
                    <td className="text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {isEditor && (
                          <>
                            <button
                              onClick={() => editLog(log)}
                              className="btn btn-sm btn-outline text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => deleteLog(log.id)}
                              className="btn btn-sm btn-outline text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
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
                                  placeholder="Example Employee,2025-03-01,8,2,0,WS001&#10;Another Employee,2025-03-01,8,1,1,SITE-A"
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

      {/* Holiday Manager Modal */}
      {showHolidayManager && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Manage Holidays</h3>
                <button
                  onClick={() => setShowHolidayManager(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={20} />
                </button>
              </div>

              {/* Add Custom Holiday */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Add Custom Holiday</h4>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={newHoliday}
                    onChange={(e) => setNewHoliday(e.target.value)}
                    className="input flex-1"
                    min="2025-01-01"
                    max="2025-12-31"
                  />
                  <button
                    onClick={addHoliday}
                    className="btn btn-primary text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* All Holidays List */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">All Holidays</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {getAllHolidays().map((holiday) => {
                    const isBahrainHoliday = bahrainHolidays.includes(holiday);
                    return (
                      <div key={holiday} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${isBahrainHoliday ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                          <span className="text-sm text-gray-700">
                            {formatDate(holiday)}
                            {isBahrainHoliday && ` - ${getHolidayName(holiday)}`}
                          </span>
                        </div>
                        {!isBahrainHoliday && (
                          <button
                            onClick={() => removeHoliday(holiday)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowHolidayManager(false)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyLogs; 