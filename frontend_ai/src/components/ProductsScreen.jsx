import React, { useState, useEffect, useRef } from 'react';

const ProductsScreen = ({ filteredData, onEdit }) => {
  const [imageErrors, setImageErrors] = useState({});
  const [loadedImages, setLoadedImages] = useState({});
  const [visibleProducts, setVisibleProducts] = useState(new Set());
  const gridRef = useRef(null);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleProducts(prev => new Set(prev).add(entry.target.dataset.productId));
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [filteredData]);

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const handleImageLoad = (productId) => {
    setLoadedImages(prev => ({ ...prev, [productId]: true }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Africa/Nairobi'
    });
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { 
      text: 'Out of Stock', 
      class: 'text-red-700 bg-red-50 border border-red-200',
      icon: '❌'
    };
    if (stock <= 10) return { 
      text: 'Low Stock', 
      class: 'text-orange-700 bg-orange-50 border border-orange-200',
      icon: '⚠️'
    };
    return { 
      text: 'In Stock', 
      class: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
      icon: '✅'
    };
  };

  // Enhanced empty state with animation
  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-32 h-32 mx-auto mb-6 text-gray-300 animate-bounce-slow">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" 
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1M9 7h6" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3 animate-slide-up">
          No products found
        </h3>
        <p className="text-gray-600 text-lg mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Try adjusting your search criteria or filters
        </p>
        <div className="animate-pulse-slow">
          <div className="w-48 h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mx-auto mb-2"></div>
          <div className="w-36 h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 animate-fade-in">
      {/* Enhanced Header with Sticky Behavior */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4 sticky top-0 bg-gray-50 py-4 z-10 transition-all duration-300">
        <div className="animate-slide-left">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent">
            Products
          </h2>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Manage your product inventory efficiently
          </p>
        </div>
        <div className="animate-slide-right">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-ping"></span>
            {filteredData.length} {filteredData.length === 1 ? 'product' : 'products'}
          </span>
        </div>
      </div>

      {/* Enhanced Products Grid with Staggered Animations */}
      <div 
        ref={gridRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filteredData.map((product, index) => {
          const stockStatus = getStockStatus(product.stock);
          const isVisible = visibleProducts.has(product.id.toString());
          const animationDelay = `${index * 0.1}s`;
          
          return (
            <div 
              key={product.id}
              data-product-id={product.id}
              className={`
                product-card group bg-white rounded-2xl border-2 border-gray-100 
                hover:border-emerald-300 hover:shadow-2xl transition-all duration-500 
                transform hover:-translate-y-2 backdrop-blur-sm
                ${isVisible ? 'animate-scale-in' : 'opacity-0 translate-y-8'}
              `}
              style={{ 
                animationDelay,
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {/* Enhanced Image Section */}
              <div className="relative h-52 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden rounded-t-2xl">
                {product.images && product.images.length > 0 && !imageErrors[product.id] ? (
                  <div className="relative w-full h-full">
                    {/* Image Loading Skeleton */}
                    {!loadedImages[product.id] && (
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse z-10"></div>
                    )}
                    
                    <img 
                      src={product.images[0].image} 
                      alt={product.name}
                      className={`
                        w-full h-full object-cover transition-all duration-700
                        ${loadedImages[product.id] 
                          ? 'opacity-100 scale-100 group-hover:scale-110' 
                          : 'opacity-0 scale-105'
                        }
                      `}
                      onError={() => handleImageError(product.id)}
                      onLoad={() => handleImageLoad(product.id)}
                    />
                    
                    {/* Enhanced Overlay Effects */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 animate-pulse-slow">
                    <svg className="w-16 h-16 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" 
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">No Image Available</span>
                  </div>
                )}
                
                {/* Enhanced Edit Button */}
                <button
                  onClick={() => onEdit(product)}
                  className="absolute top-4 right-4 p-3 bg-white/95 backdrop-blur-md rounded-xl hover:bg-white hover:scale-110 transform transition-all duration-300 shadow-2xl hover:shadow-3xl border border-white/20 group/btn"
                  title="Edit Product"
                  aria-label={`Edit ${product.name}`}
                >
                  <svg className="w-5 h-5 text-emerald-600 group-hover/btn:text-emerald-700 transition-colors duration-200" 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>

                {/* Enhanced Stock Status Badge */}
                <div className={`
                  absolute top-4 left-4 px-3 py-2 rounded-xl text-xs font-semibold 
                  backdrop-blur-sm border transition-all duration-300 transform group-hover:scale-105
                  ${stockStatus.class}
                `}>
                  <span className="flex items-center gap-1.5">
                    <span className="text-xs">{stockStatus.icon}</span>
                    {stockStatus.text}
                  </span>
                </div>

                {/* Quick Action Overlay */}
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <div className="flex justify-center">
                    <button className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-lg text-xs font-medium text-gray-700 hover:text-emerald-600 transition-colors duration-200">
                      Quick View
                    </button>
                  </div>
                </div>
              </div>

              {/* Enhanced Content Section */}
              <div className="p-5">
                <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-700 transition-all duration-300 text-lg mb-2">
                  {product.name}
                </h3>
                
                <p className="text-gray-600 text-sm line-clamp-2 min-h-[3rem] leading-relaxed transition-colors duration-300 group-hover:text-gray-700">
                  {product.description || 'No description available for this product.'}
                </p>

                {/* Enhanced Price and Stock Section */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 group-hover:border-emerald-100 transition-colors duration-300">
                  <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {formatPrice(product.price)}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <span className="w-2 h-2 bg-current rounded-full animate-pulse"></span>
                    {product.stock} units
                  </div>
                </div>

                {/* Enhanced Category and Date Section */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 group-hover:border-gray-200 transition-colors duration-300">
                  <span className="text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 group-hover:border-gray-300 transition-colors duration-300">
                    🏷️ {product.category?.name || 'Uncategorized'}
                  </span>
                  <span className="text-xs text-gray-400 group-hover:text-gray-500 transition-colors duration-300">
                    📅 {formatDate(product.created_at)}
                  </span>
                </div>

                {/* Interactive Progress Bar for Stock */}
                {product.stock > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Stock Level</span>
                      <span>{Math.min(100, Math.round((product.stock / 50) * 100))}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${
                          product.stock <= 10 ? 'bg-orange-500' : 'bg-emerald-500'
                        }`}
                        style={{ 
                          width: `${Math.min(100, Math.round((product.stock / 50) * 100))}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductsScreen;