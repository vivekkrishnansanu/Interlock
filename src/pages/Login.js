import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Invalid email or password. Please try again.');
    }
    setLoading(false);
  };

  const demoCredentials = [
    { role: 'Leadership', email: 'leadership@interlock.com', password: 'leadership123' },
    { role: 'Admin', email: 'admin@interlock.com', password: 'admin123' },
    { role: 'Viewer', email: 'viewer@interlock.com', password: 'viewer123' }
  ];

  const handleDemoLogin = async (role) => {
    // Set form data for demo login
    const email = `${role.toLowerCase()}@interlock.com`;
    const password = `${role.toLowerCase()}123`;
    
    setFormData({ email, password });
    
    // Wait for state to update, then submit
    setTimeout(async () => {
      setLoading(true);
      setError('');
      
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Invalid email or password. Please try again.');
      }
      setLoading(false);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-semibold text-lg tracking-tight">I</span>
          </div>
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-semibold text-gray-900 tracking-tight">
          Sign in to Interlock
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access your wage tracking dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card shadow-lg">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input pl-10 pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={16} className="text-gray-400" />
                    ) : (
                      <Eye size={16} className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle size={16} className="text-red-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full h-11 font-medium"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin mr-2" />
                  ) : null}
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-tight">Demo Access</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleDemoLogin('Leadership')}
                  className="w-full btn btn-outline hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors duration-200"
                >
                  Enter as Leadership
                </button>
                <div className="text-center text-xs text-gray-500 mt-2">
                  Or choose specific role:
                </div>
                {demoCredentials.map((cred, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-150">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{cred.role}</p>
                      <p className="text-xs text-gray-500">{cred.email}</p>
                    </div>
                    <button
                      onClick={() => handleDemoLogin(cred.role)}
                      className="btn btn-ghost text-xs hover:bg-gray-200 transition-colors duration-200"
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            This is a demo application. Use the credentials above to sign in.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 