import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Lock, User } from 'lucide-react';

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

  const handleDemoLogin = (role) => {
    // Set form data for demo login
    const email = `${role.toLowerCase()}@interlock.com`;
    const password = `${role.toLowerCase()}123`;
    
    setFormData({ email, password });
    
    // Auto-submit the form
    setTimeout(() => {
      handleSubmit(new Event('submit'));
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-lg">I</span>
          </div>
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 tracking-tight">
          Sign in to Interlock
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access your wage tracking dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-md">
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
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={16} className="text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye size={16} className="text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full h-11"
                >
                  {loading ? (
                    <div className="loading-spinner w-4 h-4 mr-2" />
                  ) : null}
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>

                         {/* Demo Credentials */}
             <div className="mt-8 pt-6 border-t border-gray-200">
               <h3 className="text-sm font-medium text-gray-900 mb-4">Demo Access</h3>
               <div className="space-sm">
                 <button
                   onClick={() => handleDemoLogin('Leadership')}
                   className="w-full btn btn-outline"
                 >
                   Enter as Leadership
                 </button>
                 <div className="text-center text-xs text-gray-500 mt-2">
                   Or choose specific role:
                 </div>
                 {demoCredentials.map((cred, index) => (
                   <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                     <div>
                       <p className="text-sm font-medium text-gray-900">{cred.role}</p>
                       <p className="text-xs text-gray-500">{cred.email}</p>
                     </div>
                     <button
                       onClick={() => handleDemoLogin(cred.role)}
                       className="btn btn-ghost text-xs"
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