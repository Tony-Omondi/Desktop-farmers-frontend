import { motion } from 'framer-motion';

const ClientWelcomeSection = ({ activeTab, filteredProducts, filteredRecipes, user }) => (
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
);

export default ClientWelcomeSection;