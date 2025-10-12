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
  const [touched, setTouched] = useState({});
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear field-specific errors when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    if (errors.non_field_errors) {
      setErrors({ ...errors, non_field_errors: [] });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
    
    // Validate individual field on blur
    const fieldErrors = validateField(name, formData[name]);
    if (fieldErrors[name]) {
      setErrors({ ...errors, ...fieldErrors });
    }
  };

  const validateField = (name, value) => {
    const newErrors = {};
    
    switch (name) {
      case 'fullName':
        if (!value.trim()) newErrors.fullName = 'Full name is required.';
        else if (value.trim().length < 2) newErrors.fullName = 'Full name must be at least 2 characters.';
        break;
        
      case 'email':
        if (!value.trim()) newErrors.email = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address.';
        }
        break;
        
      case 'password':
        if (!value) newErrors.password = 'Password is required.';
        else if (value.length < 8) newErrors.password = 'Password must be at least 8 characters.';
        else if (/^\d+$/.test(value)) newErrors.password = 'Password cannot be entirely numeric.';
        else {
          const commonPasswords = ['password', '12345678', 'qwerty', 'admin123'];
          if (commonPasswords.some(common => value.toLowerCase().includes(common))) {
            newErrors.password = 'This password is too common.';
          }
        }
        break;
        
      case 'confirmPassword':
        if (!value) newErrors.confirmPassword = 'Please confirm your password.';
        else if (formData.password && value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match.';
        }
        break;
        
      default:
        break;
    }
    
    return newErrors;
  };

  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(formData).forEach(field => {
      const fieldErrors = validateField(field, formData[field]);
      Object.assign(newErrors, fieldErrors);
    });

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      // Scroll to first error
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(`${BASE_URL}/api/accounts/register/`, {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        password2: formData.confirmPassword,
        full_name: formData.fullName.trim(),
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
      setErrors({ non_field_errors: [err.response?.data?.detail || 'Google signup failed. Please try again.'] });
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

  const getPasswordCriteria = () => {
    return [
      { met: formData.password.length >= 8, text: 'At least 8 characters' },
      { met: /[a-z]/.test(formData.password), text: 'One lowercase letter' },
      { met: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
      { met: /\d/.test(formData.password), text: 'One number' },
      { met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password), text: 'One special character' },
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-emerald-100 p-4 rounded-2xl shadow-sm">
            <img 
              src="/assets/images/logo.png" 
              alt="Farmers Market Logo" 
              className="h-12 md:h-14 w-auto transition-transform hover:scale-105" 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="hidden text-emerald-600 text-center font-bold text-lg">
              🌱 Farmers Market
            </div>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2">Join Farmers Market</h2>
        <p className="text-gray-600 text-center mb-8">Create your account to start selling</p>
        
        {/* Error Message */}
        {errors.non_field_errors && errors.non_field_errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start animate-fade-in">
            <svg className="w-5 h-5 mr-3 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div className="flex-1">
              {errors.non_field_errors.map((error, index) => (
                <p key={index} className="text-sm">{error}</p>
              ))}
            </div>
            <button 
              onClick={() => setErrors({...errors, non_field_errors: []})}
              className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.fullName && touched.fullName 
                    ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                }`}
                placeholder="Enter your full name"
                required
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
            </div>
            {errors.fullName && touched.fullName && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.email && touched.email
                    ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                }`}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
            {errors.email && touched.email && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 pr-12 ${
                  errors.password && touched.password
                    ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                }`}
                placeholder="Create a password"
                required
                minLength="8"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                )}
              </button>
            </div>

            {/* Password Strength & Criteria */}
            {formData.password && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Password strength:</span>
                  <span className={`text-xs font-semibold ${
                    passwordStrength <= 1 ? 'text-red-500' : 
                    passwordStrength <= 3 ? 'text-yellow-500' : 
                    'text-green-500'
                  }`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      passwordStrength <= 1 ? 'bg-red-500' : 
                      passwordStrength <= 3 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`} 
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-1 gap-1 mt-2">
                  {getPasswordCriteria().map((criterion, index) => (
                    <div key={index} className="flex items-center text-xs">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        criterion.met ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span className={criterion.met ? 'text-green-600' : 'text-gray-500'}>
                        {criterion.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {errors.password && touched.password && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 pr-12 ${
                  errors.confirmPassword && touched.confirmPassword
                    ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                }`}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && touched.confirmPassword && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center ${
              isLoading 
                ? 'bg-emerald-400 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* OR Divider */}
        <div className="my-8 flex items-center">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-4 text-sm text-gray-500 font-medium">OR CONTINUE WITH</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Google Signup Button */}
        <div className="flex justify-center mb-6">
          <div className={`${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
            <GoogleLogin
              onSuccess={handleGoogleSignupSuccess}
              onError={handleGoogleSignupError}
              theme="filled_blue"
              size="large"
              width="100%"
            />
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center pt-6 border-t border-gray-200">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-emerald-600 hover:text-emerald-500 font-semibold transition-colors"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;