import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const PaymentSuccess = () => {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('Please log in to view your order.');
          navigate('/login');
          return;
        }

        const { orderId } = location.state || {};
        if (!orderId) {
          setError('No order ID provided.');
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        const response = await axios.get(`${BASE_URL}/api/orders/orders/${orderId}/`, {
          headers: { Authorization: `Bearer ${token.trim()}` },
        });
        const foundOrder = response.data;
        if (!foundOrder) {
          setError('Order not found.');
        } else {
          setOrder(foundOrder);
          setSuccessMessage('Payment completed successfully!');
        }
      } catch (err) {
        console.error('Fetch order error:', err.response?.data);
        setError(err.response?.data?.detail || 'Failed to load order.');
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [navigate, location]);

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const downloadReceipt = async () => {
    if (!order) return;

    setIsDownloading(true);
    try {
      const receiptText = `
        FARMFRESH MARKET RECEIPT
        ========================
        
        Order ID: ${order.order_id}
        Date: ${formatDate(order.created_at)}
        Status: ${order.status}
        Payment: ${order.payment_status}
        
        ITEMS:
        ${order.order_items.map(
          (item) => `
          ${item.product.name} x ${item.quantity}
          KSh ${formatPrice(item.product_price)} each
          Total: KSh ${formatPrice(item.product_price * item.quantity)}
        `
        ).join('')}
        
        ${order.coupon ? `Coupon: ${order.coupon.coupon_code} (Discount applied)` : 'No coupon used'}
        
        TOTAL: KSh ${formatPrice(order.total_amount)}
        
        Thank you for your purchase!
        ========================
      `;

      const blob = new Blob([receiptText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${order.order_id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccessMessage('Receipt downloaded successfully!');
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download receipt.');
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Completed', icon: '✅' },
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending', icon: '⏳' },
      processing: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Processing', icon: '🔄' },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled', icon: '❌' },
    };

    const config = statusConfig[status?.toLowerCase()] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: status, icon: '📋' };
    return (
      <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${config.color} border flex items-center gap-1.5`}>
        <span className="text-sm">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-700 text-lg font-medium">Loading order details...</p>
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
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Success Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-900 mb-3 sm:mb-4">
            Payment Successful!
          </h1>
          <p className="text-emerald-600 text-base sm:text-lg max-w-2xl mx-auto">
            Thank you for your purchase. Your order has been confirmed and is being processed.
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

        {order ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-emerald-100 overflow-hidden mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Order #{order.order_id}</h2>
                  <p className="text-emerald-100 text-sm sm:text-base">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  {getStatusBadge(order.status)}
                  <span className="text-2xl sm:text-3xl font-bold text-white">KSh {formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-emerald-900 mb-4 flex items-center">
                <span className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center mr-2">
                  📦
                </span>
                Order Items
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-emerald-50 rounded-lg sm:rounded-xl border border-emerald-100">
                    <img
                      src={
                        item.product.images && item.product.images.length > 0
                          ? `${BASE_URL}${item.product.images[0].image}`
                          : 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
                      }
                      alt={item.product.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0 shadow-sm"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-emerald-900 text-sm sm:text-base truncate">{item.product.name}</h4>
                      <p className="text-emerald-600 text-xs sm:text-sm">Quantity: {item.quantity}</p>
                      <p className="text-emerald-700 font-medium text-xs sm:text-sm">KSh {formatPrice(item.product_price)} each</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-900 font-bold text-sm sm:text-base">KSh {formatPrice(item.product_price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-emerald-200">
                <h3 className="text-lg sm:text-xl font-bold text-emerald-900 mb-4 flex items-center">
                  <span className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center mr-2">
                    📋
                  </span>
                  Order Summary
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-emerald-600 text-sm sm:text-base">Payment Status</span>
                    <span className="font-medium text-emerald-900 text-sm sm:text-base capitalize">{order.payment_status || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-emerald-600 text-sm sm:text-base">Payment Method</span>
                    <span className="font-medium text-emerald-900 text-sm sm:text-base capitalize">{order.payment_mode || 'N/A'}</span>
                  </div>
                  {order.coupon && (
                    <div className="flex justify-between items-center py-2 text-emerald-600">
                      <span className="text-sm sm:text-base">Coupon Discount</span>
                      <span className="font-medium text-sm sm:text-base">{order.coupon.coupon_code}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 border-t border-emerald-200">
                    <span className="text-lg sm:text-xl font-bold text-emerald-900">Total Amount</span>
                    <span className="text-lg sm:text-xl font-bold text-emerald-600">KSh {formatPrice(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-emerald-100 p-8 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl sm:text-3xl">❓</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-emerald-900 mb-3 sm:mb-4">Order details not available</h3>
            <p className="text-emerald-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
              We couldn't find the order details for your recent payment. Please check your orders page or contact support.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8">
          {order && (
            <button
              onClick={downloadReceipt}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-white border border-emerald-600 text-emerald-600 rounded-xl hover:bg-emerald-50 disabled:opacity-50 transition-all duration-300 shadow-sm hover:shadow-md text-sm sm:text-base font-medium"
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Download Receipt
                </>
              )}
            </button>
          )}
          <button
            onClick={() => navigate('/orders')}
            className="px-4 sm:px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base font-medium"
          >
            View All Orders
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 sm:px-6 py-3 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl transition-all duration-300 text-sm sm:text-base font-medium"
          >
            Back to Shopping
          </button>
        </div>

        {/* Next Steps */}
        {order && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-blue-800 mb-3 sm:mb-4 flex items-center">
              <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                ℹ️
              </span>
              What's Next?
            </h3>
            <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-blue-700">
              <p className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>You will receive an email confirmation shortly</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Your order will be processed within 24 hours</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Delivery updates will be sent to your email</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Contact support if you have any questions</span>
              </p>
            </div>
          </div>
        )}
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
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
      `}</style>
    </div>
  );
};

export default PaymentSuccess;