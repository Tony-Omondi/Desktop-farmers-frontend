import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

const ClientHeader = ({ 
  user, cartCount, activeTab, setActiveTab, searchQuery, recipeSearchQuery, 
  setSearchQuery, setRecipeSearchQuery, mobileMenuOpen, setMobileMenuOpen, 
  navigate, handleLogout, filteredProducts, filteredRecipes 
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const headerRef = useRef(null);

  const navItems = [
    { icon: '👤', label: 'Profile', path: '/profile' },
    { icon: '📦', label: 'My Orders', path: '/orders' },
    { icon: '💳', label: 'Payments', path: '/payments' },
    { icon: '🛒', label: 'Shopping Cart', path: '/cart', badge: true },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);
    };

    // Throttle scroll events
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleSearchChange = (value) => {
    if (activeTab === 'recipes') {
      setRecipeSearchQuery(value);
    } else {
      setSearchQuery(value);
    }
  };

  const getSearchPlaceholder = () => {
    if (searchFocused) {
      return activeTab === 'recipes' 
        ? "Search recipes by name, ingredients..." 
        : "Search products by name, category...";
    }
    return activeTab === 'recipes' 
      ? "🔍 Search recipes..." 
      : "🔍 Search fresh organic products...";
  };

  return (
    <>
      <header 
        ref={headerRef}
        className={`bg-white/95 backdrop-blur-xl border-b transition-all duration-500 ease-out sticky top-0 z-50 w-full ${
          isScrolled 
            ? 'shadow-2xl border-emerald-200/80' 
            : 'shadow-md border-emerald-100/60'
        }`}
      >
        {/* REMOVED: max-w-7xl mx-auto - Using full width with padding instead */}
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20 w-full">
            {/* Logo & Mobile Menu */}
            <div className="flex items-center space-x-3 lg:space-x-4 flex-shrink-0">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl hover:bg-emerald-50 active:bg-emerald-100 transition-all duration-200"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </motion.button>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-3 cursor-pointer group" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-white text-xl">🌿</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    FarmFresh
                  </h1>
                  <p className="text-xs text-emerald-600/80 font-medium">Organic Marketplace</p>
                </div>
              </motion.div>
            </div>

            {/* Desktop Navigation - Hidden on mobile */}
            <nav className="hidden lg:flex items-center space-x-1 flex-shrink-0">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -2,
                    backgroundColor: 'rgba(16, 185, 129, 0.1)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(item.path)}
                  className="flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 group relative"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </span>
                  <span className="font-semibold text-emerald-700 group-hover:text-emerald-900 whitespace-nowrap">
                    {item.label}
                  </span>
                  {item.badge && cartCount > 0 && item.label === 'Shopping Cart' && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium shadow-lg"
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </nav>

            {/* Search Bar - Responsive */}
            <div className="flex-1 max-w-2xl mx-3 lg:mx-6 xl:mx-8 min-w-0">
              <motion.div 
                className="relative"
                animate={searchFocused ? { scale: 1.02 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <input
                  type="text"
                  placeholder={getSearchPlaceholder()}
                  value={activeTab === 'recipes' ? recipeSearchQuery : searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 transition-all duration-300 text-emerald-900 placeholder-emerald-400/70 focus:shadow-lg shadow-sm text-sm lg:text-base"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <motion.svg 
                    animate={searchFocused ? { scale: 1.1 } : { scale: 1 }}
                    className="w-5 h-5 text-emerald-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </motion.svg>
                </div>
                
                {/* Search results indicator */}
                {(searchQuery || recipeSearchQuery) && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                      {activeTab === 'recipes' ? filteredRecipes?.length : filteredProducts?.length} found
                    </span>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* User Menu & Cart */}
            <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
              {/* Mobile Cart Button */}
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/cart')}
                className="lg:hidden relative p-2.5 hover:bg-emerald-50 rounded-xl transition-all duration-200"
                aria-label="Shopping cart"
              >
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Desktop Cart Button */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/cart')}
                className="hidden lg:flex items-center space-x-2 relative p-3 hover:bg-emerald-50 rounded-xl transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium shadow-lg"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </motion.button>

              {/* User Menu */}
              <div className="relative user-menu">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 lg:space-x-3 p-2 rounded-xl hover:bg-emerald-50 cursor-pointer transition-all duration-200 group border border-transparent hover:border-emerald-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center text-white font-semibold shadow-md group-hover:shadow-lg transition-all duration-200">
                    {user?.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:block text-left min-w-0">
                    <p className="text-sm font-semibold text-emerald-900 truncate max-w-[100px] lg:max-w-[120px]">
                      {user?.full_name?.split(' ')[0] || 'User'}
                    </p>
                    <p className="text-xs text-emerald-600/80 truncate max-w-[100px] lg:max-w-[120px]">
                      {user?.email || ''}
                    </p>
                  </div>
                  <motion.svg 
                    animate={{ rotate: userMenuOpen ? 180 : 0 }}
                    className="w-4 h-4 text-emerald-600 transition-transform duration-200" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      className="absolute right-0 top-14 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-100/50 py-2 z-50"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-emerald-100/50">
                        <p className="text-sm font-semibold text-emerald-900 truncate">
                          {user?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-emerald-600/80 truncate mt-1">
                          {user?.email || ''}
                        </p>
                      </div>
                      
                      {/* Navigation Items */}
                      <div className="py-1">
                        {navItems.map((item, index) => (
                          <motion.button
                            key={item.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ x: 5, backgroundColor: 'rgba(16, 185, 129, 0.08)' }}
                            onClick={() => {
                              navigate(item.path);
                              setUserMenuOpen(false);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-200 rounded-lg mx-2"
                          >
                            <span className="text-lg">{item.icon}</span>
                            <span className="text-sm font-medium text-emerald-700 flex-1">
                              {item.label}
                            </span>
                            {item.badge && cartCount > 0 && item.label === 'Shopping Cart' && (
                              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                {cartCount}
                              </span>
                            )}
                          </motion.button>
                        ))}
                      </div>
                      
                      {/* Logout */}
                      <div className="border-t border-emerald-100/50 pt-1">
                        <motion.button
                          whileHover={{ x: 5, backgroundColor: 'rgba(239, 68, 68, 0.08)' }}
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-200 rounded-lg mx-2 text-red-600 hover:text-red-700"
                        >
                          <span className="text-lg">🚪</span>
                          <span className="text-sm font-medium">Logout</span>
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

      {/* Enhanced Tabs Section - ALSO FIXED TO FULL WIDTH */}
      <div className={`border-b transition-all duration-500 ease-out sticky top-16 lg:top-20 z-40 w-full ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-lg border-emerald-200/60' 
          : 'bg-white/90 backdrop-blur-lg shadow-sm border-emerald-100/50'
      }`}>
        {/* REMOVED: max-w-7xl mx-auto - Using full width with padding instead */}
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent pb-2">
            {[
              { 
                id: 'products', 
                label: '🛍️ Products', 
                count: filteredProducts?.length || 0, 
                icon: '🛍️',
                description: 'Fresh organic products'
              },
              { 
                id: 'recipes', 
                label: '👨‍🍳 Recipes', 
                count: filteredRecipes?.length || 0, 
                icon: '👨‍🍳',
                description: 'Delicious recipes'
              }
            ].map((tab, index) => (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, type: "spring" }}
                whileHover={{ 
                  scale: 1.03, 
                  y: -2,
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`group relative flex items-center px-6 lg:px-8 py-4 lg:py-5 text-sm lg:text-base font-bold whitespace-nowrap mr-3 lg:mr-4 rounded-2xl transition-all duration-300 overflow-hidden flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-500 text-white shadow-xl'
                    : 'bg-white/80 backdrop-blur-md text-emerald-700 border border-emerald-200/60 shadow-lg hover:shadow-xl hover:border-emerald-300'
                }`}
              >
                {/* Background Shine Effect */}
                {activeTab === tab.id && (
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: [-100, 100] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                  />
                )}
                
                {/* Content */}
                <div className="relative z-10 flex items-center space-x-3">
                  <motion.span 
                    className="text-lg lg:text-xl group-hover:scale-110 transition-transform duration-300"
                    animate={activeTab === tab.id ? { scale: 1.1 } : { scale: 1 }}
                  >
                    {tab.icon}
                  </motion.span>
                  
                  <div className="text-left">
                    <div className="font-bold">
                      {tab.label.split(' ')[1]}
                    </div>
                    <div className="text-xs opacity-80 font-normal hidden lg:block">
                      {tab.description}
                    </div>
                  </div>
                  
                  {/* Count Badge */}
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-lg transition-all duration-300 ${
                      activeTab === tab.id 
                        ? 'bg-white/30 backdrop-blur-sm text-white border border-white/30' 
                        : 'bg-emerald-100/80 backdrop-blur-sm text-emerald-700 border border-emerald-200/50'
                    }`}
                  >
                    {tab.count || 0}
                  </motion.span>
                </div>

                {/* Active Indicator */}
                {activeTab === tab.id && (
                  <motion.div 
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-white/60 rounded-t-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.1 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientHeader;