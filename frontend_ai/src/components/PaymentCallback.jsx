import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const PaymentCallback = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const params = new URLSearchParams(location.search);
      const reference = params.get('reference');
      if (!reference) {
        setError('No payment reference provided.');
        setTimeout(() => navigate('/frontend_ai/cart'), 3000);
        return;
      }

      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('Please log in to verify payment.');
          navigate('/frontend_ai/login');
          return;
        }
        const response = await axios.get(`${BASE_URL}/api/orders/orders/payment/callback/`, {
          headers: { Authorization: `Bearer ${token.trim()}` },
          params: { reference },
        });
        console.log('Payment callback response:', JSON.stringify(response.data, null, 2));
        if (response.data.status) {
          navigate('/frontend_ai/payment-success', { state: { orderId: response.data.order_id } });
        } else {
          setError(response.data.message || 'Payment verification failed.');
          setTimeout(() => navigate('/frontend_ai/cart'), 3000);
        }
      } catch (err) {
        console.error('Payment callback error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to verify payment.');
        setTimeout(() => navigate('/frontend_ai/cart'), 3000);
      }
    };

    checkPaymentStatus();
  }, [navigate, location]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
        <p className="text-gray-600">Verifying payment...</p>
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
            <svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;