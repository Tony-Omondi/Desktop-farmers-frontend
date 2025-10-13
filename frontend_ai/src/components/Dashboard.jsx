import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('name');
  const [cartQuantities, setCartQuantities] = useState({});
  const [addingToCart, setAddingToCart] = useState({});
  const [activeView, setActiveView] = useState('grid');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          navigate('/login');
          return;
        }

        const trimmedToken = token.trim();
        if (!trimmedToken || trimmedToken === 'undefined' || trimmedToken === 'null') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/login');
          return;
        }

        setIsLoading(true);

        // Fetch all data in parallel
        const [userResponse, productsResponse, categoriesResponse, cartResponse] = await Promise.all([
          axios.get(`${BASE_URL}/api/accounts/me/`, {
            headers: { Authorization: `Bearer ${trimmedToken}` },
          }),
          axios.get(`${BASE_URL}/api/products/`, {
            headers: { Authorization: `Bearer ${trimmedToken}` },
          }),
          axios.get(`${BASE_URL}/api/categories/`, {
            headers: { Authorization: `Bearer ${trimmedToken}` },
          }),
          axios.get(`${BASE_URL}/api/orders/carts/`, {
            headers: { Authorization: `Bearer ${trimmedToken}` },
          })
        ]);

        setUser(userResponse.data);
        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data);
        
        const userCart = cartResponse.data[0] || null;
        setCart(userCart);
        
        // Initialize cart quantities
        if (userCart?.cart_items) {
          const quantities = {};
          userCart.cart_items.forEach(item => {
            quantities[item.product] = item.quantity;
          });
          setCartQuantities(quantities);
        }
      } catch (err) {
        console.error('Fetch data error:', err);
        if (err.response?.status === 401) {
          await handleTokenRefresh();
        } else {
          setError(err.response?.data?.detail || 'Failed to fetch data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleTokenRefresh = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        const refreshResponse = await axios.post(`${BASE_URL}/api/accounts/token/refresh/`, {
          refresh: refreshToken.trim(),
        });
        const newAccessToken = refreshResponse.data.access;
        localStorage.setItem('access_token', newAccessToken);
        window.location.reload();
      } else {
        navigate('/login');
      }
    } catch (refreshErr) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      navigate('/login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const formatPrice = (price) => {
    return parseFloat(price || 0).toLocaleString('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const updateCartQuantity = async (product, newQuantity) => {
    try {
      setAddingToCart(prev => ({ ...prev, [product.id]: true }));
      const token = localStorage.getItem('access_token').trim();

      if (newQuantity === 0) {
        // Remove item from cart
        const cartItem = cart?.cart_items?.find(item => item.product === product.id);
        if (cartItem) {
          await axios.delete(
            `${BASE_URL}/api/orders/cart-items/${cartItem.id}/`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } else {
        // Update or add item
        const cartItem = cart?.cart_items?.find(item => item.product === product.id);
        if (cartItem) {
          await axios.put(
            `${BASE_URL}/api/orders/cart-items/${cartItem.id}/`,
            { product: product.id, quantity: newQuantity },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          await axios.post(
            `${BASE_URL}/api/orders/cart-items/`,
            { product: product.id, quantity: newQuantity },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }

      // Refresh cart data
      const cartResponse = await axios.get(`${BASE_URL}/api/orders/carts/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedCart = cartResponse.data[0] || null;
      setCart(updatedCart);
      
      // Update local state
      setCartQuantities(prev => ({
        ...prev,
        [product.id]: newQuantity
      }));
    } catch (err) {
      console.error('Cart update error:', err);
      setError('Failed to update cart');
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const addToCart = (product) => {
    const currentQuantity = cartQuantities[product.id] || 0;
    updateCartQuantity(product, currentQuantity + 1);
  };

  const removeFromCart = (product) => {
    const currentQuantity = cartQuantities[product.id] || 0;
    if (currentQuantity > 0) {
      updateCartQuantity(product, currentQuantity - 1);
    }
  };

  const cartCount = Object.values(cartQuantities).reduce((total, quantity) => total + quantity, 0);

  const filteredProducts = products
    .filter((product) =>
      (selectedCategory === 'all' || product.category === parseInt(selectedCategory)) &&
      (searchQuery === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-700 text-lg font-medium">Loading your marketplace...</p>
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
            {/* Logo & Mobile Menu */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">🌿</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    FarmFresh
                  </h1>
                  <p className="text-xs text-emerald-600">Organic Marketplace</p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search fresh organic products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-emerald-900 placeholder-emerald-400"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* User Menu & Cart */}
            <div className="flex items-center space-x-4">
              {/* Cart Icon */}
              <a href="/cart" className="relative p-3 hover:bg-emerald-50 rounded-xl transition-colors group">
                <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg">
                    {cartCount}
                  </span>
                )}
              </a>

              {/* User Avatar */}
              <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-emerald-50 cursor-pointer transition-colors group">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center text-white font-medium shadow-md group-hover:shadow-lg transition-shadow">
                  {user?.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-emerald-900">{user?.full_name || 'User'}</p>
                  <p className="text-xs text-emerald-600">{user?.email || ''}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-emerald-100 shadow-lg">
          <div className="px-4 py-6 space-y-4">
            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {[
                { icon: '👤', label: 'Profile', href: '/profile' },
                { icon: '📦', label: 'My Orders', href: '/orders' },
                { icon: '💳', label: 'Payments', href: '/payments' },
                { icon: '🛒', label: 'Shopping Cart', href: '/cart', badge: cartCount },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium text-emerald-900">{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {item.badge}
                    </span>
                  )}
                </a>
              ))}
            </nav>

            {/* Mobile Categories */}
            <div className="pt-4 border-t border-emerald-100">
              <h3 className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3">Categories</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`p-3 rounded-xl transition-all text-sm font-medium ${
                    selectedCategory === 'all'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  All Products
                </button>
                {categories.slice(0, 3).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id.toString())}
                    className={`p-3 rounded-xl transition-all text-sm font-medium ${
                      selectedCategory === category.id.toString()
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center lg:text-left">
          <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full mb-4">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-sm font-medium text-emerald-700">Fresh products available</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-emerald-900 mb-2">
            Good morning, {user?.full_name?.split(' ')[0] || 'there'}! 🌞
          </h1>
          <p className="text-emerald-600 text-lg">
            Discover fresh, organic products from local farmers
          </p>
        </div>

        {/* Stats & Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Cart Items', value: cartCount, icon: '🛒', color: 'emerald' },
            { label: 'Products', value: products.length, icon: '🌿', color: 'green' },
            { label: 'Categories', value: categories.length, icon: '📦', color: 'emerald' },
            { label: 'Available', value: filteredProducts.length, icon: '✅', color: 'green' },
          ].map((stat, index) => (
            <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-emerald-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Desktop */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 sticky top-24">
              {/* Navigation */}
              <nav className="space-y-2 mb-8">
                <h3 className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-4">Navigation</h3>
                {[
                  { icon: '👤', label: 'Profile', href: '/profile' },
                  { icon: '📦', label: 'My Orders', href: '/orders' },
                  { icon: '💳', label: 'Payments', href: '/payments' },
                  { icon: '🛒', label: 'Shopping Cart', href: '/cart', badge: cartCount },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                      <span className="font-medium text-emerald-700 group-hover:text-emerald-900">
                        {item.label}
                      </span>
                    </div>
                    {item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {item.badge}
                      </span>
                    )}
                  </a>
                ))}
              </nav>

              {/* Categories */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left p-3 rounded-xl transition-all group ${
                      selectedCategory === 'all'
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'hover:bg-emerald-50 text-emerald-700 border border-transparent hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg group-hover:scale-110 transition-transform">📁</span>
                      <span className="font-medium">All Products</span>
                    </div>
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id.toString())}
                      className={`w-full text-left p-3 rounded-xl transition-all group ${
                        selectedCategory === category.id.toString()
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'hover:bg-emerald-50 text-emerald-700 border border-transparent hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg group-hover:scale-110 transition-transform">🏷️</span>
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-4">Sort By</h3>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full p-3 border border-emerald-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-emerald-900"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 group"
              >
                <span className="group-hover:scale-110 transition-transform">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* View Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-emerald-900">Fresh Organic Products</h2>
                <p className="text-emerald-600">
                  {filteredProducts.length} products found
                  {searchQuery && ` for "${searchQuery}"`}
                  {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === parseInt(selectedCategory))?.name}`}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* View Toggle */}
                <div className="flex items-center space-x-2 bg-white rounded-2xl p-1 border border-emerald-200">
                  <button
                    onClick={() => setActiveView('grid')}
                    className={`p-2 rounded-xl transition-colors ${
                      activeView === 'grid' ? 'bg-emerald-100 text-emerald-600' : 'text-emerald-400 hover:text-emerald-600'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setActiveView('list')}
                    className={`p-2 rounded-xl transition-colors ${
                      activeView === 'list' ? 'bg-emerald-100 text-emerald-600' : 'text-emerald-400 hover:text-emerald-600'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>

                {/* Filter Badges */}
                <div className="flex items-center space-x-2">
                  {(searchQuery || selectedCategory !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-full text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                      <span>Clear filters</span>
                      <span>×</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-12 text-center">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-900 mb-2">No products found</h3>
                <p className="text-emerald-600 mb-6">
                  {searchQuery
                    ? `No products match "${searchQuery}"`
                    : 'Try selecting a different category'}
                </p>
                {(searchQuery || selectedCategory !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className={`grid gap-6 ${
                activeView === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredProducts.map((product) => {
                  const quantityInCart = cartQuantities[product.id] || 0;
                  const isAdding = addingToCart[product.id];
                  const category = categories.find(c => c.id === product.category);

                  return (
                    <div
                      key={product.id}
                      className={`bg-white rounded-2xl shadow-sm border border-emerald-100 hover:shadow-lg transition-all duration-300 overflow-hidden group ${
                        activeView === 'list' ? 'flex' : ''
                      }`}
                    >
                      {/* Product Image */}
                      <div className={`relative ${
                        activeView === 'list' ? 'w-48 flex-shrink-0' : 'w-full h-48'
                      }`}>
                        <img
                          src={
                            product.images?.[0]?.image ||
                            'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
                          }
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-emerald-700 text-xs font-medium rounded-lg shadow-sm">
                            {category?.name || 'Organic'}
                          </span>
                        </div>
                        {quantityInCart > 0 && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded-lg shadow-lg">
                              In Cart: {quantityInCart}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-emerald-900 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-2xl font-bold text-emerald-600 ml-4">
                            KSh {formatPrice(product.price)}
                          </p>
                        </div>

                        <p className="text-emerald-600 text-sm mb-4 line-clamp-2">
                          {product.description || 'Fresh organic product from local farmers'}
                        </p>

                        {/* Cart Controls */}
                        <div className="flex items-center justify-between">
                          {quantityInCart > 0 ? (
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => removeFromCart(product)}
                                disabled={isAdding}
                                className="w-10 h-10 bg-emerald-100 hover:bg-emerald-200 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 group"
                              >
                                <svg className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="text-lg font-semibold text-emerald-900 min-w-8 text-center">
                                {quantityInCart}
                              </span>
                              <button
                                onClick={() => addToCart(product)}
                                disabled={isAdding}
                                className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 group"
                              >
                                {isAdding ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(product)}
                              disabled={isAdding}
                              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center space-x-2 shadow-md hover:shadow-lg"
                            >
                              {isAdding ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>Adding...</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  <span>Add to Cart</span>
                                </>
                              )}
                            </button>
                          )}

                          {quantityInCart > 0 && (
                            <div className="text-right">
                              <p className="text-sm text-emerald-600">Total</p>
                              <p className="text-lg font-bold text-emerald-900">
                                KSh {formatPrice(product.price * quantityInCart)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-emerald-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🌿</span>
              </div>
              <span className="text-lg font-bold text-emerald-900">FarmFresh</span>
            </div>
            <p className="text-emerald-600 text-sm">
              Fresh organic products delivered to your doorstep
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;