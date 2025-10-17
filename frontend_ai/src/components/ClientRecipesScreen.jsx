import { motion } from 'framer-motion';

const ClientRecipesScreen = ({ 
  filteredRecipes, recipeSearchQuery, selectedRecipeCategory, 
  recipeCategories, activeView, setSelectedRecipeCategory, openRecipeDetail 
}) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="lg:col-span-3"
  >
    {/* Header Section */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
      <div className="flex-1 min-w-0">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-900 mb-2">Fresh Recipe Ideas</h2>
        <p className="text-emerald-600 text-sm sm:text-base lg:text-lg">
          {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
          {recipeSearchQuery && (
            <span className="text-emerald-700 font-medium"> for "{recipeSearchQuery}"</span>
          )}
          {selectedRecipeCategory !== 'all' && (
            <span className="text-emerald-700 font-medium"> in {recipeCategories.find(c => c.id === parseInt(selectedRecipeCategory))?.name}</span>
          )}
        </p>
      </div>
      
      {/* Clear Filters Button */}
      {(recipeSearchQuery || selectedRecipeCategory !== 'all') && (
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

    {/* Recipes Grid */}
    {filteredRecipes.length === 0 ? (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 sm:p-8 lg:p-12 text-center"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <span className="text-2xl sm:text-3xl lg:text-4xl">🔍</span>
        </div>
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-emerald-900 mb-2">No recipes found</h3>
        <p className="text-emerald-600 text-sm sm:text-base mb-4 sm:mb-6 max-w-md mx-auto">
          {recipeSearchQuery 
            ? `We couldn't find any recipes matching "${recipeSearchQuery}"` 
            : 'Try selecting a different category or clearing your filters'
          }
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Browse All Recipes
        </motion.button>
      </motion.div>
    ) : (
      <div className={`
        grid gap-4 sm:gap-6 
        ${activeView === 'grid' 
          ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3'  // 2 columns on mobile and tablet
          : 'grid-cols-1'
        }
      `}>
        {filteredRecipes.map((recipe, index) => {
          const category = recipe.category;
          const tags = recipe.tags_display || [];

          return (
            <motion.div 
              key={recipe.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-emerald-100 hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-0.5 sm:hover:-translate-y-1"
              onClick={() => openRecipeDetail(recipe)}
            >
              {/* Recipe Image */}
              <div className="relative w-full h-32 sm:h-40 md:h-48">
                <img
                  src={recipe.image_url || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                  <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-emerald-700 text-xs font-medium rounded-lg shadow-sm">
                    {category?.name || 'Recipe'}
                  </span>
                </div>
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex space-x-1">
                  <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded-lg shadow-lg">
                    ⭐ {recipe.review || '4.8'}
                  </span>
                </div>
              </div>

              {/* Recipe Content */}
              <div className="p-4 sm:p-6">
                <h3 className="text-sm sm:text-base font-semibold text-emerald-900 line-clamp-2 group-hover:text-emerald-700 transition-colors mb-2">
                  {recipe.title}
                </h3>
                
                <p className="text-emerald-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                  {recipe.description || 'Delicious recipe made with fresh ingredients'}
                </p>

                {/* Recipe Meta Info */}
                <div className="flex justify-between items-center mb-3 sm:mb-4 text-xs sm:text-sm">
                  <div className="flex items-center space-x-2 sm:space-x-4 text-emerald-700">
                    <span className="flex items-center space-x-1">
                      <span className="text-xs">⏱️</span>
                      <span className="whitespace-nowrap">{recipe.prep_time}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="text-xs">🔥</span>
                      <span className="whitespace-nowrap">{recipe.cook_time}</span>
                    </span>
                  </div>
                  <span className="text-emerald-600 flex items-center space-x-1">
                    <span className="text-xs">👥</span>
                    <span className="whitespace-nowrap">{recipe.servings}</span>
                  </span>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
                    {tags.slice(0, 2).map(tag => ( // Show only 2 tags on mobile
                      <span key={tag} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full whitespace-nowrap">
                        {tag}
                      </span>
                    ))}
                    {tags.length > 2 && (
                      <span className="text-xs text-gray-500 whitespace-nowrap">+{tags.length - 2}</span>
                    )}
                  </div>
                )}

                {/* View Recipe Button */}
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2 sm:py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg sm:rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-1 sm:space-x-2 group text-xs sm:text-sm"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
);

export default ClientRecipesScreen;