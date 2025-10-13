import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('Please log in to view your profile.');
          navigate('/login');
          return;
        }

        setIsLoading(true);

        // Fetch profile
        const profileResponse = await axios.get(`${BASE_URL}/api/accounts/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(profileResponse.data);
        setFormData({
          full_name: profileResponse.data.full_name || '',
        });

        // Fetch orders for stats
        const ordersResponse = await axios.get(`${BASE_URL}/api/orders/orders/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(ordersResponse.data);
      } catch (err) {
        console.error('Fetch error:', err.response?.data);
        setError(err.response?.data?.detail || 'Failed to load profile or orders.');
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.full_name.trim()) {
      setError('Full name is required');
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.patch(
        `${BASE_URL}/api/accounts/me/`,
        { full_name: formData.full_name.trim() },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfile({ ...profile, full_name: response.data.full_name });
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toLocaleString('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-700 text-lg font-medium">Loading your profile...</p>
          <p className="text-emerald-500 text-sm mt-2">Getting everything ready for you</p>
        </div>
      </div>
    );
  }

  const totalSpent = orders.reduce((total, order) => total + parseFloat(order.total_amount), 0);
  const completedOrders = orders.filter(order => order.payment_status?.toLowerCase() === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm sm:text-lg">🌿</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  FarmFresh
                </h1>
                <p className="text-xs text-emerald-600">Organic Marketplace</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-1 sm:space-x-2 px-3 py-2 sm:px-4 sm:py-2 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                <span className="hidden xs:inline">Back to Shop</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="text-center mb-6 sm:mb-8 px-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-900 mb-3 sm:mb-4">
            Your Profile
          </h1>
          <p className="text-emerald-600 text-base sm:text-lg">
            Manage your account details and view your activity
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl flex items-center animate-fade-in mx-2 sm:mx-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-red-700 font-medium text-sm sm:text-base">{error}</p>
            </div>
            <button 
              onClick={() => setError('')}
              className="p-1 sm:p-2 hover:bg-red-100 rounded-lg sm:rounded-xl transition-colors flex-shrink-0 ml-2"
            >
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-xl sm:rounded-2xl flex items-center animate-fade-in mx-2 sm:mx-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-emerald-700 font-medium text-sm sm:text-base">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50">
                <h2 className="text-xl sm:text-2xl font-bold text-emerald-900 flex items-center">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white mr-2 sm:mr-3">
                    👤
                  </span>
                  Profile Details
                </h2>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl text-white font-bold shadow-lg border-4 border-white">
                      {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg sm:text-xl font-bold text-emerald-900 mb-2">
                      {profile?.full_name || 'User'}
                    </h3>
                    <p className="text-emerald-600 text-sm sm:text-base">{profile?.email}</p>
                    <p className="text-emerald-500 text-xs sm:text-sm mt-1">Member since {new Date().getFullYear()}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-emerald-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-emerald-900 placeholder-emerald-400 transition-all"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-emerald-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="w-full px-4 py-3 border border-emerald-200 rounded-xl bg-emerald-50 text-emerald-600 cursor-not-allowed transition-all"
                        placeholder="Email address"
                      />
                      <p className="mt-2 text-xs text-emerald-500">
                        Email address cannot be changed for security reasons.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-emerald-100 flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="px-4 sm:px-6 py-3 bg-white border border-emerald-200 text-emerald-700 rounded-xl font-medium hover:bg-emerald-50 transition-all duration-300 text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-4 sm:px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      {isUpdating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-emerald-100 overflow-hidden sticky top-24">
              <div className="p-4 sm:p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50">
                <h3 className="text-lg sm:text-xl font-bold text-emerald-900 flex items-center">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white mr-2 sm:mr-3">
                    📊
                  </span>
                  Your Stats
                </h3>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-600 text-xs sm:text-sm font-medium">Total Orders</p>
                      <p className="text-xl sm:text-2xl font-bold text-emerald-900">{orders.length}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg sm:text-xl">📦</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-600 text-xs sm:text-sm font-medium">Total Spent</p>
                      <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                        KSh {formatPrice(totalSpent)}
                      </p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg sm:text-xl">💰</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-600 text-xs sm:text-sm font-medium">Completed Orders</p>
                      <p className="text-xl sm:text-2xl font-bold text-emerald-900">
                        {completedOrders}
                      </p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg sm:text-xl">✅</span>
                    </div>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="pt-4 border-t border-emerald-100">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-emerald-100 mt-8 sm:mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">🌿</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-emerald-900">FarmFresh</span>
            </div>
            <p className="text-emerald-600 text-xs sm:text-sm">
              Fresh organic products delivered to your doorstep
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        /* Extra small breakpoint for very small screens */
        @media (min-width: 475px) {
          .xs\\:inline { display: inline !important; }
        }
      `}</style>
    </div>
  );
};

export default Profile;