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
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  
  const { login, signup } = useAuth();
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

    let result;
    if (isSignup) {
      result = await signup(formData.email, formData.password, name);
    } else {
      result = await login(formData.email, formData.password);
    }

    if (result.success) {
      if (isSignup) {
        setIsSignup(false);
        setFormData({ email: '', password: '' });
        setName('');
      } else {
        navigate('/');
      }
    } else {
      setError(result.error || 'Authentication failed. Please try again.');
    }
    setLoading(false);
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
          {isSignup ? 'Create Account' : 'Sign in to Interlock'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isSignup ? 'Create your wage tracking account' : 'Access your wage tracking dashboard'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-md">
              {/* Name Field (only for signup) */}
              {isSignup && (
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required={isSignup}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

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
                    className="form-input pl-10"
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
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input pl-10 pr-10"
                    placeholder={isSignup ? 'Create a password' : 'Enter your password'}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
                <div className="alert alert-error">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isSignup ? 'Creating Account...' : 'Signing In...'}
                  </div>
                ) : (
                  isSignup ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            {/* Toggle between login and signup */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setError('');
                    setFormData({ email: '', password: '' });
                    setName('');
                  }}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  {isSignup ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 