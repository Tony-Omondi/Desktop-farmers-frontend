import { motion } from 'framer-motion';

const ClientStatsSection = ({ 
  activeTab, cartCount, products, categories, recipeCategories, 
  recipes, filteredProducts, filteredRecipes 
}) => (
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
);

export default ClientStatsSection;