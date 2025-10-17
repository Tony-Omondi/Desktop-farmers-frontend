import { motion } from 'framer-motion';

const ClientProductsScreen = ({ 
  filteredProducts, activeView, setActiveView, searchQuery, 
  selectedCategory, categories, cartQuantities, addingToCart, 
  addToCart, removeFromCart, formatPrice 
}) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="lg:col-span-3"
  >
    {/* Header Section */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
      <div className="flex-1 min-w-0">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-900 mb-2">Fresh Organic Products</h2>
        <p className="text-emerald-600 text-sm sm:text-base lg:text-lg">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          {searchQuery && (
            <span className="text-emerald-700 font-medium"> for "{searchQuery}"</span>
          )}
          {selectedCategory !== 'all' && (
            <span className="text-emerald-700 font-medium"> in {categories.find(c => c.id === parseInt(selectedCategory))?.name}</span>
          )}
        </p>
      </div>
      
      <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
        {/* View Toggle */}
        <div className="flex items-center space-x-1 bg-white rounded-xl sm:rounded-2xl p-1 border border-emerald-200 shadow-sm">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveView('grid')} 
            className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200 ${
              activeView === 'grid' 
                ? 'bg-emerald-100 text-emerald-600 shadow-sm' 
                : 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
            aria-label="Grid view"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveView('list')} 
            className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200 ${
              activeView === 'list' 
                ? 'bg-emerald-100 text-emerald-600 shadow-sm' 
                : 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
            aria-label="List view"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>
        </div>

        {/* Clear Filters Button */}
        {(searchQuery || selectedCategory !== 'all') && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // Clear handled in parent
            }}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 flex items-center space-x-1 sm:space-x-2 hover:shadow-md active:scale-95 whitespace-nowrap"
          >
            <span>Clear</span>
            <span className="text-sm sm:text-base">×</span>
          </motion.button>
        )}
      </div>
    </div>

    {/* Products Grid/List */}
    {filteredProducts.length === 0 ? (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 sm:p-8 lg:p-12 text-center"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <span className="text-2xl sm:text-3xl lg:text-4xl">🔍</span>
        </div>
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-emerald-900 mb-2">No products found</h3>
        <p className="text-emerald-600 text-sm sm:text-base mb-4 sm:mb-6 max-w-md mx-auto">
          {searchQuery 
            ? `We couldn't find any products matching "${searchQuery}"` 
            : 'Try selecting a different category or clearing your filters'
          }
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Browse All Products
        </motion.button>
      </motion.div>
    ) : (
      <div className={`
        grid gap-4 sm:gap-6 
        ${activeView === 'grid' 
          ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3'  // 2 columns on mobile, 2 on tablet, 3 on desktop
          : 'grid-cols-1'
        }
      `}>
        {filteredProducts.map((product, index) => {
          const quantityInCart = cartQuantities[product.id] || 0;
          const isAdding = addingToCart[product.id];
          const category = categories.find(c => c.id === product.category);

          return (
            <motion.div 
              key={product.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`
                bg-white rounded-xl sm:rounded-2xl shadow-sm border border-emerald-100 hover:shadow-lg transition-all duration-300 overflow-hidden group 
                ${activeView === 'grid' 
                  ? 'transform hover:-translate-y-1' 
                  : 'flex flex-col sm:flex-row'
                }
              `}
            >
              {/* Product Image */}
              <div className={`
                relative ${activeView === 'grid' 
                  ? 'w-full h-32 sm:h-40 md:h-48' 
                  : 'w-full sm:w-48 md:w-56 h-48 sm:h-auto'
                }
              `}>
                <img
                  src={product.images?.[0]?.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                  alt={product.name}
                  className={`
                    w-full h-full object-cover group-hover:scale-105 transition-transform duration-300
                    ${activeView === 'list' ? 'sm:rounded-l-2xl' : ''}
                  `}
                />
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                  <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-emerald-700 text-xs font-medium rounded-lg shadow-sm">
                    {category?.name || 'Organic'}
                  </span>
                </div>
                {quantityInCart > 0 && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3"
                  >
                    <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded-lg shadow-lg">
                      {quantityInCart} in cart
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Product Content */}
              <div className={`
                p-4 sm:p-6 flex-1 
                ${activeView === 'list' ? 'flex flex-col justify-between' : ''}
              `}>
                <div className={`${activeView === 'list' ? 'flex items-start justify-between mb-4' : 'mb-3'}`}>
                  <div className="flex-1 min-w-0">
                    <h3 className={`
                      font-semibold text-emerald-900 line-clamp-2 group-hover:text-emerald-700 transition-colors
                      ${activeView === 'grid' ? 'text-sm sm:text-base' : 'text-lg sm:text-xl'}
                    `}>
                      {product.name}
                    </h3>
                    <p className={`
                      text-emerald-600 mt-1 line-clamp-2
                      ${activeView === 'grid' ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}
                    `}>
                      {product.description || 'Fresh organic product from local farmers'}
                    </p>
                  </div>
                  <p className={`
                    font-bold text-emerald-600 ml-4 whitespace-nowrap flex-shrink-0
                    ${activeView === 'grid' ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'}
                  `}>
                    KSh {formatPrice(product.price)}
                  </p>
                </div>

                {/* Cart Actions */}
                <div className={`flex items-center justify-between ${activeView === 'list' ? 'mt-auto' : ''}`}>
                  {quantityInCart > 0 ? (
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeFromCart(product)} 
                        disabled={isAdding} 
                        className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-emerald-100 hover:bg-emerald-200 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 group active:scale-95"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                        </svg>
                      </motion.button>
                      <span className="text-base sm:text-lg font-semibold text-emerald-900 min-w-6 sm:min-w-8 text-center">
                        {quantityInCart}
                      </span>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => addToCart(product)} 
                        disabled={isAdding} 
                        className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-emerald-500 hover:bg-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 group active:scale-95"
                      >
                        {isAdding ? (
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        )}
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addToCart(product)} 
                      disabled={isAdding} 
                      className={`
                        bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg sm:rounded-xl font-medium transition-all duration-200 disabled:opacity-50 flex items-center space-x-1 sm:space-x-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95
                        ${activeView === 'grid' 
                          ? 'px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm' 
                          : 'px-4 py-3 text-sm sm:px-6 sm:py-3 sm:text-base'
                        }
                      `}
                    >
                      {isAdding ? (
                        <>
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="whitespace-nowrap">Adding...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="whitespace-nowrap">Add to Cart</span>
                        </>
                      )}
                    </motion.button>
                  )}

                  {/* Total Price for Items in Cart */}
                  {quantityInCart > 0 && (
                    <div className="text-right ml-2 sm:ml-4">
                      <p className="text-xs sm:text-sm text-emerald-600 whitespace-nowrap">Total</p>
                      <p className="text-sm sm:text-lg font-bold text-emerald-900 whitespace-nowrap">
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
);

export default ClientProductsScreen;