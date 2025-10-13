import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [updatingItems, setUpdatingItems] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('Please log in to view your cart.');
          navigate('/login');
          return;
        }

        setIsLoading(true);
        const cartResponse = await axios.get(`${BASE_URL}/api/orders/carts/`, {
          headers: { Authorization: `Bearer ${token.trim()}` },
        });
        console.log('Cart data:', cartResponse.data);
        const cartData = cartResponse.data[0] || null;
        setCart(cartData);

        // Fetch product details if cart_items contain product IDs
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
            console.log('Fetched products:', productMap);
            setProducts(productMap);
          }
        }
      } catch (err) {
        console.error('Fetch cart error:', err.response?.data);
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/login');
        } else {
          setError(err.response?.data?.detail || 'Failed to fetch cart.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    
    setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
    
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(
        `${BASE_URL}/api/orders/cart-items/${itemId}/`,
        { quantity },
        { headers: { Authorization: `Bearer ${token.trim()}` } }
      );
      const cartResponse = await axios.get(`${BASE_URL}/api/orders/carts/`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });
      setCart(cartResponse.data[0] || null);
      setSuccessMessage('Cart updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Update quantity error:', err.response?.data);
      setError(err.response?.data?.quantity || 'Failed to update quantity.');
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const removeItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this item from your cart?')) {
      return;
    }

    setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
    
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${BASE_URL}/api/orders/cart-items/${itemId}/`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });
      const cartResponse = await axios.get(`${BASE_URL}/api/orders/carts/`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });
      setCart(cartResponse.data[0] || null);
      setSuccessMessage('Item removed from cart');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Remove item error:', err.response?.data);
      setError('Failed to remove item.');
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${BASE_URL}/api/orders/carts/apply-coupon/`,
        { coupon: couponCode.trim() },
        { headers: { Authorization: `Bearer ${token.trim()}` } }
      );
      const cartResponse = await axios.get(`${BASE_URL}/api/orders/carts/`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });
      setCart(cartResponse.data[0] || null);
      setCouponCode('');
      setError('');
      setSuccessMessage('Coupon applied successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Apply coupon error:', err.response?.data);
      setError(err.response?.data?.detail || 'Failed to apply coupon.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toLocaleString('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getTotalAmount = () => {
    if (cart?.total_amount) return parseFloat(cart.total_amount);
    if (!cart?.cart_items) return 0;
    return cart.cart_items.reduce((total, item) => {
      const product = typeof item.product === 'object' ? item.product : products[item.product];
      return total + (product ? parseFloat(product.price) * item.quantity : 0);
    }, 0);
  };

  const getItemTotal = (item) => {
    const product = typeof item.product === 'object' ? item.product : products[item.product];
    return product ? parseFloat(product.price) * item.quantity : 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-700 text-lg font-medium">Loading your cart...</p>
          <p className="text-emerald-500 text-sm mt-2">Getting everything ready for you</p>
        </div>
      </div>
    );
  }

  const totalAmount = getTotalAmount();
  const discountAmount = cart?.coupon ? parseFloat(cart.coupon.discount_amount) : 0;
  const finalTotal = totalAmount - discountAmount;

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

      <main className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="text-center mb-6 sm:mb-8 px-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-900 mb-3 sm:mb-4">
            Your Shopping Cart
          </h1>
          <p className="text-emerald-600 text-base sm:text-lg">
            Review your fresh organic products
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
              <p className="text-red-700 font-medium text-sm sm:text-base truncate">{error}</p>
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
              <p className="text-emerald-700 font-medium text-sm sm:text-base truncate">{successMessage}</p>
            </div>
            <button 
              onClick={() => setSuccessMessage('')}
              className="p-1 sm:p-2 hover:bg-emerald-100 rounded-lg sm:rounded-xl transition-colors flex-shrink-0 ml-2"
            >
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        )}

        {!cart || !cart.cart_items || cart.cart_items.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-emerald-100 p-6 sm:p-8 lg:p-12 text-center mx-2 sm:mx-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <span className="text-2xl sm:text-3xl lg:text-4xl">🛒</span>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-2xl font-bold text-emerald-900 mb-3 sm:mb-4">
              Your cart is empty
            </h3>
            <p className="text-emerald-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
              Looks like you haven't added any fresh organic products to your cart yet. Start shopping to discover amazing products!
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
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-emerald-100">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-900">
                    Cart Items ({cart.cart_items.length})
                  </h2>
                </div>
                
                <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
                  {cart.cart_items.map((item) => {
                    const product = typeof item.product === 'object' ? item.product : products[item.product];
                    const isUpdating = updatingItems[item.id];
                    const itemTotal = getItemTotal(item);
                    
                    return (
                      <div key={item.id} className="flex flex-col xs:flex-row xs:items-center gap-3 sm:gap-4 lg:gap-6 p-4 sm:p-6 bg-emerald-50 rounded-xl sm:rounded-2xl border border-emerald-100 hover:border-emerald-200 transition-all duration-300 group">
                        {/* Product Image */}
                        <div className="flex items-center gap-3 sm:gap-4 xs:flex-1">
                          <div className="relative flex-shrink-0">
                            <img
                              src={
                                product?.images && product.images.length > 0
                                  ? product.images[0].image
                                  : 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
                              }
                              alt={product?.name || 'Product'}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg sm:rounded-xl shadow-sm group-hover:shadow-md transition-shadow"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
                              }}
                            />
                            {isUpdating && (
                              <div className="absolute inset-0 bg-white/80 rounded-lg sm:rounded-xl flex items-center justify-center">
                                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-emerald-900 truncate group-hover:text-emerald-700 transition-colors">
                              {product?.name || 'Unknown Product'}
                            </h3>
                            <p className="text-emerald-600 font-medium text-xs sm:text-sm mt-1">
                              KSh {formatPrice(product?.price || 0)} each
                            </p>
                            <div className="flex items-center space-x-2 sm:space-x-4 mt-2">
                              <p className="text-emerald-700 font-medium text-sm sm:text-base">
                                Total: <span className="text-base sm:text-lg">KSh {formatPrice(itemTotal)}</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between xs:justify-end space-x-3 sm:space-x-4 pt-3 xs:pt-0 border-t xs:border-t-0 border-emerald-200 xs:border-none">
                          <div className="flex items-center space-x-2 sm:space-x-3 bg-white rounded-xl sm:rounded-2xl p-1 sm:p-2 border border-emerald-200 shadow-sm">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isUpdating}
                              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg sm:rounded-xl hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                              </svg>
                            </button>
                            <span className="w-6 sm:w-8 text-center font-semibold text-emerald-900 text-sm sm:text-lg">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={isUpdating}
                              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg sm:rounded-xl hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
                            >
                              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                              </svg>
                            </button>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={isUpdating}
                            className="p-2 sm:p-3 text-red-500 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors disabled:opacity-50 group/remove flex-shrink-0"
                            title="Remove item"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover/remove:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Coupon Section */}
              <div className="mt-4 sm:mt-6 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-emerald-100 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-emerald-900 mb-3 sm:mb-4 flex items-center">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                    🎫
                  </span>
                  Apply Coupon Code
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Enter your coupon code here..."
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-emerald-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-emerald-900 placeholder-emerald-400 transition-all text-sm sm:text-base"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={!couponCode.trim() || isApplyingCoupon}
                    className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg sm:rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    {isApplyingCoupon ? (
                      <>
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Applying...</span>
                      </>
                    ) : (
                      <>
                        <span>Apply Coupon</span>
                      </>
                    )}
                  </button>
                </div>
                {cart.coupon && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-lg sm:rounded-xl">
                    <p className="text-emerald-700 font-medium text-sm sm:text-base">
                      🎉 Coupon <span className="font-bold">{cart.coupon.coupon_code}</span> applied! 
                      You saved KSh {formatPrice(cart.coupon.discount_amount)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-emerald-100 sticky top-20 sm:top-24 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50">
                  <h3 className="text-xl sm:text-2xl font-bold text-emerald-900">Order Summary</h3>
                </div>
                
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center py-2 sm:py-3">
                    <span className="text-emerald-600 font-medium text-sm sm:text-base">Subtotal</span>
                    <span className="text-base sm:text-lg font-semibold text-emerald-900">KSh {formatPrice(totalAmount)}</span>
                  </div>

                  {/* Discount */}
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

                  {/* Total */}
                  <div className="flex justify-between items-center py-3 sm:py-4 border-t border-emerald-200">
                    <span className="text-lg sm:text-xl font-bold text-emerald-900">Total Amount</span>
                    <span className="text-xl sm:text-2xl font-bold text-emerald-600">
                      KSh {formatPrice(finalTotal)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
                    <button
                      onClick={() => navigate('/checkout')}
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2 sm:space-x-3"
                    >
                      <span>Proceed to Checkout</span>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                      </svg>
                      <span>Continue Shopping</span>
                    </button>
                  </div>

                  {/* Additional Info */}
                  <div className="pt-3 sm:pt-4 border-t border-emerald-100">
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-emerald-600">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                      <span>Secure checkout</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-emerald-100 mt-8 sm:mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
          .xs\\:flex-row { flex-direction: row !important; }
          .xs\\:items-center { align-items: center !important; }
          .xs\\:flex-1 { flex: 1 !important; }
          .xs\\:pt-0 { padding-top: 0 !important; }
          .xs\\:border-t-0 { border-top-width: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default Cart;