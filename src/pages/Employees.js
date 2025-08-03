import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  Upload,
  User,
  Building,
  Clock,
  DollarSign,
  Briefcase,
  XCircle,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import EmployeeModal from '../components/EmployeeModal';

const Employees = () => {
  const { isEditor } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [workTypeFilter, setWorkTypeFilter] = useState('');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    cpr: '',
    doj: '',
    category: '',
    employmentType: 'permanent', // permanent or flexi
    workType: '', // workshop, site (only for permanent)
    salaryType: 'hourly', // hourly, fixed (only for permanent)
    currentRate: '',
    previousRate: '',
    allowance: '',
    deductions: '',
    status: 'active'
  });

  // Demo data matching Excel format with work types and flexi visa employees
  const demoEmployees = [
    // Permanent Workshop Employees (Fixed Salary)
    {
      id: 'emp-1',
      name: 'DEEPAK KUMAR',
      cpr: '123456789',
      category: 'Workshop',
      doj: '2024-01-15',
      employmentType: 'permanent',
      workType: 'workshop',
      salaryType: 'fixed',
      previousRate: 120.0,
      currentRate: 130.0,
      deductions: 0,
      status: 'active'
    },
    {
      id: 'emp-2',
      name: 'ARUNKUMAR PC',
      cpr: '987654321',
      category: 'Workshop',
      doj: '2024-02-01',
      employmentType: 'permanent',
      workType: 'workshop',
      salaryType: 'fixed',
      previousRate: 200.0,
      currentRate: 210.0,
      deductions: 0,
      status: 'active'
    },
    {
      id: 'emp-3',
      name: 'AMAL KOORARA',
      cpr: '456789123',
      category: 'Workshop',
      doj: '2024-01-20',
      employmentType: 'permanent',
      workType: 'workshop',
      salaryType: 'fixed',
      previousRate: 120.0,
      currentRate: 130.0,
      deductions: 0,
      status: 'active'
    },
    {
      id: 'emp-4',
      name: 'SHIFIN RAPHEL',
      cpr: '789123456',
      category: 'Workshop',
      doj: '2024-02-15',
      employmentType: 'permanent',
      workType: 'workshop',
      salaryType: 'fixed',
      previousRate: 120.0,
      currentRate: 130.0,
      deductions: 0,
      status: 'active'
    },
    {
      id: 'emp-5',
      name: 'ARUN MON',
      cpr: '321654987',
      category: 'Workshop',
      doj: '2024-01-10',
      employmentType: 'permanent',
      workType: 'workshop',
      salaryType: 'fixed',
      previousRate: 180.0,
      currentRate: 190.0,
      deductions: 0,
      status: 'active'
    },
    {
      id: 'emp-6',
      name: 'AJITH KUMAR',
      cpr: '654321987',
      category: 'Workshop',
      doj: '2024-02-20',
      employmentType: 'permanent',
      workType: 'workshop',
      salaryType: 'fixed',
      previousRate: 130.0,
      currentRate: 130.0,
      deductions: 0,
      status: 'active'
    },
    {
      id: 'emp-7',
      name: 'VISHNU',
      cpr: '147258369',
      category: 'Workshop',
      doj: '2024-01-25',
      employmentType: 'permanent',
      workType: 'workshop',
      salaryType: 'fixed',
      previousRate: 120.0,
      currentRate: 120.0,
      deductions: 0,
      status: 'active'
    },
    {
      id: 'emp-8',
      name: 'RAVI KAMMARI',
      cpr: '963852741',
      category: 'Workshop',
      doj: '2024-02-05',
      employmentType: 'permanent',
      workType: 'workshop',
      salaryType: 'fixed',
      previousRate: 140.0,
      currentRate: 140.0,
      deductions: 0,
      status: 'active'
    },
    {
      id: 'emp-9',
      name: 'YADHUKRISHNAN',
      cpr: '852963741',
      category: 'Workshop',
      doj: '2024-01-30',
      employmentType: 'permanent',
      workType: 'workshop',
      salaryType: 'fixed',
      previousRate: 125.0,
      currentRate: 135.0,
      deductions: 0,
      status: 'active'
    },
    {
      id: 'emp-10',
      name: 'PRADEEP KUMAR',
      cpr: '741852963',
      category: 'Site',
      doj: '2024-02-10',
      employmentType: 'permanent',
      workType: 'site',
      salaryType: 'fixed',
      previousRate: 180.0,
      currentRate: 190.0,
      deductions: 0,
      status: 'active'
    },
    {
      id: 'emp-11',
      name: 'JOHN SIMON',
      cpr: '369258147',
      category: 'Site',
      doj: '2024-01-05',
      employmentType: 'permanent',
      workType: 'site',
      salaryType: 'fixed',
      previousRate: 110.0,
      currentRate: 115.0,
      deductions: 0,
      status: 'active'
    },
    {
      id: 'emp-12',
      name: 'RAJESH',
      cpr: '258147369',
      category: 'Site',
      doj: '2024-02-25',
      employmentType: 'permanent',
      workType: 'site',
      salaryType: 'fixed',
      previousRate: 130.0,
      currentRate: 130.0,
      deductions: 0,
      status: 'active'
    },
    {
      id: 'emp-13',
      name: 'SREENATH KANKKARA',
      cpr: '147369258',
      category: 'Site',
      doj: '2024-01-15',
      employmentType: 'permanent',
      workType: 'site',
      salaryType: 'fixed',
      previousRate: 120.0,
      currentRate: 120.0,
      deductions: 0,
      status: 'active'
    },
    {
      id: 'emp-14',
      name: 'MD MATALIB MIAH',
      cpr: '963147258',
      category: 'Site',
      doj: '2024-02-15',
      employmentType: 'permanent',
      workType: 'site',
      salaryType: 'hourly',
      previousRate: 0.750,
      currentRate: 0.800,
      deductions: 0,
      status: 'active'
    },
    {
      id: 'emp-15',
      name: 'KABIR HOSSAIN',
      cpr: '852741963',
      category: 'Site',
      doj: '2024-01-20',
      employmentType: 'permanent',
      workType: 'site',
      salaryType: 'hourly',
      previousRate: 1.200,
      currentRate: 1.300,
      deductions: 0,
      status: 'active'
    },
    {
      id: 'emp-16',
      name: 'ABDUL RAHIM',
      cpr: '741963852',
      category: 'Site',
      doj: '2024-02-20',
      employmentType: 'permanent',
      workType: 'site',
      salaryType: 'hourly',
      previousRate: 0.800,
      currentRate: 0.800,
      deductions: 0,
      status: 'active'
    },
    {
      id: 'emp-17',
      name: 'ALAM ABUL KASHEM',
      cpr: '369741852',
      category: 'Site',
      doj: '2024-01-10',
      employmentType: 'permanent',
      workType: 'site',
      salaryType: 'hourly',
      previousRate: 0.688,
      currentRate: 0.750,
      deductions: 0,
      status: 'active'
    },
    {
      id: 'emp-18',
      name: 'ANOWAR HOSSAIN',
      cpr: '258963741',
      category: 'Site',
      doj: '2024-02-05',
      employmentType: 'permanent',
      workType: 'site',
      salaryType: 'hourly',
      previousRate: 0.750,
      currentRate: 0.800,
      deductions: 0,
      status: 'active'
    },
    {
      id: 'emp-19',
      name: 'ABDUL MIAH ISAMAIL',
      cpr: '147852963',
      category: 'Site',
      doj: '2024-01-25',
      employmentType: 'permanent',
      workType: 'site',
      salaryType: 'hourly',
      previousRate: 0.750,
      currentRate: 0.800,
      deductions: 0,
      status: 'active'
    },
    // Flexi Visa Employees (Always Hourly)
    {
      id: 'emp-20',
      name: 'FLEXI EMPLOYEE 1',
      cpr: '111222333',
      category: 'Flexi Visa',
      doj: '2024-03-01',
      employmentType: 'flexi',
      workType: 'site',
      salaryType: 'hourly',
      previousRate: 1.000,
      currentRate: 1.100,
      deductions: 0,
      status: 'active'
    },
    {
      id: 'emp-21',
      name: 'FLEXI EMPLOYEE 2',
      cpr: '222333444',
      category: 'Flexi Visa',
      doj: '2024-03-05',
      employmentType: 'flexi',
      workType: 'site',
      salaryType: 'hourly',
      previousRate: 0.900,
      currentRate: 1.000,
      deductions: 0,
      status: 'active'
    },
    {
      id: 'emp-22',
      name: 'FLEXI EMPLOYEE 3',
      cpr: '333444555',
      category: 'Flexi Visa',
      doj: '2024-03-10',
      employmentType: 'flexi',
      workType: 'site',
      salaryType: 'hourly',
      previousRate: 1.100,
      currentRate: 1.200,
      deductions: 0,
      status: 'active'
    },
    {
      id: 'emp-23',
      name: 'FLEXI EMPLOYEE 4',
      cpr: '444555666',
      category: 'Flexi Visa',
      doj: '2024-03-15',
      employmentType: 'flexi',
      workType: 'site',
      salaryType: 'hourly',
      previousRate: 0.850,
      currentRate: 0.950,
      deductions: 0,
      status: 'active'
    },
    {
      id: 'emp-24',
      name: 'FLEXI EMPLOYEE 5',
      cpr: '555666777',
      category: 'Flexi Visa',
      doj: '2024-03-20',
      employmentType: 'flexi',
      workType: 'site',
      salaryType: 'hourly',
      previousRate: 1.050,
      currentRate: 1.150,
      deductions: 0,
      status: 'active'
    }
  ];

  useEffect(() => {
    fetchEmployees();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    // Filter employees based on search and filters
    filterEmployees();
  }, [searchTerm, categoryFilter, workTypeFilter]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      // Use demo data instead of API call
      setEmployees(demoEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      // Extract unique categories and work types from demo data
      const uniqueCategories = [...new Set(demoEmployees.map(emp => emp.category))];
      const uniqueWorkTypes = [...new Set(demoEmployees.map(emp => emp.workType))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const filterEmployees = () => {
    let filtered = demoEmployees;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.cpr.includes(searchTerm) ||
        emp.designation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(emp => emp.category === categoryFilter);
    }

    // Apply work type filter
    if (workTypeFilter) {
      filtered = filtered.filter(emp => emp.workType === workTypeFilter);
    }

    setEmployees(filtered);
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setShowModal(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setShowModal(true);
  };

  const handleDeleteEmployee = async (employee) => {
    if (!window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
      return;
    }

    try {
      // In demo mode, just remove from local state
      setEmployees(prev => prev.filter(emp => emp.id !== employee.id));
      toast.success('Employee deleted successfully');
    } catch (error) {
      toast.error('Failed to delete employee');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingEmployee(null);
  };

  const handleEmployeeSaved = (savedEmployee) => {
    handleModalClose();
    
    if (editingEmployee) {
      // Update existing employee
      setEmployees(prev => prev.map(emp => 
        emp.id === savedEmployee.id ? savedEmployee : emp
      ));
    } else {
      // Add new employee
      const newEmployee = {
        ...savedEmployee,
        id: `emp-${Date.now()}`,
        ntRate: savedEmployee.currentRate || 0,
        rotRate: (savedEmployee.currentRate || 0) * 1.5,
        hotRate: (savedEmployee.currentRate || 0) * 2.0
      };
      setEmployees(prev => [...prev, newEmployee]);
    }
    
    toast.success(`Employee ${editingEmployee ? 'updated' : 'added'} successfully`);
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

  const getSalaryDisplay = (employee) => {
    if (employee.salaryType === 'fixed') {
      return formatCurrency(employee.currentRate);
    } else {
      return `${formatCurrency(employee.currentRate)}/hr`;
    }
  };

  const getWorkTypeIcon = (workType) => {
    return workType === 'workshop' ? Building : MapPin;
  };

  const getWorkTypeColor = (workType) => {
    return workType === 'workshop' ? 'text-blue-600' : 'text-green-600';
  };

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.cpr.includes(searchTerm);
    const matchesCategory = !categoryFilter || employee.category === categoryFilter;
    const matchesWorkType = !workTypeFilter || employee.workType === workTypeFilter;
    const matchesEmploymentType = !employmentTypeFilter || employee.employmentType === employmentTypeFilter;
    
    return matchesSearch && matchesCategory && matchesWorkType && matchesEmploymentType;
  });

  const getEmploymentTypeDisplay = (employee) => {
    return employee.employmentType === 'flexi' ? 'Flexi Visa' : 'Permanent';
  };

  const getWorkTypeDisplay = (employee) => {
    return employee.workType === 'workshop' ? 'Workshop' : 'Site';
  };

  const getCategoryDisplay = (employee) => {
    if (employee.employmentType === 'flexi') {
      return 'Flexi Worker';
    }
    return employee.category;
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
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage employee records and wage rates (Demo Mode)
              </p>
            </div>
            {isEditor && (
              <button
                onClick={handleAddEmployee}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Employee</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Type
              </label>
              <select
                value={workTypeFilter}
                onChange={(e) => setWorkTypeFilter(e.target.value)}
                className="input"
              >
                <option value="">All Types</option>
                <option value="workshop">Workshop</option>
                <option value="site">Site</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employment Type
              </label>
              <select
                value={employmentTypeFilter}
                onChange={(e) => setEmploymentTypeFilter(e.target.value)}
                className="input"
              >
                <option value="">All Types</option>
                <option value="permanent">Permanent</option>
                <option value="flexi">Flexi Visa</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Employee List ({filteredEmployees.length})
          </h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>CPR</th>
                <th>DOJ</th>
                <th>Category</th>
                <th>Employment Type</th>
                <th>Work Type</th>
                <th>Salary Type</th>
                <th>Current Rate</th>
                <th>DOJ</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-500">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>No employees found</p>
                    {isEditor && (
                      <button
                        onClick={handleAddEmployee}
                        className="mt-2 text-primary-600 hover:text-primary-500"
                      >
                        Add your first employee
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => {
                  const WorkTypeIcon = getWorkTypeIcon(employee.workType);
                  return (
                    <tr key={employee.id}>
                      <td className="font-medium">{employee.name}</td>
                      <td>{employee.cpr}</td>
                      <td>{new Date(employee.doj).toLocaleDateString()}</td>
                      <td>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          employee.employmentType === 'flexi' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {getCategoryDisplay(employee)}
                        </span>
                      </td>
                      <td>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          employee.employmentType === 'flexi' 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {getEmploymentTypeDisplay(employee)}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <WorkTypeIcon className={`h-4 w-4 ${getWorkTypeColor(employee.workType)}`} />
                          <span className="capitalize">{getWorkTypeDisplay(employee)}</span>
                        </div>
                      </td>
                      <td>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {employee.salaryType === 'fixed' ? 'Fixed' : 'Hourly'}
                        </span>
                      </td>
                      <td className="font-medium text-green-600">
                        {getSalaryDisplay(employee)}
                      </td>
                      <td>{new Date(employee.doj).toLocaleDateString()}</td>
                      <td>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditEmployee(employee)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          {isEditor && (
                            <button
                              onClick={() => handleDeleteEmployee(employee)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Modal */}
      {showModal && (
        <EmployeeModal
          employee={editingEmployee}
          onClose={handleModalClose}
          onSaved={handleEmployeeSaved}
        />
      )}
    </div>
  );
};

export default Employees; 