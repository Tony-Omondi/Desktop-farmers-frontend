import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

const BASE_URL = 'http://localhost:8000';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  // Calculate password strength
  useEffect(() => {
    if (!formData.password) return setPasswordStrength(0);

    let strength = 0;
    if (formData.password.length >= 8) strength += 1;
    if (/\d/.test(formData.password)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) strength += 1;
    if (/[A-Z]/.test(formData.password)) strength += 1;
    if (/[a-z]/.test(formData.password)) strength += 1;

    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '', non_field_errors: [] });
  };

  const validateForm = () => {
    const newErrors = {};
    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!email.trim()) newErrors.email = 'Email is required.';
    if (!password) newErrors.password = 'Password is required.';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password.';

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (password) {
      if (password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
      if (/^\d+$/.test(password)) newErrors.password = 'Password cannot be entirely numeric.';
      const commonPasswords = ['password', '12345678', 'qwerty', 'admin123'];
      if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
        newErrors.password = 'This password is too common.';
      }
    }

    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(`${BASE_URL}/api/accounts/register/`, {
        email: formData.email,
        password: formData.password,
        password2: formData.confirmPassword,
        full_name: formData.fullName,
      });
      navigate('/verify-otp', { state: { email: formData.email, purpose: 'signup' } });
    } catch (err) {
      if (err.response?.status === 400) {
        const responseErrors = err.response.data;
        const newErrors = {};
        if (responseErrors.non_field_errors) newErrors.non_field_errors = Array.isArray(responseErrors.non_field_errors) ? responseErrors.non_field_errors : [responseErrors.non_field_errors];
        if (responseErrors.email) newErrors.email = Array.isArray(responseErrors.email) ? responseErrors.email[0] : responseErrors.email;
        if (responseErrors.full_name) newErrors.fullName = Array.isArray(responseErrors.full_name) ? responseErrors.full_name[0] : responseErrors.full_name;
        if (responseErrors.password) newErrors.password = Array.isArray(responseErrors.password) ? responseErrors.password[0] : responseErrors.password;
        setErrors(newErrors);
      } else {
        setErrors({ non_field_errors: [err.response?.data?.detail || 'Signup failed. Please try again.'] });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- Google signup ----------------
  const handleGoogleSignupSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      setErrors({});
      const { credential } = credentialResponse;
      if (!credential) throw new Error('Google credential not received');

      const response = await axios.post(`${BASE_URL}/api/accounts/google-login/`, {
        token: credential,
      });

      const accessToken = response.data.tokens?.access;
      const refreshToken = response.data.tokens?.refresh;
      if (!accessToken || !refreshToken) throw new Error('Tokens not received from server');

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      navigate('/dashboard');
    } catch (err) {
      console.error('Google signup error:', err.response?.data);
      setErrors({ non_field_errors: [err.response?.data?.detail || 'Google signup failed'] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignupError = () => {
    setErrors({ non_field_errors: ['Google signup failed. Please try again.'] });
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 flex items-center justify-center p-4" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img 
            src="/assets/images/logo.png" 
            alt="Farmers Market Logo" 
            className="h-14 md:h-16 w-auto transition-transform hover:scale-105" 
          />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2">Create Your Account</h2>
        <p className="text-gray-600 text-center mb-6">Join Farmers Market to sell your produce</p>
        
        {errors.non_field_errors && errors.non_field_errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start">
            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              {errors.non_field_errors.map((error, index) => (
                <p key={index} className="text-sm">{error}</p>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${errors.fullName ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition placeholder-gray-400`}
              placeholder="Enter your full name"
              required
            />
            {errors.fullName && <p className="mt-1.5 text-sm text-red-600">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${errors.email ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition placeholder-gray-400`}
              placeholder="Enter your email"
              required
            />
            {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${errors.password ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition placeholder-gray-400 pr-12`}
                placeholder="Create a password"
                required
                minLength="8"
              />
              <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Password strength:</span>
                  <span className={`text-xs font-medium ${passwordStrength <= 1 ? 'text-red-500' : passwordStrength <= 3 ? 'text-yellow-500' : 'text-green-500'}`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${getPasswordStrengthColor()}`} style={{ width: `${(passwordStrength / 5) * 100}%` }}></div>
                </div>
              </div>
            )}
            {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition placeholder-gray-400 pr-12`}
                placeholder="Confirm your password"
                required
              />
              <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1.5 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 px-4 bg-emerald-600 rounded-lg text-white font-medium hover:bg-emerald-700 transition-colors shadow-md flex items-center justify-center ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        {/* OR Google */}
        <div className="my-6 flex items-center justify-center">
          <GoogleLogin onSuccess={handleGoogleSignupSuccess} onError={handleGoogleSignupError} />
        </div>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
