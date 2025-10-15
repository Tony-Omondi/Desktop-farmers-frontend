import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('Please log in to view your orders.');
          navigate('/login');
          return;
        }

        setIsLoading(true);
        const response = await axios.get(`${BASE_URL}/api/orders/orders/`, {
          headers: { Authorization: `Bearer ${token.trim()}` },
        });
        console.log('Orders data:', response.data);
        setOrders(response.data);
      } catch (err) {
        console.error('Fetch orders error:', err.response?.data);
        setError(err.response?.data?.detail || 'Failed to load orders.');
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [navigate]);

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toLocaleString('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending', icon: '⏳' },
      'paid': { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Paid', icon: '💳' },
      'confirmed': { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Confirmed', icon: '✅' },
      'processing': { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Processing', icon: '🔄' },
      'shipped': { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Shipped', icon: '🚚' },
      'delivered': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Delivered', icon: '📦' },
      'completed': { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Completed', icon: '🎉' },
      'cancelled': { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled', icon: '❌' },
    };
    
    const config = statusConfig[status?.toLowerCase()] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: status, icon: '📋' };
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${config.color} border flex items-center gap-1.5`}>
        <span className="text-sm">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending', icon: '⏳' },
      'completed': { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Paid', icon: '✅' },
      'failed': { color: 'bg-red-100 text-red-800 border-red-200', label: 'Failed', icon: '❌' },
    };
    
    const config = statusConfig[status?.toLowerCase()] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: status, icon: '📋' };
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${config.color} border flex items-center gap-1.5`}>
        <span className="text-sm">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  // Get product image with fallback
  const getProductImage = (product) => {
    const imageUrl = product?.image;
    if (imageUrl) {
      return imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl}`;
    }
    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
  };

  // Filter and sort orders
  const filteredAndSortedOrders = orders
    .filter(order => filterStatus === 'all' || order.status?.toLowerCase() === filterStatus)
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = parseFloat(a.total_amount);
          bValue = parseFloat(b.total_amount);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'date':
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
      }
      
      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-700 text-lg font-medium">Loading your orders...</p>
          <p className="text-emerald-500 text-sm mt-2">Getting everything ready for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
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
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8 px-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-900 mb-3 sm:mb-4">
            Your Orders
          </h1>
          <p className="text-emerald-600 text-base sm:text-lg">
            Track and manage all your orders in one place
          </p>
        </div>

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
            <button onClick={() => setError('')} className="p-1 sm:p-2 hover:bg-red-100 rounded-lg sm:rounded-xl transition-colors flex-shrink-0 ml-2">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        )}

        {/* Statistics */}
        {orders.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-xs sm:text-sm font-medium">Total Orders</p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-900">{orders.length}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <span className="text-lg sm:text-xl lg:text-2xl">📦</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-xs sm:text-sm font-medium">Total Spent</p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                    KSh {formatPrice(orders.reduce((total, order) => total + parseFloat(order.total_amount), 0))}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <span className="text-lg sm:text-xl lg:text-2xl">💰</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-xs sm:text-sm font-medium">Completed</p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-900">
                    {orders.filter(order => order.status?.toLowerCase() === 'completed').length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <span className="text-lg sm:text-xl lg:text-2xl">✅</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-xs sm:text-sm font-medium">Active</p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-900">
                    {orders.filter(order => ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status?.toLowerCase())).length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-yellow-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <span className="text-lg sm:text-xl lg:text-2xl">⏳</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-emerald-100 p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 sm:px-4 py-2 border border-emerald-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-emerald-900 text-sm sm:text-base">
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 sm:px-4 py-2 border border-emerald-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-emerald-900 text-sm sm:text-base">
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="status">Sort by Status</option>
              </select>
              <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="px-3 sm:px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base flex items-center space-x-2">
                <span>{sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}</span>
              </button>
            </div>
            <div className="text-sm text-emerald-600 font-medium">
              Showing {filteredAndSortedOrders.length} of {orders.length} orders
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredAndSortedOrders.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-emerald-100 p-8 sm:p-12 lg:p-16 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <span className="text-2xl sm:text-3xl lg:text-4xl">📋</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-emerald-900 mb-3 sm:mb-4">
              {filterStatus !== 'all' ? `No ${filterStatus} orders` : 'No orders yet'}
            </h3>
            <p className="text-emerald-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
              {filterStatus !== 'all' ? `You don't have any ${filterStatus} orders.` : 'Start shopping to see your orders here!'}
            </p>
            <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors text-sm sm:text-base">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {filteredAndSortedOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-emerald-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                {/* Order Header */}
                <div className="p-4 sm:p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-md">
                        <span className="text-lg sm:text-xl">📦</span>
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-emerald-900">Order #{order.order_id}</h3>
                        <p className="text-emerald-600 text-sm sm:text-base">{formatDate(order.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      {getStatusBadge(order.status)}
                      <span className="text-lg sm:text-xl font-bold text-emerald-600">KSh {formatPrice(order.total_amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-sm mb-4">
                    <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <span className="text-emerald-600 text-xs sm:text-sm font-medium">Items</span>
                      <p className="font-bold text-emerald-900 text-sm sm:text-base">{order.order_items?.length || 0} item{order.order_items?.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <span className="text-emerald-600 text-xs sm:text-sm font-medium">Payment</span>
                      <div className="font-bold">{getPaymentStatusBadge(order.payment_status)}</div>
                    </div>
                    <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <span className="text-emerald-600 text-xs sm:text-sm font-medium">Method</span>
                      <p className="font-bold text-emerald-900 text-sm sm:text-base capitalize">{order.payment_mode || 'N/A'}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <span className="text-emerald-600 text-xs sm:text-sm font-medium">Coupon</span>
                      <p className="font-bold text-emerald-900 text-sm sm:text-base">
                        {order.coupon?.coupon_code || 'None'}
                      </p>
                    </div>
                  </div>

                  {/* Expandable Items */}
                  <button onClick={() => toggleOrderExpand(order.id)} className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium group/expand">
                    {expandedOrder === order.id ? 'Hide' : 'View'} Order Items
                    <svg className={`w-4 h-4 transition-transform group-hover/expand:scale-110 ${expandedOrder === order.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>

                  {expandedOrder === order.id && order.order_items && (
                    <div className="mt-4 space-y-3 animate-fade-in">
                      {order.order_items.map((item) => {
                        const productImage = getProductImage(item.product);
                        const itemTotal = parseFloat(item.product_price) * item.quantity;
                        
                        return (
                          <div key={item.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-emerald-50 rounded-lg sm:rounded-xl border border-emerald-100">
                            <img
                              src={productImage}
                              alt={item.product_name}
                              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0 shadow-sm"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-emerald-900 text-sm sm:text-base truncate">
                                {item.product_name}
                              </h4>
                              <p className="text-emerald-600 text-xs sm:text-sm">Quantity: {item.quantity}</p>
                              <p className="text-emerald-700 font-medium text-xs sm:text-sm">
                                KSh {formatPrice(item.product_price)} each
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-emerald-900 font-bold text-sm sm:text-base">KSh {formatPrice(itemTotal)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-emerald-100 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">🌿</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-emerald-900">FarmFresh</span>
            </div>
            <p className="text-emerald-600 text-xs sm:text-sm">Fresh organic products delivered to your doorstep</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        @media (min-width: 475px) {
          .xs\\:inline { display: inline !important; }
          .xs\\:grid-cols-2 { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
};

export default Orders;