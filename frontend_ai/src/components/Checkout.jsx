import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'https://arifarm.onrender.com';

// Fallback product image
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Format price helper
  const formatPrice = useCallback((price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toLocaleString('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, []);

  // Get auth token helper
  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Please log in to proceed to checkout.');
      navigate('/login');
      return null;
    }
    return token.trim();
  }, [navigate]);

  // Fetch product details
  const fetchProductDetails = useCallback(async (token, productIds) => {
    try {
      const productsResponse = await axios.get(`${BASE_URL}/api/products/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { ids: productIds.join(',') },
      });
      
      return productsResponse.data.reduce((map, product) => {
        map[product.id] = product;
        return map;
      }, {});
    } catch (err) {
      console.error('Fetch products error:', err.response?.data || err.message);
      throw new Error('Failed to load product details');
    }
  }, []);

  // Fetch cart data
  const fetchCart = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      setIsLoading(true);
      setError('');
      
      const cartResponse = await axios.get(`${BASE_URL}/api/orders/carts/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const cartData = cartResponse.data[0] || null;
      setCart(cartData);

      if (cartData?.cart_items?.length > 0) {
        const productIds = cartData.cart_items
          .map(item => typeof item.product === 'number' ? item.product : item.product.id)
          .filter(id => id);

        if (productIds.length > 0) {
          const productMap = await fetchProductDetails(token, productIds);
          setProducts(productMap);
        }
      }
    } catch (err) {
      console.error('Fetch cart error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load cart. Please try again.';
      setError(errorMessage);
      
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate, getAuthToken, fetchProductDetails]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Get product from cart item
  const getProductFromItem = useCallback((item) => {
    if (typeof item.product === 'object') {
      return item.product;
    }
    return products[item.product] || null;
  }, [products]);

  // Get product image with fallback
  const getProductImage = useCallback((product) => {
    if (product?.images?.length > 0) {
      const imageUrl = product.images[0].image;
      return imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl}`;
    }
    return FALLBACK_IMAGE;
  }, []);

  // Calculate fallback total
  const calculateFallbackTotal = useCallback(() => {
    if (!cart?.cart_items) return 0;
    
    return cart.cart_items.reduce((sum, item) => {
      const product = getProductFromItem(item);
      const price = product ? parseFloat(product.price) : 0;
      return sum + price * item.quantity;
    }, 0);
  }, [cart, getProductFromItem]);

  // ✅ FIXED: Initiate payment - CORRECT URL!
  const initiatePayment = async () => {
    if (isPaying) return;
    
    setIsPaying(true);
    setError('');
    
    try {
      const token = getAuthToken();
      if (!token) return;

      // Extract email from JWT token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userEmail = payload.email;

      // ✅ CORRECT URL: /api/orders/payment/initiate/
      const response = await axios.post(
        `${BASE_URL}/api/orders/payment/initiate/`, 
        {
          amount: Math.round(finalTotal * 100), // Convert to kobo/cents
          email: userEmail
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.status && response.data.authorization_url) {
        setSuccessMessage('Redirecting to payment gateway...');
        setTimeout(() => {
          window.location.href = response.data.authorization_url;
        }, 1000);
      } else {
        setError(response.data.message || 'Failed to initiate payment.');
      }
    } catch (err) {
      console.error('Payment initiation error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Payment initiation failed. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-700 text-lg font-medium">Preparing your checkout...</p>
          <p className="text-emerald-500 text-sm mt-2">Getting everything ready for you</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && (!cart || !cart.cart_items || cart.cart_items.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-700 mb-2">Checkout Error</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/cart')}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = cart?.total_amount || calculateFallbackTotal();
  const discountAmount = cart?.coupon ? parseFloat(cart.coupon.discount || 0) : 0;
  const finalTotal = totalAmount - discountAmount;

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

            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => navigate('/cart')}
                className="flex items-center space-x-1 sm:space-x-2 px-3 py-2 sm:px-4 sm:py-2 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                <span className="hidden xs:inline">Back to Cart</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8 px-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-900 mb-3 sm:mb-4">
            Checkout
          </h1>
          <p className="text-emerald-600 text-base sm:text-lg">
            Complete your purchase securely
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

        {!cart || !cart.cart_items || cart.cart_items.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-emerald-100 p-6 sm:p-8 lg:p-12 text-center mx-2 sm:mx-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <span className="text-2xl sm:text-3xl lg:text-4xl">🛒</span>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-2xl font-bold text-emerald-900 mb-3 sm:mb-4">
              Your cart is empty
            </h3>
            <p className="text-emerald-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
              Looks like you haven't added any fresh organic products to your cart yet.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl sm:rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2 sm:space-x-3 mx-auto text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              <span>Start Shopping</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-900 flex items-center">
                    <span className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white mr-2 sm:mr-3">
                      📦
                    </span>
                    Order Items ({cart.cart_items.length})
                  </h2>
                </div>
                
                <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
                  {cart.cart_items.map((item) => {
                    const product = getProductFromItem(item);
                    const productImage = getProductImage(product);
                    const itemTotal = (product?.price || 0) * item.quantity;
                    
                    return (
                      <div key={item.id} className="flex items-center gap-3 sm:gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 hover:border-emerald-200 transition-all duration-300 group">
                        <div className="relative flex-shrink-0">
                          <img
                            src={productImage}
                            alt={product?.name || 'Product'}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg sm:rounded-xl shadow-sm group-hover:shadow-md transition-shadow"
                            onError={(e) => {
                              e.target.src = FALLBACK_IMAGE;
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-emerald-900 truncate group-hover:text-emerald-700 transition-colors">
                            {product?.name || 'Unknown Product'}
                          </h3>
                          <p className="text-emerald-600 font-medium text-xs sm:text-sm mt-1">
                            KSh {formatPrice(product?.price || 0)} each
                          </p>
                          <div className="flex items-center space-x-2 sm:space-x-4 mt-2">
                            <p className="text-emerald-700 font-medium text-sm sm:text-base">
                              Quantity: <span className="font-bold">{item.quantity}</span>
                            </p>
                            <p className="text-emerald-900 font-bold text-sm sm:text-base">
                              Total: KSh {formatPrice(itemTotal)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 sm:mt-6 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-emerald-100 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-emerald-900 mb-3 sm:mb-4 flex items-center">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                    🔒
                  </span>
                  Secure Payment
                </h3>
                <div className="space-y-3 text-sm sm:text-base text-emerald-700">
                  <p className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span>Your payment is processed securely via Paystack</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span>We don't store your payment details</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span>256-bit SSL encryption</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-emerald-100 sticky top-20 sm:top-24 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50">
                  <h3 className="text-xl sm:text-2xl font-bold text-emerald-900">Order Summary</h3>
                </div>
                
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center py-2 sm:py-3">
                    <span className="text-emerald-600 font-medium text-sm sm:text-base">Subtotal</span>
                    <span className="text-base sm:text-lg font-semibold text-emerald-900">KSh {formatPrice(totalAmount)}</span>
                  </div>

                  {cart.coupon && (
                    <div className="flex justify-between items-center py-2 sm:py-3 border-t border-emerald-100">
                      <span className="text-emerald-600 font-medium text-sm sm:text-base">
                        Discount ({cart.coupon.coupon_code})
                      </span>
                      <span className="text-base sm:text-lg font-semibold text-red-500">
                        -KSh {formatPrice(discountAmount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-3 sm:py-4 border-t border-emerald-200">
                    <span className="text-lg sm:text-xl font-bold text-emerald-900">Total Amount</span>
                    <span className="text-xl sm:text-2xl font-bold text-emerald-600">
                      KSh {formatPrice(finalTotal)}
                    </span>
                  </div>

                  <div className="pt-3 sm:pt-4">
                    <button
                      onClick={initiatePayment}
                      disabled={isPaying}
                      className={`w-full px-4 sm:px-6 py-3 sm:py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2 sm:space-x-3 ${
                        isPaying ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isPaying ? (
                        <>
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Pay KSh {formatPrice(finalTotal)}</span>
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                          </svg>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-3 sm:pt-4 border-t border-emerald-100">
                    <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-emerald-600">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                      <span>Secure checkout powered by Paystack</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full mt-4 px-4 sm:px-6 py-2 sm:py-3 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                <span>Continue Shopping</span>
              </button>
            </div>
          </div>
        )}
      </main>

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
        @media (min-width: 475px) {
          .xs\\:inline { display: inline !important; }
        }
      `}</style>
    </div>
  );
};

export default Checkout;