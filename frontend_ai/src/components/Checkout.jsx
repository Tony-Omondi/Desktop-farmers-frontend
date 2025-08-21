import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('Please log in to proceed to checkout.');
          navigate('/frontend_ai/login');
          return;
        }

        setIsLoading(true);
        const cartResponse = await axios.get(`${BASE_URL}/api/orders/carts/`, {
          headers: { Authorization: `Bearer ${token.trim()}` },
        });
        console.log('Cart data:', JSON.stringify(cartResponse.data, null, 2));
        const cartData = cartResponse.data[0] || null;
        setCart(cartData);

        if (cartData && cartData.cart_items) {
          const productIds = cartData.cart_items
            .filter((item) => typeof item.product === 'number')
            .map((item) => item.product);
          if (productIds.length > 0) {
            const productsResponse = await axios.get(`${BASE_URL}/api/products/`, {
              headers: { Authorization: `Bearer ${token.trim()}` },
              params: { ids: productIds.join(',') },
            });
            const productMap = productsResponse.data.reduce((map, product) => {
              map[product.id] = product;
              return map;
            }, {});
            console.log('Fetched products:', JSON.stringify(productMap, null, 2));
            setProducts(productMap);
          } else {
            console.log('No product IDs to fetch');
          }
        } else {
          console.log('No cart items found');
        }
      } catch (err) {
        console.error('Fetch cart error:', err.response?.data || err.message);
        setError(err.response?.data?.detail || 'Failed to load cart. Please try again.');
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/frontend_ai/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    const checkPaymentStatus = async () => {
      const params = new URLSearchParams(location.search);
      const reference = params.get('reference');
      if (reference) {
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
          setPaymentStatus(response.data);
          if (response.data.status) {
            setTimeout(() => navigate('/frontend_ai/payment-success', { state: { orderId: response.data.order_id } }), 1000);
          } else {
            setError(response.data.message || 'Payment verification failed.');
          }
        } catch (err) {
          console.error('Payment callback error:', err.response?.data || err.message);
          setError(err.response?.data?.message || 'Failed to verify payment.');
        }
      }
    };

    fetchCart();
    checkPaymentStatus();
  }, [navigate, location]);

  const initiatePayment = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Please log in to initiate payment.');
        navigate('/frontend_ai/login');
        return;
      }
      const response = await axios.post(
        `${BASE_URL}/api/orders/orders/payment/initiate/`,
        {},
        { headers: { Authorization: `Bearer ${token.trim()}` } }
      );
      console.log('Payment initiation response:', JSON.stringify(response.data, null, 2));
      if (response.data.status && response.data.authorization_url) {
        window.location.href = response.data.authorization_url;
      } else {
        setError(response.data.message || 'Failed to initiate payment.');
      }
    } catch (err) {
      console.error('Payment initiation error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Payment initiation failed. Please try again.');
    }
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  const calculateFallbackTotal = () => {
    if (!cart?.cart_items) {
      console.log('Fallback total: No cart items');
      return 0;
    }
    const total = cart.cart_items.reduce((sum, item) => {
      const product = typeof item.product === 'object' ? item.product : products[item.product];
      const price = product ? parseFloat(product.price) : 0;
      console.log(`Item ${item.id} price:`, {
        price,
        quantity: item.quantity,
        productId: item.product,
        source: typeof item.product === 'object' ? 'cart' : 'products',
      });
      return sum + price * item.quantity;
    }, 0);
    const discount = cart.coupon ? parseFloat(cart.coupon.discount || 0) : 0;
    console.log('Fallback total:', { total, discount });
    return total - discount;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus?.status) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful</h1>
          <p className="text-gray-600 mb-4">Your payment has been verified. Redirecting to order confirmation...</p>
          <button
            onClick={() => navigate('/frontend_ai/dashboard')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
          <svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={() => navigate('/frontend_ai/cart')}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
        >
          Back to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>
      {!cart || !cart.cart_items || cart.cart_items.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-500 mb-4">Your cart is empty.</p>
          <button
            onClick={() => navigate('/frontend_ai/dashboard')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
          >
            Shop Now
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {cart.cart_items.map((item) => {
              const product = typeof item.product === 'object' ? item.product : products[item.product];
              console.log(`Rendering item ${item.id}:`, {
                product,
                price: product?.price,
                source: typeof item.product === 'object' ? 'cart' : 'products',
              });
              return (
                <div key={item.id} className="flex items-center justify-between border-b border-gray-200 py-2">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        product?.images && product.images.length > 0
                          ? `${BASE_URL}${product.images[0].image}`
                          : 'https://images.pexels.com/photos/5705490/pexels-photo-5705490.jpeg?auto=compress&cs=tinysrgb&w=600'
                      }
                      alt={product?.name || 'Product'}
                      className="w-16 h-16 object-cover rounded-md"
                      onError={(e) => {
                        console.error(`Failed to load image for ${product?.name || 'product'}:`, product?.images[0]?.image);
                        e.target.src = 'https://images.pexels.com/photos/5705490/pexels-photo-5705490.jpeg?auto=compress&cs=tinysrgb&w=600';
                      }}
                    />
                    <div>
                      <p className="text-gray-800 font-medium">{product?.name || 'Unknown Product'}</p>
                      <p className="text-sm text-gray-600">KSh {formatPrice(product?.price || 0)} x {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-gray-600">KSh {formatPrice((product?.price || 0) * item.quantity)}</p>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-800 font-medium">
              Total: KSh {formatPrice(cart.total_amount || calculateFallbackTotal())} {cart.coupon && `(Coupon: ${cart.coupon.coupon_code})`}
            </p>
            <button
              onClick={initiatePayment}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
            >
              Pay with Paystack
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => navigate('/frontend_ai/cart')}
        className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
      >
        Back to Cart
      </button>
    </div>
  );
};

export default Checkout;