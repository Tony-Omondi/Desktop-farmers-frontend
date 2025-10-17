import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ClientFooter = () => (
  <motion.footer 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5, duration: 0.6 }}
    className="bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900 text-white pt-16 pb-8 border-t border-emerald-800/50"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
        {/* LOGO & DESCRIPTION */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-1"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-xl">
              <span className="text-white font-bold text-lg">🌿</span>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                FarmFresh
              </span>
              <span className="block text-xs text-emerald-300 font-medium">Organic Marketplace</span>
            </div>
          </div>
          <p className="text-emerald-200 text-sm leading-relaxed mb-4">
            Connecting organic farmers with health-conscious consumers. Fresh from farm to table since 2024.
          </p>
          {/* SOCIAL ICONS */}
          <div className="flex space-x-3">
            {['Facebook', 'Instagram', 'Twitter', 'YouTube'].map((social, index) => (
              <motion.a 
                key={index} 
                href="#"
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-10 h-10 bg-emerald-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center text-emerald-300 hover:text-white hover:bg-emerald-500/80 transition-all duration-300"
                aria-label={social}
              >
                <span className="text-lg">{social === 'Facebook' ? '📘' : social === 'Instagram' ? '📷' : social === 'Twitter' ? '🐦' : '📺'}</span>
              </motion.a>
            ))}
          </div>
        </motion.div>
        
        {/* QUICK LINKS COLUMNS */}
        {[
          { title: "Quick Links", links: ["Dashboard", "Products", "Recipes", "Cart"] },
          { title: "Explore", links: ["Categories", "New Arrivals", "Best Sellers", "Organic Tips"] },
          { title: "Support", links: ["Help Center", "Shipping", "Returns", "Contact Us"] }
        ].map((column, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-emerald-100">{column.title}</h3>
            <ul className="space-y-3">
              {column.links.map((link, linkIndex) => (
                <motion.li 
                  key={linkIndex}
                  whileHover={{ x: 4 }}
                  className="group"
                >
                  <button className="text-emerald-300 hover:text-emerald-100 transition-all duration-200 text-sm group-hover:translate-x-1">
                    {link}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
      
      {/* BOTTOM BAR */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="border-t border-emerald-800/50 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
      >
        <p className="text-emerald-300 text-sm text-center md:text-left">
          © 2025 FarmFresh Organic Marketplace. All rights reserved. | Freshness guaranteed, naturally grown.
        </p>
        <div className="flex space-x-6 text-sm text-emerald-300">
          <motion.a 
            href="#" 
            whileHover={{ scale: 1.05 }}
            className="hover:text-emerald-100 transition-colors duration-200"
          >
            Privacy Policy
          </motion.a>
          <motion.a 
            href="#" 
            whileHover={{ scale: 1.05 }}
            className="hover:text-emerald-100 transition-colors duration-200"
          >
            Terms of Service
          </motion.a>
          <motion.a 
            href="#" 
            whileHover={{ scale: 1.05 }}
            className="hover:text-emerald-100 transition-colors duration-200"
          >
            Cookie Policy
          </motion.a>
        </div>
      </motion.div>
    </div>
  </motion.footer>
);

export default ClientFooter;