import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('Please log in to view your orders.');
          navigate('/frontend_ai/login');
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
          navigate('/frontend_ai/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [navigate]);

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Orders</h1>
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
          <svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-sm">{error}</p>
        </div>
      )}
      {orders.length === 0 ? (
        <p className="text-gray-500">You have no orders.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Order #{order.order_id}</h2>
                <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="space-y-2 mb-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          item.product.images && item.product.images.length > 0
                            ? item.product.images[0].image
                            : 'https://images.pexels.com/photos/5705490/pexels-photo-5705490.jpeg?auto=compress&cs=tinysrgb&w=600'
                        }
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-md"
                        onError={(e) => {
                          console.error(`Failed to load image for ${item.product.name}:`, item.product.images[0]?.image);
                          e.target.src = 'https://images.pexels.com/photos/5705490/pexels-photo-5705490.jpeg?auto=compress&cs=tinysrgb&w=600';
                        }}
                      />
                      <div>
                        <p className="text-gray-800 font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-600">KSh {formatPrice(item.product_price)} x {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-gray-600">KSh {formatPrice(item.product_price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Status: {order.status}</p>
                  <p className="text-sm text-gray-600">Payment: {order.payment_status}</p>
                  <p className="text-sm text-gray-600">
                    Coupon: {order.coupon ? order.coupon.coupon_code : 'None'}
                  </p>
                </div>
                <p className="text-gray-800 font-medium">Total: KSh {formatPrice(order.total_amount)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => navigate('/frontend_ai/dashboard')}
        className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default Orders;