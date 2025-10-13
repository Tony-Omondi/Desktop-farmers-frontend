import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const PaymentCallback = () => {
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Verifying payment...');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const params = new URLSearchParams(location.search);
      const reference = params.get('reference');
      
      if (!reference) {
        setError('No payment reference provided.');
        setStatus('Payment reference missing');
        setTimeout(() => navigate('/cart'), 3000);
        return;
      }

      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('Please log in to verify payment.');
          setStatus('Authentication required');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        setStatus('Verifying payment with bank...');
        
        const response = await axios.get(`${BASE_URL}/api/orders/orders/payment/callback/`, {
          headers: { Authorization: `Bearer ${token.trim()}` },
          params: { reference },
        });

        if (response.data.status) {
          setStatus('Payment verified! Fetching order details...');
          
          // Fetch the order to get its pk (id)
          const orderResponse = await axios.get(`${BASE_URL}/api/orders/orders/`, {
            headers: { Authorization: `Bearer ${token.trim()}` },
            params: { order_id: response.data.order_id },
          });
          
          const order = orderResponse.data.find((o) => o.order_id === response.data.order_id);
          if (order) {
            setStatus('Redirecting to success page...');
            setTimeout(() => {
              navigate('/payment-success', { state: { orderId: order.id } });
            }, 1000);
          } else {
            setError('Order not found after successful payment.');
            setStatus('Order retrieval failed');
            setTimeout(() => navigate('/orders'), 3000);
          }
        } else {
          setError(response.data.message || 'Payment verification failed.');
          setStatus('Payment failed');
          setTimeout(() => navigate('/cart'), 3000);
        }
      } catch (err) {
        console.error('Payment callback error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to verify payment. Please check your orders.');
        setStatus('Verification error');
        setTimeout(() => navigate('/orders'), 3000);
      }
    };

    checkPaymentStatus();
  }, [navigate, location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 sm:p-8 text-center">
          {/* Animated Icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-75"></div>
              <div className="absolute inset-2 bg-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <h2 className="text-xl sm:text-2xl font-bold text-emerald-900 mb-3">
            Processing Payment
          </h2>
          
          <div className="flex items-center justify-center mb-6">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-3"></div>
            <p className="text-emerald-700 font-medium">{status}</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-emerald-100 rounded-full h-2 mb-6">
            <div className="bg-emerald-500 h-2 rounded-full animate-pulse"></div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-red-800 font-semibold">Payment Issue</h3>
              </div>
              <p className="text-red-700 text-sm">{error}</p>
              <p className="text-red-600 text-xs mt-2">
                You will be redirected automatically...
              </p>
            </div>
          )}

          {/* Help Text */}
          <div className="text-center">
            <p className="text-emerald-600 text-sm mb-4">
              Please wait while we confirm your payment with the bank.
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-emerald-500">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>Encrypted</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>Verified</span>
              </div>
            </div>
          </div>

          {/* Manual Navigation */}
          <div className="mt-6 pt-4 border-t border-emerald-100">
            <p className="text-emerald-600 text-xs mb-3">
              Taking too long? You can manually navigate:
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => navigate('/orders')}
                className="px-4 py-2 text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors"
              >
                View Orders
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="px-4 py-2 text-xs bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg transition-colors"
              >
                Back to Cart
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-xs bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2 bg-white rounded-full px-4 py-2 border border-emerald-200 shadow-sm">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            <span className="text-xs text-emerald-600 font-medium">256-bit SSL Secured</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PaymentCallback;