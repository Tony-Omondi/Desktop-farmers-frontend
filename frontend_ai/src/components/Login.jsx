import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import jwt_decode from 'jwt-decode';

const BASE_URL = 'http://localhost:8000/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // ---------------- Email/Password login ----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      const response = await axios.post(`${BASE_URL}/accounts/login/`, {
        email: email.toLowerCase(),
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
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
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

      // Send token to Django backend
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
      setError(err.response?.data?.detail || 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    setError('Google login failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Farmers Market Logo" className="h-12 w-auto" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Log in to Farmers Market</h2>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
              isLoading ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* OR Divider */}
        <div className="my-6 flex items-center">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-gray-400">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Google Login Button */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
          />
        </div>

        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-500">
            Forgot password?
          </Link>
        </div>
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-emerald-600 hover:text-emerald-500 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
