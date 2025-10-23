import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ClientHeader from './ClientHeader';
import ClientFooter from './ClientFooter';
import ClientProductsScreen from './ClientProductsScreen';
import ClientRecipesScreen from './ClientRecipesScreen';
import ClientRecipeModal from './ClientRecipeModal';
import ClientSidebar from './ClientSidebar';
import ClientWelcomeSection from './ClientWelcomeSection';
import ClientMobileMenu from './ClientMobileMenu';

const BASE_URL = 'https://arifarm.onrender.com';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recipeCategories, setRecipeCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRecipeCategory, setSelectedRecipeCategory] = useState('all');
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [recipeSearchQuery, setRecipeSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('name');
  const [activeTab, setActiveTab] = useState('products');
  const [cartQuantities, setCartQuantities] = useState({});
  const [addingToCart, setAddingToCart] = useState({});
  const [activeView, setActiveView] = useState('grid');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          navigate('/login');
          return;
        }

        const trimmedToken = token.trim();
        if (!trimmedToken || trimmedToken === 'undefined' || trimmedToken === 'null') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/login');
          return;
        }

        setIsLoading(true);

        const [userResponse, productsResponse, categoriesResponse, recipeCategoriesResponse, recipesResponse, cartResponse] = await Promise.all([
          axios.get(`${BASE_URL}/api/accounts/me/`, {
            headers: { Authorization: `Bearer ${trimmedToken}` },
          }),
          axios.get(`${BASE_URL}/api/products/`, {
            headers: { Authorization: `Bearer ${trimmedToken}` },
          }),
          axios.get(`${BASE_URL}/api/categories/`, {
            headers: { Authorization: `Bearer ${trimmedToken}` },
          }),
          axios.get(`${BASE_URL}/api/recipe-categories/`, {
            headers: { Authorization: `Bearer ${trimmedToken}` },
          }),
          axios.get(`${BASE_URL}/api/recipes/`, {
            headers: { Authorization: `Bearer ${trimmedToken}` },
          }),
          axios.get(`${BASE_URL}/api/orders/carts/`, {
            headers: { Authorization: `Bearer ${trimmedToken}` },
          })
        ]);

        setUser(userResponse.data);
        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data);
        setRecipeCategories(recipeCategoriesResponse.data);
        setRecipes(recipesResponse.data);
        
        const userCart = cartResponse.data[0] || null;
        setCart(userCart);
        
        if (userCart?.cart_items) {
          const quantities = {};
          userCart.cart_items.forEach(item => {
            quantities[item.product] = item.quantity;
          });
          setCartQuantities(quantities);
        }
      } catch (err) {
        console.error('Fetch data error:', err);
        if (err.response?.status === 401) {
          await handleTokenRefresh();
        } else {
          setError(err.response?.data?.detail || 'Failed to fetch data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const updateCartQuantity = async (product, newQuantity) => {
    try {
      setAddingToCart(prev => ({ ...prev, [product.id]: true }));
      const token = localStorage.getItem('access_token').trim();

      if (newQuantity === 0) {
        const cartItem = cart?.cart_items?.find(item => item.product === product.id);
        if (cartItem) {
          await axios.delete(
            `${BASE_URL}/api/orders/cart-items/${cartItem.id}/`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } else {
        const cartItem = cart?.cart_items?.find(item => item.product === product.id);
        if (cartItem) {
          await axios.put(
            `${BASE_URL}/api/orders/cart-items/${cartItem.id}/`,
            { product: product.id, quantity: newQuantity },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          await axios.post(
            `${BASE_URL}/api/orders/cart-items/`,
            { product: product.id, quantity: newQuantity },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }

      const cartResponse = await axios.get(`${BASE_URL}/api/orders/carts/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedCart = cartResponse.data[0] || null;
      setCart(updatedCart);
      
      setCartQuantities(prev => ({
        ...prev,
        [product.id]: newQuantity
      }));
    } catch (err) {
      console.error('Cart update error:', err);
      setError('Failed to update cart');
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const addToCart = (product) => {
    const currentQuantity = cartQuantities[product.id] || 0;
    updateCartQuantity(product, currentQuantity + 1);
  };

  const removeFromCart = (product) => {
    const currentQuantity = cartQuantities[product.id] || 0;
    if (currentQuantity > 0) {
      updateCartQuantity(product, currentQuantity - 1);
    }
  };

  const cartCount = Object.values(cartQuantities).reduce((total, quantity) => total + quantity, 0);

  const filteredProducts = products
    .filter((product) =>
      (selectedCategory === 'all' || product.category === parseInt(selectedCategory)) &&
      (searchQuery === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const filteredRecipes = recipes
    .filter((recipe) =>
      (selectedRecipeCategory === 'all' || recipe.category?.id === parseInt(selectedRecipeCategory)) &&
      (recipeSearchQuery === '' ||
        recipe.title.toLowerCase().includes(recipeSearchQuery.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(recipeSearchQuery.toLowerCase()) ||
        recipe.ingredients?.toLowerCase().includes(recipeSearchQuery.toLowerCase()))
    );

  const handleTokenRefresh = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        const refreshResponse = await axios.post(`${BASE_URL}/api/accounts/token/refresh/`, {
          refresh: refreshToken.trim(),
        });
        const newAccessToken = refreshResponse.data.access;
        localStorage.setItem('access_token', newAccessToken);
        window.location.reload();
      } else {
        navigate('/login');
      }
    } catch (refreshErr) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      navigate('/login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const formatPrice = (price) => {
    return parseFloat(price || 0).toLocaleString('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-700 text-lg font-medium">Loading your marketplace...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      <ClientHeader 
        user={user} 
        cartCount={cartCount} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        filteredProducts={filteredProducts}
        filteredRecipes={filteredRecipes}
        searchQuery={searchQuery}
        recipeSearchQuery={recipeSearchQuery}
        setSearchQuery={setSearchQuery}
        setRecipeSearchQuery={setRecipeSearchQuery}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navigate={navigate}
        handleLogout={handleLogout}
      />
      
      <ClientMobileMenu 
        mobileMenuOpen={mobileMenuOpen}
        cartCount={cartCount}
        activeTab={activeTab}
        selectedCategory={selectedCategory}
        selectedRecipeCategory={selectedRecipeCategory}
        categories={categories}
        recipeCategories={recipeCategories}
        navigate={navigate}
        setMobileMenuOpen={setMobileMenuOpen}
        setSelectedCategory={setSelectedCategory}
        setSelectedRecipeCategory={setSelectedRecipeCategory}
      />

      {/* MAIN CONTENT - FIXED CONTAINER */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-full"> {/* Remove max-width constraints */}
          <ClientWelcomeSection 
            activeTab={activeTab} 
            filteredProducts={filteredProducts} 
            filteredRecipes={filteredRecipes}
            user={user}
          />
          
          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 w-full">
            <ClientSidebar 
              activeTab={activeTab}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedRecipeCategory={selectedRecipeCategory}
              setSelectedRecipeCategory={setSelectedRecipeCategory}
              categories={categories}
              recipeCategories={recipeCategories}
              sortOption={sortOption}
              setSortOption={setSortOption}
              handleLogout={handleLogout}
              user={user}
            />

            <div className="lg:col-span-3 w-full">
              {activeTab === 'products' && (
                <ClientProductsScreen 
                  filteredProducts={filteredProducts}
                  activeView={activeView}
                  setActiveView={setActiveView}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  categories={categories}
                  cartQuantities={cartQuantities}
                  addingToCart={addingToCart}
                  addToCart={addToCart}
                  removeFromCart={removeFromCart}
                  formatPrice={formatPrice}
                />
              )}
              
              {activeTab === 'recipes' && (
                <ClientRecipesScreen 
                  filteredRecipes={filteredRecipes}
                  recipeSearchQuery={recipeSearchQuery}
                  selectedRecipeCategory={selectedRecipeCategory}
                  recipeCategories={recipeCategories}
                  activeView={activeView}
                  setSelectedRecipeCategory={setSelectedRecipeCategory}
                  openRecipeDetail={setSelectedRecipe}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <ClientFooter />

      <ClientRecipeModal 
        selectedRecipe={selectedRecipe}
        setSelectedRecipe={setSelectedRecipe}
        isDownloading={isDownloading}
        setIsDownloading={setIsDownloading}
      />
    </div>
  );
};

export default Dashboard;