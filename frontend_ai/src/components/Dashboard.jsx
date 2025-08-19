
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('No authentication token found. Please log in.');
          navigate('/frontend_ai/login');
          return;
        }

        const trimmedToken = token.trim();
        if (!trimmedToken || trimmedToken === 'undefined' || trimmedToken === 'null') {
          setError('Invalid token format. Please log in again.');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/frontend_ai/login');
          return;
        }
        console.log('Access Token:', trimmedToken);
        console.log('Authorization Header:', `Bearer ${trimmedToken}`);

        setIsLoading(true);

        // Fetch user data
        const userResponse = await axios.get(`${BASE_URL}/api/accounts/me/`, {
          headers: { Authorization: `Bearer ${trimmedToken}` },
        });
        console.log('User data:', userResponse.data);
        setUser(userResponse.data);

        // Fetch products
        const productsResponse = await axios.get(`${BASE_URL}/api/products/`, {
          headers: { Authorization: `Bearer ${trimmedToken}` },
        });
        console.log('Products data:', productsResponse.data);
        // Log image URLs for debugging
        productsResponse.data.forEach((product) =>
          console.log(`Product ${product.id} images:`, product.images)
        );
        setProducts(productsResponse.data);

        // Fetch categories
        const categoriesResponse = await axios.get(`${BASE_URL}/api/categories/`, {
          headers: { Authorization: `Bearer ${trimmedToken}` },
        });
        console.log('Categories data:', categoriesResponse.data);
        setCategories(categoriesResponse.data);
      } catch (err) {
        console.error('Fetch data error:', err.response?.data, err.response?.status);
        if (err.response?.status === 401) {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              console.log('Attempting token refresh with:', refreshToken);
              const refreshResponse = await axios.post(`${BASE_URL}/api/accounts/token/refresh/`, {
                refresh: refreshToken.trim(),
              });
              const newAccessToken = refreshResponse.data.access;
              localStorage.setItem('access_token', newAccessToken);
              console.log('New Access Token:', newAccessToken);
              // Retry fetching user, products, and categories
              const retryUserResponse = await axios.get(`${BASE_URL}/api/accounts/me/`, {
                headers: { Authorization: `Bearer ${newAccessToken}` },
              });
              console.log('Retry user data:', retryUserResponse.data);
              setUser(retryUserResponse.data);
              const retryProductsResponse = await axios.get(`${BASE_URL}/api/products/`, {
                headers: { Authorization: `Bearer ${newAccessToken}` },
              });
              console.log('Retry products data:', retryProductsResponse.data);
              retryProductsResponse.data.forEach((product) =>
                console.log(`Retry Product ${product.id} images:`, product.images)
              );
              setProducts(retryProductsResponse.data);
              const retryCategoriesResponse = await axios.get(`${BASE_URL}/api/categories/`, {
                headers: { Authorization: `Bearer ${newAccessToken}` },
              });
              console.log('Retry categories data:', retryCategoriesResponse.data);
              setCategories(retryCategoriesResponse.data);
            } catch (refreshErr) {
              console.error('Refresh token error:', refreshErr.response?.data);
              setError('Session expired. Please log in again.');
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              navigate('/frontend_ai/login');
            }
          } else {
            setError('No refresh token available. Please log in again.');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            navigate('/frontend_ai/login');
          }
        } else if (err.response?.status === 403) {
          setError('Access forbidden. Invalid token or permissions. Please log in again.');
          console.error('403 Forbidden details:', err.response?.data);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/frontend_ai/login');
        } else if (err.response?.status === 404) {
          setError('Endpoint not found. Please check server configuration.');
        } else {
          setError(err.response?.data?.detail || 'Failed to fetch data. Please try again.');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/frontend_ai/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('cart');
    navigate('/frontend_ai/login');
  };

  // Format price to two decimal places
  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  // Add product to cart
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevCart,
        {
          productId: product.id,
          name: product.name,
          price: parseFloat(product.price),
          quantity: 1,
        },
      ];
    });
  };

  // Calculate cart totals
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // Filter products by selected category
  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((product) => product.category === parseInt(selectedCategory));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      {/* Mobile Sidebar Toggle */}
      <button
        className={`md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md transition-all ${isOpen ? 'transform rotate-90' : ''}`}
        onClick={toggleSidebar}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${isOpen ? 'opacity-100 md:opacity-0' : 'opacity-0 pointer-events-none'} md:hidden`}
        onClick={toggleSidebar}
      ></div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`fixed md:relative inset-y-0 left-0 w-64 bg-white shadow-lg z-40 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}
        >
          <div className="flex flex-col h-full p-6">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img src="/logo.png" alt="Farmers Market Logo" className="h-12 w-auto transition-opacity hover:opacity-90" />
            </div>

            {/* User Profile */}
            <div className="flex items-center mb-8 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-medium text-xl mr-3">
                {user?.full_name?.[0] || 'U'}
              </div>
              <div>
                <p className="font-medium text-gray-800 truncate max-w-[150px]">{user?.full_name || 'User'}</p>
                <p className="text-xs text-gray-500">View profile</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
              <a
                href="/frontend_ai/profile"
                className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 text-emerald-700 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span>Profile</span>
              </a>
              <a
                href="/frontend_ai/orders"
                className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <span>Orders</span>
              </a>
              <a
                href="/frontend_ai/payments"
                className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Payments</span>
              </a>
              {/* Cart Summary */}
              <div className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium">Cart</p>
                  <p className="text-xs text-gray-500">
                    {cartCount} item{cartCount !== 1 ? 's' : ''} • ${formatPrice(cartTotal)}
                  </p>
                </div>
                <a
                  href="/frontend_ai/cart"
                  className="text-emerald-600 hover:text-emerald-500 text-sm font-medium"
                >
                  View Cart
                </a>
              </div>
            </nav>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="mt-auto flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64">
          <div className="max-w-6xl mx-auto p-4 md:p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
                <svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Products Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Products</h2>
              </div>
              <div className="p-6">
                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id.toString())}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category.id.toString()
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                  <div className="text-center text-gray-500">
                    <p>No products found in this category.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <img
                          src={
                            product.images && product.images.length > 0
                              ? product.images[0].image
                              : 'https://images.pexels.com/photos/5705490/pexels-photo-5705490.jpeg?auto=compress&cs=tinysrgb&w=600'
                          }
                          alt={product.name}
                          className="w-full h-40 object-cover rounded-md mb-4"
                          onError={(e) => {
                            console.error(`Failed to load image for ${product.name}:`, product.images[0]?.image);
                            e.target.src = 'https://images.pexels.com/photos/5705490/pexels-photo-5705490.jpeg?auto=compress&cs=tinysrgb&w=600';
                          }}
                        />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-emerald-600 font-medium">${formatPrice(product.price)}</p>
                          <button
                            onClick={() => addToCart(product)}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;