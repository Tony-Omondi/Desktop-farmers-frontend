import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion'; // Add framer-motion for advanced animations

const BASE_URL = 'http://localhost:8000';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recipeCategories, setRecipeCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRecipeCategory, setSelectedRecipeCategory] = useState('all');
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [recipeSearchQuery, setRecipeSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('name');
  const [activeTab, setActiveTab] = useState('products');
  const [cartQuantities, setCartQuantities] = useState({});
  const [addingToCart, setAddingToCart] = useState({});
  const [activeView, setActiveView] = useState('grid');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  // New states for download functionality
  const [isDownloading, setIsDownloading] = useState(false);
  
  const navigate = useNavigate();

  // Navigation items
  const navItems = [
    { icon: '👤', label: 'Profile', path: '/profile' },
    { icon: '📦', label: 'My Orders', path: '/orders' },
    { icon: '💳', label: 'Payments', path: '/payments' },
    { icon: '🛒', label: 'Shopping Cart', path: '/cart', badge: true },
  ];

  // Scroll detection for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

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

        const [userResponse, productsResponse, categoriesResponse, recipeCategoriesResponse, recipesResponse, cartResponse] = await Promise.all([
          axios.get(`${BASE_URL}/api/accounts/me/`, {
            headers: { Authorization: `Bearer ${trimmedToken}` },
          }),
          axios.get(`${BASE_URL}/api/products/`, {
            headers: { Authorization: `Bearer ${trimmedToken}` },
          }),
          axios.get(`${BASE_URL}/api/categories/`, {
            headers: { Authorization: `Bearer ${trimmedToken}` },
          }),
          axios.get(`${BASE_URL}/api/recipe-categories/`, {
            headers: { Authorization: `Bearer ${trimmedToken}` },
          }),
          axios.get(`${BASE_URL}/api/recipes/`, {
            headers: { Authorization: `Bearer ${trimmedToken}` },
          }),
          axios.get(`${BASE_URL}/api/orders/carts/`, {
            headers: { Authorization: `Bearer ${trimmedToken}` },
          })
        ]);

        setUser(userResponse.data);
        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data);
        setRecipeCategories(recipeCategoriesResponse.data);
        setRecipes(recipesResponse.data);
        
        const userCart = cartResponse.data[0] || null;
        setCart(userCart);
        
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

  const openRecipeDetail = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const closeRecipeDetail = () => {
    setSelectedRecipe(null);
    setIsDownloading(false);
  };

  // NEW DOWNLOAD FUNCTION - Actually works!
  const handleDownloadRecipe = async () => {
    if (!selectedRecipe) return;

    setIsDownloading(true);

    try {
      // Generate recipe content for download
      const recipeContent = `
${selectedRecipe.title}

${selectedRecipe.description}

PREP TIME: ${selectedRecipe.prep_time} | COOK TIME: ${selectedRecipe.cook_time} | SERVINGS: ${selectedRecipe.servings}

INGREDIENTS:
${selectedRecipe.ingredients.split(',').map(item => `• ${item.trim()}`).join('\n')}

INSTRUCTIONS:
${selectedRecipe.instructions.split('.').filter(Boolean).map((step, index) => `${index + 1}. ${step.trim()}`).join('\n\n')}

Tags: ${selectedRecipe.tags_display?.join(', ') || 'None'}

---
Downloaded from FarmFresh • Enjoy your cooking! 🌿
      `.trim();

      // Create blob and download
      const blob = new Blob([recipeContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedRecipe.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_recipe.txt`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success feedback
      setTimeout(() => {
        // Optional: You could add a toast notification here
        console.log('Recipe downloaded successfully!');
      }, 1000);

    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to download recipe');
    } finally {
      setIsDownloading(false);
    }
  };

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
        const cartItem = cart?.cart_items?.find(item => item.product === product.id);
        if (cartItem) {
          await axios.delete(
            `${BASE_URL}/api/orders/cart-items/${cartItem.id}/`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } else {
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

      const cartResponse = await axios.get(`${BASE_URL}/api/orders/carts/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedCart = cartResponse.data[0] || null;
      setCart(updatedCart);
      
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

  const filteredRecipes = recipes
    .filter((recipe) =>
      (selectedRecipeCategory === 'all' || recipe.category?.id === parseInt(selectedRecipeCategory)) &&
      (recipeSearchQuery === '' ||
        recipe.title.toLowerCase().includes(recipeSearchQuery.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(recipeSearchQuery.toLowerCase()) ||
        recipe.ingredients?.toLowerCase().includes(recipeSearchQuery.toLowerCase()))
    );

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
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-700 text-lg font-medium">Loading your marketplace...</p>
          <p className="text-emerald-500 text-sm mt-2">Getting everything ready for you</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      {/* Header */}
      <header className={`bg-white/95 backdrop-blur-md border-b transition-all duration-300 sticky top-0 z-50 ${
        isScrolled ? 'shadow-lg border-emerald-200' : 'shadow-sm border-emerald-100'
      }`}>
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

              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3 cursor-pointer" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                  <span className="text-white font-bold text-lg">🌿</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    FarmFresh
                  </h1>
                  <p className="text-xs text-emerald-600 hidden sm:block">Organic Marketplace</p>
                </div>
              </motion.div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-emerald-50 transition-all duration-200 group relative"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium text-emerald-700 group-hover:text-emerald-900">
                    {item.label}
                  </span>
                  {item.badge && cartCount > 0 && item.label === 'Shopping Cart' && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg animate-pulse"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4 lg:mx-8">
              <motion.div className="relative" whileFocus={{ scale: 1.02 }}>
                <input
                  type="text"
                  placeholder={activeTab === 'recipes' ? "Search recipes..." : "Search fresh organic products..."}
                  value={activeTab === 'recipes' ? recipeSearchQuery : searchQuery}
                  onChange={(e) => activeTab === 'recipes' ? setRecipeSearchQuery(e.target.value) : setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-emerald-900 placeholder-emerald-400 focus:shadow-lg"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </motion.div>
            </div>

            {/* User Menu & Cart */}
            <div className="flex items-center space-x-3">
              {/* Cart Button - Desktop */}
              <motion.button 
                whileHover={{ scale: 1.1 }}
                onClick={() => navigate('/cart')}
                className="hidden lg:flex items-center space-x-2 relative p-3 hover:bg-emerald-50 rounded-xl transition-all duration-200 group"
              >
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-md">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg animate-pulse"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>

              {/* User Profile with Dropdown */}
              <div className="relative user-menu">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-emerald-50 cursor-pointer transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center text-white font-medium shadow-md group-hover:shadow-lg transition-shadow">
                    {user?.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-emerald-900">{user?.full_name?.split(' ')[0] || 'User'}</p>
                    <p className="text-xs text-emerald-600 truncate max-w-[120px]">{user?.email || ''}</p>
                  </div>
                  <svg 
                    className={`w-4 h-4 text-emerald-600 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-14 w-48 bg-white rounded-xl shadow-lg border border-emerald-100 py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-emerald-100">
                        <p className="text-sm font-medium text-emerald-900">{user?.full_name || 'User'}</p>
                        <p className="text-xs text-emerald-600 truncate">{user?.email || ''}</p>
                      </div>
                      
                      {navItems.map((item) => (
                        <motion.button
                          whileHover={{ x: 5 }}
                          key={item.label}
                          onClick={() => {
                            navigate(item.path);
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-emerald-50 transition-colors"
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-sm text-emerald-700">{item.label}</span>
                          {item.badge && cartCount > 0 && item.label === 'Shopping Cart' && (
                            <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                              {cartCount}
                            </span>
                          )}
                        </motion.button>
                      ))}
                      
                      <div className="border-t border-emerald-100 pt-2">
                        <motion.button
                          whileHover={{ x: 5 }}
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-emerald-50 transition-colors text-red-600"
                        >
                          <span className="text-lg">🚪</span>
                          <span className="text-sm">Logout</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className={`border-b transition-all duration-300 sticky top-16 z-40 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white/80 backdrop-blur-sm'
      } border-emerald-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide pb-2">
            {[
              { id: 'products', label: '🛍️ Products', count: filteredProducts.length, color: 'emerald' },
              { id: 'recipes', label: '👨‍🍳 Recipes', count: filteredRecipes.length, color: 'emerald' } // Unified color to emerald for consistency
            ].map(tab => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap mr-2 rounded-t-xl transition-all duration-300 transform hover:scale-105 ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-500 text-white shadow-lg`
                    : `text-${tab.color}-600 hover:text-${tab.color}-700 hover:bg-${tab.color}-50`
                }`}
              >
                <span className="mr-2 text-base">{tab.label.split(' ')[0]}</span>
                <span className={`bg-white/20 text-xs px-2 py-1 rounded-full ml-2 ${
                  activeTab === tab.id ? 'bg-white/30' : `bg-${tab.color}-100 text-${tab.color}-700`
                }`}>
                  {tab.count}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xl overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <motion.button
                    whileHover={{ x: 5 }}
                    key={item.label}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-emerald-50 transition-all duration-200 active:scale-95"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium text-emerald-900">{item.label}</span>
                    </div>
                    {item.badge && cartCount > 0 && item.label === 'Shopping Cart' && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium shadow-md">
                        {cartCount}
                      </span>
                    )}
                  </motion.button>
                ))}
              </nav>

              {/* Mobile Categories - Enhanced look */}
              <div className="pt-4 border-t border-emerald-100">
                <h3 className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3">
                  {activeTab === 'products' ? 'Categories' : 'Recipe Categories'}
                </h3>
                <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (activeTab === 'products') {
                        setSelectedCategory('all');
                      } else {
                        setSelectedRecipeCategory('all');
                      }
                      setMobileMenuOpen(false);
                    }}
                    className={`flex-shrink-0 px-5 py-3 rounded-full transition-all duration-200 text-sm font-medium shadow-md ${
                      (activeTab === 'products' && selectedCategory === 'all') || (activeTab === 'recipes' && selectedRecipeCategory === 'all')
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                        : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    All {activeTab === 'products' ? 'Products' : 'Recipes'}
                  </motion.button>
                  {(activeTab === 'products' ? categories : recipeCategories).map((category) => (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={category.id}
                      onClick={() => {
                        if (activeTab === 'products') {
                          setSelectedCategory(category.id.toString());
                        } else {
                          setSelectedRecipeCategory(category.id.toString());
                        }
                        setMobileMenuOpen(false);
                      }}
                      className={`flex-shrink-0 px-5 py-3 rounded-full transition-all duration-200 text-sm font-medium shadow-md ${
                        (activeTab === 'products' && selectedCategory === category.id.toString()) ||
                        (activeTab === 'recipes' && selectedRecipeCategory === category.id.toString())
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                          : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      {category.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center lg:text-left"
        >
          <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full mb-4 shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-sm font-medium text-emerald-700">
              {activeTab === 'products' 
                ? `${filteredProducts.length} fresh products available` 
                : `${filteredRecipes.length} delicious recipes waiting`
              }
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-emerald-900 mb-2">
            Good morning, {user?.full_name?.split(' ')[0] || 'there'}! 🌞
          </h1>
          <p className="text-emerald-600 text-lg max-w-2xl">
            {activeTab === 'products' 
              ? 'Discover fresh, organic products from local farmers delivered to your doorstep'
              : 'Explore mouthwatering recipes made with the freshest ingredients from our marketplace'
            }
          </p>
        </motion.div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {(activeTab === 'products' ? [
            { label: 'Cart Items', value: cartCount, icon: '🛒', color: 'emerald', description: 'In your cart' },
            { label: 'Total Products', value: products.length, icon: '🌿', color: 'green', description: 'Available' },
            { label: 'Categories', value: categories.length, icon: '📦', color: 'emerald', description: 'To explore' },
            { label: 'Filtered', value: filteredProducts.length, icon: '✅', color: 'green', description: 'Matching filters' },
          ] : [
            { label: 'Total Recipes', value: recipes.length, icon: '👨‍🍳', color: 'emerald', description: 'In collection' },
            { label: 'Categories', value: recipeCategories.length, icon: '📁', color: 'emerald', description: 'To explore' },
            { label: 'Filtered', value: filteredRecipes.length, icon: '✅', color: 'green', description: 'Matching filters' },
            { label: 'Popular', value: '12+', icon: '🔥', color: 'emerald', description: 'Loved by users' },
          ]).map((stat, index) => (
            <motion.div 
              key={stat.label} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-emerald-900 group-hover:text-emerald-700 transition-colors">
                    {stat.value}
                  </p>
                  <p className="text-xs text-emerald-500 mt-1">{stat.description}</p>
                </div>
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Enhanced category look */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 hidden lg:block"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 sticky top-24 space-y-6">
              
              {/* Categories */}
              <div>
                <h3 className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-4 flex items-center">
                  <span className="mr-2">
                    {activeTab === 'products' ? '🏷️' : '🍽️'}
                  </span>
                  {activeTab === 'products' ? 'Categories' : 'Recipe Categories'}
                </h3>
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => activeTab === 'products' ? setSelectedCategory('all') : setSelectedRecipeCategory('all')}
                    className={`w-full text-left px-5 py-3 rounded-full transition-all duration-200 group shadow-md ${
                      (activeTab === 'products' && selectedCategory === 'all') || (activeTab === 'recipes' && selectedRecipeCategory === 'all')
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white transform scale-105'
                        : 'hover:bg-emerald-50 text-emerald-700 border border-emerald-200 hover:border-emerald-300 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`text-lg transition-transform ${
                        (activeTab === 'products' && selectedCategory === 'all') || (activeTab === 'recipes' && selectedRecipeCategory === 'all')
                          ? 'scale-110'
                          : 'group-hover:scale-110'
                      }`}>
                        {activeTab === 'products' ? '📁' : '📖'}
                      </span>
                      <span className="font-medium">All {activeTab === 'products' ? 'Products' : 'Recipes'}</span>
                    </div>
                  </motion.button>
                  {(activeTab === 'products' ? categories : recipeCategories).map((category) => (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      key={category.id}
                      onClick={() => activeTab === 'products' ? setSelectedCategory(category.id.toString()) : setSelectedRecipeCategory(category.id.toString())}
                      className={`w-full text-left px-5 py-3 rounded-full transition-all duration-200 group shadow-md ${
                        (activeTab === 'products' && selectedCategory === category.id.toString()) ||
                        (activeTab === 'recipes' && selectedRecipeCategory === category.id.toString())
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white transform scale-105'
                          : 'hover:bg-emerald-50 text-emerald-700 border border-emerald-200 hover:border-emerald-300 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`text-lg transition-transform ${
                          (activeTab === 'products' && selectedCategory === category.id.toString()) ||
                          (activeTab === 'recipes' && selectedRecipeCategory === category.id.toString())
                            ? 'scale-110'
                            : 'group-hover:scale-110'
                        }`}>
                          {activeTab === 'products' ? '🏷️' : '🍽️'}
                        </span>
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Sort for Products */}
              {activeTab === 'products' && (
                <div>
                  <h3 className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-4 flex items-center">
                    <span className="mr-2">🔧</span>
                    Sort By
                  </h3>
                  <motion.select
                    whileFocus={{ scale: 1.02 }}
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full p-4 border border-emerald-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-emerald-900 shadow-sm hover:shadow-md"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </motion.select>
                </div>
              )}

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="w-full p-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-3 group hover:shadow-md active:scale-95"
              >
                <span className="group-hover:scale-110 transition-transform text-lg">🚪</span>
                <span>Logout</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Products Content */}
          {activeTab === 'products' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-emerald-900 mb-2">Fresh Organic Products</h2>
                  <p className="text-emerald-600 text-lg">
                    {filteredProducts.length} products found
                    {searchQuery && ` for "${searchQuery}"`}
                    {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === parseInt(selectedCategory))?.name}`}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-white rounded-2xl p-1 border border-emerald-200 shadow-sm">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setActiveView('grid')} 
                      className={`p-3 rounded-xl transition-all duration-200 ${
                        activeView === 'grid' 
                          ? 'bg-emerald-100 text-emerald-600 shadow-sm' 
                          : 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setActiveView('list')} 
                      className={`p-3 rounded-xl transition-all duration-200 ${
                        activeView === 'list' 
                          ? 'bg-emerald-100 text-emerald-600 shadow-sm' 
                          : 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </motion.button>
                  </div>

                  {(searchQuery || selectedCategory !== 'all') && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 hover:shadow-md active:scale-95"
                    >
                      <span>Clear filters</span>
                      <span className="text-lg">×</span>
                    </motion.button>
                  )}
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-12 text-center"
                >
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🔍</span>
                  </div>
                  <h3 className="text-xl font-semibold text-emerald-900 mb-2">No products found</h3>
                  <p className="text-emerald-600 mb-6 max-w-md mx-auto">
                    {searchQuery 
                      ? `We couldn't find any products matching "${searchQuery}"` 
                      : 'Try selecting a different category or clearing your filters'
                    }
                  </p>
                  {(searchQuery || selectedCategory !== 'all') && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95"
                    >
                      Clear all filters
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                <div className={`grid gap-6 ${activeView === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                  {filteredProducts.map((product, index) => {
                    const quantityInCart = cartQuantities[product.id] || 0;
                    const isAdding = addingToCart[product.id];
                    const category = categories.find(c => c.id === product.category);

                    return (
                      <motion.div 
                        key={product.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-2xl shadow-sm border border-emerald-100 hover:shadow-xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-1"
                      >
                        <div className="relative w-full h-48">
                          <img
                            src={product.images?.[0]?.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-emerald-700 text-xs font-medium rounded-lg shadow-sm">
                              {category?.name || 'Organic'}
                            </span>
                          </div>
                          {quantityInCart > 0 && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-3 right-3"
                            >
                              <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-lg shadow-lg animate-pulse">
                                In Cart: {quantityInCart}
                              </span>
                            </motion.div>
                          )}
                        </div>

                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold text-emerald-900 line-clamp-2 group-hover:text-emerald-700 transition-colors flex-1">
                              {product.name}
                            </h3>
                            <p className="text-2xl font-bold text-emerald-600 ml-4 whitespace-nowrap">
                              KSh {formatPrice(product.price)}
                            </p>
                          </div>

                          <p className="text-emerald-600 text-sm mb-4 line-clamp-2">
                            {product.description || 'Fresh organic product from local farmers'}
                          </p>

                          <div className="flex items-center justify-between">
                            {quantityInCart > 0 ? (
                              <div className="flex items-center space-x-3">
                                <motion.button 
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => removeFromCart(product)} 
                                  disabled={isAdding} 
                                  className="w-12 h-12 bg-emerald-100 hover:bg-emerald-200 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 group active:scale-95"
                                >
                                  <svg className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                  </svg>
                                </motion.button>
                                <span className="text-lg font-semibold text-emerald-900 min-w-8 text-center">
                                  {quantityInCart}
                                </span>
                                <motion.button 
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => addToCart(product)} 
                                  disabled={isAdding} 
                                  className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 group active:scale-95"
                                >
                                  {isAdding ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                  )}
                                </motion.button>
                              </div>
                            ) : (
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => addToCart(product)} 
                                disabled={isAdding} 
                                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95"
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
                              </motion.button>
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
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Recipes Content - Unified theme with products (emerald colors, similar card structure, add to cart-like "View Recipe" but themed as add) */}
          {activeTab === 'recipes' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-emerald-900 mb-2">Fresh Recipe Ideas</h2>
                  <p className="text-emerald-600 text-lg">
                    {filteredRecipes.length} recipes found
                    {recipeSearchQuery && ` for "${recipeSearchQuery}"`}
                    {selectedRecipeCategory !== 'all' && ` in ${recipeCategories.find(c => c.id === parseInt(selectedRecipeCategory))?.name}`}
                  </p>
                </div>
                
                {(recipeSearchQuery || selectedRecipeCategory !== 'all') && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setRecipeSearchQuery('');
                      setSelectedRecipeCategory('all');
                    }}
                    className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 hover:shadow-md active:scale-95"
                  >
                    <span>Clear filters</span>
                    <span className="text-lg">×</span>
                  </motion.button>
                )}
              </div>

              {filteredRecipes.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-12 text-center"
                >
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🔍</span>
                  </div>
                  <h3 className="text-xl font-semibold text-emerald-900 mb-2">No recipes found</h3>
                  <p className="text-emerald-600 mb-6 max-w-md mx-auto">
                    {recipeSearchQuery 
                      ? `We couldn't find any recipes matching "${recipeSearchQuery}"` 
                      : 'Try selecting a different category or clearing your filters'
                    }
                  </p>
                  {(recipeSearchQuery || selectedRecipeCategory !== 'all') && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setRecipeSearchQuery('');
                        setSelectedRecipeCategory('all');
                      }}
                      className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95"
                    >
                      Clear all filters
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                <div className={`grid gap-6 ${activeView === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                  {filteredRecipes.map((recipe, index) => {
                    const category = recipe.category;
                    const tags = recipe.tags_display || [];

                    return (
                      <motion.div 
                        key={recipe.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-2xl shadow-sm border border-emerald-100 hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1"
                        onClick={() => openRecipeDetail(recipe)}
                      >
                        {/* Recipe Image */}
                        <div className="relative w-full h-48">
                          <img
                            src={recipe.image_url || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                            alt={recipe.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-emerald-700 text-xs font-medium rounded-lg shadow-sm">
                              {category?.name || 'Recipe'}
                            </span>
                          </div>
                          <div className="absolute top-3 right-3 flex space-x-1">
                            <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-lg shadow-lg">
                              ⭐ {recipe.review || '4.8'}
                            </span>
                          </div>
                        </div>

                        {/* Recipe Info */}
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold text-emerald-900 line-clamp-2 group-hover:text-emerald-700 transition-colors flex-1">
                              {recipe.title}
                            </h3>
                          </div>
                          
                          <p className="text-emerald-600 text-sm mb-4 line-clamp-2">
                            {recipe.description || 'Delicious recipe made with fresh ingredients'}
                          </p>

                          {/* Times & Servings */}
                          <div className="flex justify-between items-center mb-4 text-sm">
                            <div className="flex items-center space-x-4 text-emerald-700">
                              <span className="flex items-center space-x-1">
                                <span>⏱️</span>
                                <span>{recipe.prep_time}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <span>🔥</span>
                                <span>{recipe.cook_time}</span>
                              </span>
                            </div>
                            <span className="text-emerald-600 flex items-center space-x-1">
                              <span>👥</span>
                              <span>{recipe.servings}</span>
                            </span>
                          </div>

                          {/* Tags */}
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {tags.slice(0, 3).map(tag => (
                                <span key={tag} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                                  {tag}
                                </span>
                              ))}
                              {tags.length > 3 && (
                                <span className="text-xs text-gray-500">+{tags.length - 3}</span>
                              )}
                            </div>
                          )}

                          {/* Action Button - Themed like add to cart */}
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 group"
                          >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>View Recipe</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Recipe Detail Modal - UPDATED WITH NEW DOWNLOAD BUTTON */}
      <AnimatePresence>
        {selectedRecipe && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={closeRecipeDetail}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-emerald-900">{selectedRecipe.title}</h2>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closeRecipeDetail} 
                    className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 active:scale-95"
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Image */}
                {selectedRecipe.image_url && (
                  <img
                    src={selectedRecipe.image_url}
                    alt={selectedRecipe.title}
                    className="w-full h-64 object-cover rounded-xl shadow-sm"
                  />
                )}

                {/* Meta */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-2 p-3 bg-emerald-50 rounded-lg"
                  >
                    <span className="text-emerald-600">⏱️</span>
                    <div>
                      <p className="text-gray-500 text-xs">Prep Time</p>
                      <p className="text-emerald-700 font-medium">{selectedRecipe.prep_time}</p>
                    </div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-2 p-3 bg-emerald-50 rounded-lg"
                  >
                    <span className="text-emerald-600">🔥</span>
                    <div>
                      <p className="text-gray-500 text-xs">Cook Time</p>
                      <p className="text-emerald-700 font-medium">{selectedRecipe.cook_time}</p>
                    </div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-2 p-3 bg-emerald-50 rounded-lg"
                  >
                    <span className="text-emerald-600">👥</span>
                    <div>
                      <p className="text-gray-500 text-xs">Servings</p>
                      <p className="text-emerald-700 font-medium">{selectedRecipe.servings}</p>
                    </div>
                  </motion.div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-emerald-900 mb-3 flex items-center">
                    <span className="mr-2">📝</span>
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{selectedRecipe.description}</p>
                </div>

                {/* Ingredients */}
                <div>
                  <h3 className="text-lg font-semibold text-emerald-900 mb-3 flex items-center">
                    <span className="mr-2">🥕</span>
                    Ingredients
                  </h3>
                  <div className="space-y-2">
                    {selectedRecipe.ingredients.split(',').map((ingredient, index) => (
                      <motion.div 
                        key={index} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center space-x-3 p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></span>
                        <span className="text-gray-700">{ingredient.trim()}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="text-lg font-semibold text-emerald-900 mb-3 flex items-center">
                    <span className="mr-2">👨‍🍳</span>
                    Instructions
                  </h3>
                  <div className="space-y-3">
                    {selectedRecipe.instructions.split('.').filter(Boolean).map((step, index) => (
                      <motion.div 
                        key={index} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start space-x-3 p-3 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0 mt-1">
                          {index + 1}
                        </span>
                        <p className="text-gray-700 leading-relaxed">{step.trim()}.</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {selectedRecipe.tags_display?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-900 mb-3 flex items-center">
                      <span className="mr-2">🏷️</span>
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe.tags_display.map((tag, index) => (
                        <motion.span 
                          key={tag} 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full"
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* NEW DOWNLOAD BUTTON - Enhanced UX/UI */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-6 border-t border-emerald-100"
                >
                  <motion.button 
                    whileHover={!isDownloading ? { scale: 1.02 } : {}}
                    whileTap={!isDownloading ? { scale: 0.98 } : {}}
                    onClick={handleDownloadRecipe}
                    disabled={isDownloading}
                    className="w-full group relative overflow-hidden py-4 px-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {/* Background shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    <div className="relative flex items-center justify-center space-x-3">
                      {/* Download Icon */}
                      <motion.svg 
                        className="w-6 h-6 flex-shrink-0"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        initial={false}
                        animate={{ 
                          rotate: isDownloading ? 360 : 0 
                        }}
                        transition={{ 
                          rotate: { duration: 1, repeat: Infinity, ease: "linear" }
                        }}
                      >
                        {isDownloading ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        )}
                      </motion.svg>
                      
                      {/* Text */}
                      <span className="relative">
                        {isDownloading ? (
                          <>
                            <motion.span 
                              initial={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              animate={{ opacity: isDownloading ? 0 : 1 }}
                              className="absolute inset-0"
                            >
                              📥 Download Recipe
                            </motion.span>
                            <motion.span 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: isDownloading ? 1 : 0 }}
                              className="absolute inset-0"
                            >
                              Saving to Downloads...
                            </motion.span>
                          </>
                        ) : (
                          '📥 Download Recipe'
                        )}
                      </span>
                      
                      {/* Progress indicator */}
                      {isDownloading && (
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 2 }}
                          className="absolute bottom-0 left-0 h-1 bg-white/50 rounded-full"
                        />
                      )}
                    </div>
                    
                    {/* Success checkmark */}
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={isDownloading ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                      transition={{ delay: 2 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-xl">✅</span>
                      </div>
                    </motion.div>
                  </motion.button>
                  
                  {/* Download info */}
                  <motion.p 
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center text-emerald-700 text-sm mt-3 flex items-center justify-center space-x-1"
                  >
                    <span className="text-xs">💾</span>
                    <span>Saves as .txt file to your Downloads folder</span>
                  </motion.p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white border-t border-emerald-100 mt-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">🌿</span>
              </div>
              <span className="text-lg font-bold text-emerald-900">FarmFresh</span>
            </div>
            <p className="text-emerald-600 text-sm">
              Fresh organic products delivered to your doorstep • Made with ❤️ for food lovers
            </p>
          </div>
        </div>
      </motion.footer>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;