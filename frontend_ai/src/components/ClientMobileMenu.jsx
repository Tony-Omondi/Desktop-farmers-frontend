import { motion, AnimatePresence } from 'framer-motion';

const ClientMobileMenu = ({ 
  mobileMenuOpen, cartCount, activeTab, selectedCategory, 
  selectedRecipeCategory, categories, recipeCategories, navigate, 
  setMobileMenuOpen, setSelectedCategory, setSelectedRecipeCategory 
}) => (
  <AnimatePresence>
    {mobileMenuOpen && (
      <>
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Menu panel */}
        <motion.div 
          initial={{ height: 0, opacity: 0, y: -20 }}
          animate={{ height: 'auto', opacity: 1, y: 0 }}
          exit={{ height: 0, opacity: 0, y: -20 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-emerald-100/50 shadow-2xl z-50 overflow-hidden"
        >
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-emerald-100/50">
            <h2 className="text-lg font-bold text-emerald-900">Menu</h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full hover:bg-emerald-50 transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>

          <div className="max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-4 space-y-6">
              {/* Main navigation */}
              <nav className="space-y-1">
                {[
                  { icon: '👤', label: 'Profile', path: '/profile' },
                  { icon: '📦', label: 'My Orders', path: '/orders' },
                  { icon: '💳', label: 'Payments', path: '/payments' },
                  { icon: '🛒', label: 'Shopping Cart', path: '/cart', badge: true },
                ].map((item, index) => (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 8, backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                    whileTap={{ scale: 0.98 }}
                    key={item.label}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                        {item.icon}
                      </span>
                      <span className="font-semibold text-emerald-900 group-hover:text-emerald-700">
                        {item.label}
                      </span>
                    </div>
                    {item.badge && cartCount > 0 && item.label === 'Shopping Cart' && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium shadow-lg"
                      >
                        {cartCount > 99 ? '99+' : cartCount}
                      </motion.span>
                    )}
                  </motion.button>
                ))}
              </nav>

              {/* Categories section */}
              <div className="pt-4 border-t border-emerald-100/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider">
                    {activeTab === 'products' ? 'Product Categories' : 'Recipe Categories'}
                  </h3>
                  <span className="text-xs text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                    {(activeTab === 'products' ? categories : recipeCategories).length}
                  </span>
                </div>
                
                {/* All categories button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (activeTab === 'products') {
                      setSelectedCategory('all');
                    } else {
                      setSelectedRecipeCategory('all');
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full mb-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold shadow-sm ${
                    (activeTab === 'products' && selectedCategory === 'all') || 
                    (activeTab === 'recipes' && selectedRecipeCategory === 'all')
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg'
                      : 'bg-white text-emerald-700 border border-emerald-200/80 hover:bg-emerald-50 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>🎯</span>
                    <span>All {activeTab === 'products' ? 'Products' : 'Recipes'}</span>
                  </div>
                </motion.button>

                {/* Categories grid */}
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent">
                  {(activeTab === 'products' ? categories : recipeCategories).map((category, index) => (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + (index * 0.05) }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      key={category.id}
                      onClick={() => {
                        if (activeTab === 'products') {
                          setSelectedCategory(category.id.toString());
                        } else {
                          setSelectedRecipeCategory(category.id.toString());
                        }
                        setMobileMenuOpen(false);
                      }}
                      className={`p-3 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm border ${
                        (activeTab === 'products' && selectedCategory === category.id.toString()) ||
                        (activeTab === 'recipes' && selectedRecipeCategory === category.id.toString())
                          ? 'bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-lg border-emerald-600'
                          : 'bg-white text-emerald-700 border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200'
                      }`}
                    >
                      <span className="line-clamp-2 text-center block">
                        {category.name}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Current selection indicator */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-2 border-t border-emerald-100/50"
              >
                <p className="text-xs text-emerald-600 text-center">
                  Currently viewing: <span className="font-semibold">
                    {activeTab === 'products' 
                      ? (selectedCategory === 'all' ? 'All Products' : 
                         categories.find(c => c.id.toString() === selectedCategory)?.name)
                      : (selectedRecipeCategory === 'all' ? 'All Recipes' :
                         recipeCategories.find(c => c.id.toString() === selectedRecipeCategory)?.name)
                    }
                  </span>
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default ClientMobileMenu;