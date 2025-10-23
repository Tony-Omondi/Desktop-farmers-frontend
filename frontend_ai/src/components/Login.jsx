import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

const BASE_URL = 'https://arifarm.onrender.com/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // ---------------- Email/Password login ----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const response = await axios.post(`${BASE_URL}/accounts/login/`, {
        email: email.toLowerCase().trim(),
        password,
      });
      
      const accessToken = response.data.tokens?.access;
      const refreshToken = response.data.tokens?.refresh;
      
      if (!accessToken || !refreshToken) {
        throw new Error('Tokens not received from server');
      }
      
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err.response?.data);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Invalid credentials. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- Google login ----------------
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      setError('');
      const { credential } = credentialResponse;
      
      if (!credential) throw new Error('Google credential not received');

      const response = await axios.post(`${BASE_URL}/accounts/google-login/`, {
        token: credential,
      });
      
      const accessToken = response.data.tokens?.access;
      const refreshToken = response.data.tokens?.refresh;
      
      if (!accessToken || !refreshToken) {
        throw new Error('Tokens not received from server');
      }
      
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      navigate('/dashboard');
    } catch (err) {
      console.error('Google login error:', err.response?.data);
      const errorMessage = err.response?.data?.detail || 
                          'Google login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    setError('Google login failed. Please try again.');
  };

  // Clear error when user starts typing
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center p-4" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-emerald-100 p-3 rounded-xl">
            <img 
              src="/logo.png" 
              alt="Farmers Market Logo" 
              className="h-12 w-auto transition-transform hover:scale-105" 
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

        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Welcome Back</h2>
        <p className="text-gray-600 text-center mb-8">Log in to your Farmers Market account</p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start animate-fade-in">
            <svg className="w-5 h-5 mr-3 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-sm flex-1">{error}</p>
            <button 
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
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
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 pr-12"
                placeholder="Enter your password"
                required
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
          </div>

          <div className="flex items-center justify-between">
            <Link 
              to="/forgot-password" 
              className="text-sm text-emerald-600 hover:text-emerald-500 font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>

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
                Logging in...
              </>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        {/* OR Divider */}
        <div className="my-8 flex items-center">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-4 text-sm text-gray-500 font-medium">OR CONTINUE WITH</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Google Login Button */}
        <div className="flex justify-center mb-6">
          <div className={`${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
              theme="filled_blue"
              size="large"
              width="100%"
            />
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center pt-6 border-t border-gray-200">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="text-emerald-600 hover:text-emerald-500 font-semibold transition-colors"
            >
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;