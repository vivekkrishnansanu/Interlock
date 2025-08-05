// Secure API Service - Replaces direct Supabase calls
// This prevents sensitive data exposure in the frontend

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    const session = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
    return session.currentSession?.access_token;
  }

  // Set auth headers
  getHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: this.getHeaders(),
        ...options
      };

      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // ========================================
  // AUTHENTICATION METHODS
  // ========================================

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // ========================================
  // EMPLOYEES METHODS
  // ========================================

  async getEmployees() {
    return this.request('/employees');
  }

  async createEmployee(employeeData) {
    return this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData)
    });
  }

  async updateEmployee(id, employeeData) {
    return this.request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData)
    });
  }

  async deleteEmployee(id) {
    return this.request(`/employees/${id}`, {
      method: 'DELETE'
    });
  }

  // ========================================
  // SITES METHODS
  // ========================================

  async getSites() {
    return this.request('/sites');
  }

  async createSite(siteData) {
    return this.request('/sites', {
      method: 'POST',
      body: JSON.stringify(siteData)
    });
  }

  async updateSite(id, siteData) {
    return this.request(`/sites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(siteData)
    });
  }

  async deleteSite(id) {
    return this.request(`/sites/${id}`, {
      method: 'DELETE'
    });
  }

  // ========================================
  // DAILY LOGS METHODS
  // ========================================

  async getDailyLogs() {
    return this.request('/daily-logs');
  }

  async createDailyLog(logData) {
    return this.request('/daily-logs', {
      method: 'POST',
      body: JSON.stringify(logData)
    });
  }

  async updateDailyLog(id, logData) {
    return this.request(`/daily-logs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(logData)
    });
  }

  async deleteDailyLog(id) {
    return this.request(`/daily-logs/${id}`, {
      method: 'DELETE'
    });
  }

  // ========================================
  // ALLOWANCES METHODS
  // ========================================

  async getAllowances() {
    return this.request('/allowances');
  }

  async createAllowance(allowanceData) {
    return this.request('/allowances', {
      method: 'POST',
      body: JSON.stringify(allowanceData)
    });
  }

  async updateAllowance(id, allowanceData) {
    return this.request(`/allowances/${id}`, {
      method: 'PUT',
      body: JSON.stringify(allowanceData)
    });
  }

  async deleteAllowance(id) {
    return this.request(`/allowances/${id}`, {
      method: 'DELETE'
    });
  }

  // ========================================
  // SALARY ADVANCES METHODS
  // ========================================

  async getSalaryAdvances() {
    return this.request('/salary-advances');
  }

  async createSalaryAdvance(advanceData) {
    return this.request('/salary-advances', {
      method: 'POST',
      body: JSON.stringify(advanceData)
    });
  }

  async updateSalaryAdvance(id, advanceData) {
    return this.request(`/salary-advances/${id}`, {
      method: 'PUT',
      body: JSON.stringify(advanceData)
    });
  }

  async deleteSalaryAdvance(id) {
    return this.request(`/salary-advances/${id}`, {
      method: 'DELETE'
    });
  }

  // ========================================
  // USER MANAGEMENT METHODS
  // ========================================

  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    });
  }

  // ========================================
  // REPORTS METHODS
  // ========================================

  async getMonthlySummaries(month, year) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/monthly-summaries?${queryString}` : '/monthly-summaries';
    
    return this.request(endpoint);
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  // Check if user has required role
  hasRole(userProfile, requiredRoles) {
    if (!userProfile || !userProfile.role) return false;
    return Array.isArray(requiredRoles) 
      ? requiredRoles.includes(userProfile.role)
      : userProfile.role === requiredRoles;
  }

  // Check if user is admin
  isAdmin(userProfile) {
    return this.hasRole(userProfile, 'admin');
  }

  // Check if user is leadership or admin
  isLeadershipOrAdmin(userProfile) {
    return this.hasRole(userProfile, ['admin', 'leadership']);
  }

  // Check if user can edit
  canEdit(userProfile) {
    return this.hasRole(userProfile, ['admin', 'leadership']);
  }

  // Check if user can delete
  canDelete(userProfile) {
    return this.hasRole(userProfile, 'admin');
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService; 