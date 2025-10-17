import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const ClientRecipeModal = ({ selectedRecipe, setSelectedRecipe, isDownloading, setIsDownloading }) => {
  const [activeTab, setActiveTab] = useState('ingredients'); // For mobile tabs

  const handleDownloadRecipe = async () => {
    if (!selectedRecipe) return;

    setIsDownloading(true);

    try {
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

      const blob = new Blob([recipeContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedRecipe.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_recipe.txt`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setTimeout(() => {
        setIsDownloading(false);
      }, 2000);

    } catch (error) {
      console.error('Download failed:', error);
      setIsDownloading(false);
    }
  };

  const closeRecipeDetail = () => {
    setSelectedRecipe(null);
    setIsDownloading(false);
    setActiveTab('ingredients');
  };

  return (
    <AnimatePresence>
      {selectedRecipe && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={closeRecipeDetail}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            className="bg-white rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-emerald-100 sticky top-0 bg-white rounded-t-xl sm:rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-900 line-clamp-2 pr-4">
                  {selectedRecipe.title}
                </h2>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeRecipeDetail} 
                  className="p-1 sm:p-2 hover:bg-emerald-50 rounded-full transition-all duration-200 active:scale-95 flex-shrink-0"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Recipe Image */}
              {selectedRecipe.image_url && (
                <img
                  src={selectedRecipe.image_url}
                  alt={selectedRecipe.title}
                  className="w-full h-40 sm:h-48 md:h-56 lg:h-64 object-cover rounded-lg sm:rounded-xl shadow-sm"
                />
              )}

              {/* Recipe Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-sm">
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center space-x-1 sm:space-x-2 p-2 sm:p-3 bg-emerald-50 rounded-lg">
                  <span className="text-emerald-600 text-sm">⏱️</span>
                  <div className="min-w-0">
                    <p className="text-gray-500 text-xs">Prep Time</p>
                    <p className="text-emerald-700 font-medium text-sm truncate">{selectedRecipe.prep_time}</p>
                  </div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center space-x-1 sm:space-x-2 p-2 sm:p-3 bg-emerald-50 rounded-lg">
                  <span className="text-emerald-600 text-sm">🔥</span>
                  <div className="min-w-0">
                    <p className="text-gray-500 text-xs">Cook Time</p>
                    <p className="text-emerald-700 font-medium text-sm truncate">{selectedRecipe.cook_time}</p>
                  </div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center space-x-1 sm:space-x-2 p-2 sm:p-3 bg-emerald-50 rounded-lg">
                  <span className="text-emerald-600 text-sm">👥</span>
                  <div className="min-w-0">
                    <p className="text-gray-500 text-xs">Servings</p>
                    <p className="text-emerald-700 font-medium text-sm truncate">{selectedRecipe.servings}</p>
                  </div>
                </motion.div>
              </div>

              {/* Mobile Tabs for Ingredients/Instructions */}
              <div className="sm:hidden">
                <div className="flex border-b border-emerald-200 mb-4">
                  <button
                    onClick={() => setActiveTab('ingredients')}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'ingredients'
                        ? 'text-emerald-600 border-b-2 border-emerald-500'
                        : 'text-gray-500 hover:text-emerald-600'
                    }`}
                  >
                    Ingredients
                  </button>
                  <button
                    onClick={() => setActiveTab('instructions')}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'instructions'
                        ? 'text-emerald-600 border-b-2 border-emerald-500'
                        : 'text-gray-500 hover:text-emerald-600'
                    }`}
                  >
                    Instructions
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="hidden sm:block">
                <h3 className="text-base sm:text-lg font-semibold text-emerald-900 mb-2 sm:mb-3 flex items-center">
                  <span className="mr-2">📝</span>Description
                </h3>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{selectedRecipe.description}</p>
              </div>

              {/* Content Area - Different layout for mobile vs desktop */}
              <div className={`
                ${window.innerWidth < 640 
                  ? 'block'  // Mobile: Show tabs content
                  : 'grid grid-cols-1 lg:grid-cols-2 gap-6'  // Desktop: Side by side
                }
              `}>
                {/* Ingredients - Always visible on desktop, conditional on mobile */}
                {(activeTab === 'ingredients' || window.innerWidth >= 640) && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-emerald-50/50 rounded-lg sm:rounded-xl p-3 sm:p-4"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-emerald-900 mb-2 sm:mb-3 flex items-center">
                      <span className="mr-2">🥕</span>Ingredients
                    </h3>
                    <div className="space-y-1 sm:space-y-2">
                      {selectedRecipe.ingredients.split(',').map((ingredient, index) => (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center space-x-2 p-2 hover:bg-white/50 rounded-lg transition-colors"
                        >
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0"></span>
                          <span className="text-gray-700 text-sm sm:text-base">{ingredient.trim()}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Instructions - Always visible on desktop, conditional on mobile */}
                {(activeTab === 'instructions' || window.innerWidth >= 640) && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-emerald-50/50 rounded-lg sm:rounded-xl p-3 sm:p-4"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-emerald-900 mb-2 sm:mb-3 flex items-center">
                      <span className="mr-2">👨‍🍳</span>Instructions
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      {selectedRecipe.instructions.split('.').filter(Boolean).map((step, index) => (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-start space-x-2 sm:space-x-3 p-2 hover:bg-white/50 rounded-lg transition-colors"
                        >
                          <span className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <p className="text-gray-700 text-sm sm:text-base leading-relaxed flex-1">{step.trim()}.</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Tags */}
              {selectedRecipe.tags_display?.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-emerald-900 mb-2 sm:mb-3 flex items-center">
                    <span className="mr-2">🏷️</span>Tags
                  </h3>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {selectedRecipe.tags_display.map((tag, index) => (
                      <motion.span 
                        key={tag} 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="px-2 sm:px-3 py-1 bg-emerald-100 text-emerald-700 text-xs sm:text-sm rounded-full"
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {/* Download Button */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-4 sm:pt-6 border-t border-emerald-100"
              >
                <motion.button 
                  whileHover={!isDownloading ? { scale: 1.02 } : {}}
                  whileTap={!isDownloading ? { scale: 0.98 } : {}}
                  onClick={handleDownloadRecipe}
                  disabled={isDownloading}
                  className="w-full group relative overflow-hidden py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:transform-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <div className="relative flex items-center justify-center space-x-2 sm:space-x-3">
                    <motion.svg 
                      className="w-4 h-4 sm:w-5 sm:h-6 flex-shrink-0"
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
                    
                    <span className="relative text-sm sm:text-base">
                      {isDownloading ? 'Saving Recipe...' : '📥 Download Recipe'}
                    </span>
                  </div>
                </motion.button>
                
                <motion.p 
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center text-emerald-700 text-xs sm:text-sm mt-2 sm:mt-3 flex items-center justify-center space-x-1"
                >
                  <span className="text-xs">💾</span>
                  <span>Saves as .txt file to your Downloads</span>
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ClientRecipeModal;