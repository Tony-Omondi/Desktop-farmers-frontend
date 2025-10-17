import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const ClientSidebar = ({ 
  activeTab, selectedCategory, setSelectedCategory, selectedRecipeCategory, 
  setSelectedRecipeCategory, categories, recipeCategories, sortOption, 
  setSortOption, handleLogout, user
}) => {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    sort: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const currentCategories = activeTab === 'products' ? categories : recipeCategories;
  const currentSelection = activeTab === 'products' ? selectedCategory : selectedRecipeCategory;
  const setCurrentSelection = activeTab === 'products' ? setSelectedCategory : setSelectedRecipeCategory;

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)', icon: '🔤' },
    { value: 'price-low', label: 'Price: Low to High', icon: '📈' },
    { value: 'price-high', label: 'Price: High to Low', icon: '📉' },
    ...(activeTab === 'recipes' ? [
      { value: 'difficulty', label: 'Difficulty', icon: '⚡' },
      { value: 'cooking-time', label: 'Cooking Time', icon: '⏱️' }
    ] : [])
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", damping: 25 }}
      className="lg:col-span-1 hidden lg:block"
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-emerald-100/50 p-6 sticky top-28 space-y-6">
        
        {/* Categories Section */}
        <motion.section 
          className="bg-gradient-to-br from-emerald-50/50 to-green-50/30 rounded-2xl p-1"
          whileHover={{ scale: 1.005 }}
        >
          <motion.button
            onClick={() => toggleSection('categories')}
            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/50 transition-all duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">
                  {activeTab === 'products' ? '🏷️' : '🍽️'}
                </span>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-emerald-900 text-sm uppercase tracking-wide">
                  {activeTab === 'products' ? 'Product Categories' : 'Recipe Categories'}
                </h3>
                <p className="text-xs text-emerald-600/80 mt-1">
                  {currentCategories.length} categories available
                </p>
              </div>
            </div>
            <motion.svg
              animate={{ rotate: expandedSections.categories ? 180 : 0 }}
              className="w-5 h-5 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </motion.button>

          <AnimatePresence>
            {expandedSections.categories && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="px-2 pb-2"
              >
                {/* All Categories Button */}
                <motion.button
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentSelection('all')}
                  className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 group mb-3 ${
                    currentSelection === 'all'
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-2xl shadow-emerald-500/25'
                      : 'bg-white/80 text-emerald-700 hover:bg-white hover:shadow-lg border border-emerald-100/50'
                  }`}
                >
                  <motion.span
                    animate={currentSelection === 'all' ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
                    className="text-xl"
                  >
                    {activeTab === 'products' ? '📦' : '📚'}
                  </motion.span>
                  <div className="flex-1 text-left">
                    <span className="font-semibold text-sm">
                      All {activeTab === 'products' ? 'Products' : 'Recipes'}
                    </span>
                    <p className="text-xs opacity-80 mt-1">
                      Browse all items
                    </p>
                  </div>
                  {currentSelection === 'all' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </motion.button>

                {/* Categories List */}
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent">
                  {currentCategories.map((category, index) => (
                    <motion.button
                      key={category.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01, x: 3 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setCurrentSelection(category.id.toString())}
                      className={`w-full flex items-center space-x-4 p-3 rounded-xl transition-all duration-300 group ${
                        currentSelection === category.id.toString()
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25'
                          : 'bg-white/50 text-emerald-700 hover:bg-white hover:shadow-md border border-emerald-100/30'
                      }`}
                    >
                      <motion.span
                        animate={currentSelection === category.id.toString() ? { scale: 1.1 } : { scale: 1 }}
                        className="text-lg"
                      >
                        {activeTab === 'products' ? '🏷️' : '🍽️'}
                      </motion.span>
                      <div className="flex-1 text-left min-w-0">
                        <span className="font-medium text-sm truncate block">
                          {category.name}
                        </span>
                        <p className="text-xs opacity-70 mt-0.5 truncate">
                          {category.description || `${category.name} items`}
                        </p>
                      </div>
                      {currentSelection === category.id.toString() && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-white rounded-full flex-shrink-0"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Sort Section - UPDATED: Changed from blue to emerald theme */}
        <AnimatePresence>
          {(activeTab === 'products' || activeTab === 'recipes') && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-gradient-to-br from-emerald-50/50 to-green-50/30 rounded-2xl p-1"
            >
              <motion.button
                onClick={() => toggleSection('sort')}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/50 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg">🔧</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-emerald-900 text-sm uppercase tracking-wide">
                      Sort & Filter
                    </h3>
                    <p className="text-xs text-emerald-600/80 mt-1">
                      Organize your view
                    </p>
                  </div>
                </div>
                <motion.svg
                  animate={{ rotate: expandedSections.sort ? 180 : 0 }}
                  className="w-5 h-5 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </motion.button>

              <AnimatePresence>
                {expandedSections.sort && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-2 pb-2 space-y-3"
                  >
                    {/* Sort Options */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wide block">
                        Sort By
                      </label>
                      <div className="space-y-2">
                        {sortOptions.map((option) => (
                          <motion.button
                            key={option.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSortOption(option.value)}
                            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group ${
                              sortOption === option.value
                                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg'
                                : 'bg-white/80 text-emerald-700 hover:bg-white hover:shadow-md border border-emerald-100/50'
                            }`}
                          >
                            <span className="text-lg group-hover:scale-110 transition-transform">
                              {option.icon}
                            </span>
                            <span className="font-medium text-sm flex-1 text-left">
                              {option.label}
                            </span>
                            {sortOption === option.value && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-2 h-2 bg-white rounded-full"
                              />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Additional Filters */}
                    <motion.div 
                      className="pt-2 border-t border-emerald-100/50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <button className="w-full flex items-center justify-center space-x-2 p-3 text-emerald-600 hover:text-emerald-700 hover:bg-white/50 rounded-xl transition-all duration-200 group">
                        <span className="text-lg group-hover:scale-110 transition-transform">
                          🎚️
                        </span>
                        <span className="font-medium text-sm">
                          More Filters
                        </span>
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Logout Button */}
        <motion.button
          whileHover={{ 
            scale: 1.02,
            backgroundColor: 'rgba(254, 226, 226, 0.8)'
          }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-3 p-4 bg-red-50/80 hover:bg-red-100 text-red-700 rounded-2xl font-semibold transition-all duration-300 group border border-red-200/50 hover:border-red-300 hover:shadow-lg active:scale-95"
        >
          <motion.span
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="text-xl"
          >
            🚪
          </motion.span>
          <span>Sign Out</span>
          {user && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="text-xs opacity-70"
            >
              {user?.full_name?.split(' ')[0] || 'User'}
            </motion.span>
          )}
        </motion.button>

        {/* Current Selection Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pt-4 border-t border-emerald-100/50"
        >
          <p className="text-xs text-emerald-600/70">
            Viewing: <span className="font-semibold">
              {currentSelection === 'all' 
                ? `All ${activeTab === 'products' ? 'Products' : 'Recipes'}`
                : currentCategories.find(c => c.id.toString() === currentSelection)?.name
              }
            </span>
          </p>
          <p className="text-xs text-emerald-500/60 mt-1">
            Sorted by {sortOptions.find(opt => opt.value === sortOption)?.label.toLowerCase()}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ClientSidebar;