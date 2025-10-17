import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AddProductForm from './AddProductForm';
import AddCategoryForm from './AddCategoryForm';
import CreateOrderForm from './CreateOrderForm';
import AddRecipeForm from './AddRecipeForm';
import AddRecipeCategory from './AddRecipeCategory';  
import RecipeCategories from './RecipeCategories';    
import OverviewScreen from './OverviewScreen';
import UsersScreen from './UsersScreen';
import ProductsScreen from './ProductsScreen';
import RecipesScreen from './RecipesScreen';
import OrdersScreen from './OrdersScreen';
import PaymentsScreen from './PaymentsScreen';

const BASE_URL = 'http://localhost:8000';

const AdaminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [data, setData] = useState({ users: [], products: [], orders: [], recipes: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterDateRange, setFilterDateRange] = useState('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({
        totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0, totalRecipes: 0
    });
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingRecipe, setEditingRecipe] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [updatingProduct, setUpdatingProduct] = useState(false);
    const [updatingRecipe, setUpdatingRecipe] = useState(false);
    const [editSuccess, setEditSuccess] = useState('');
    const [categories, setCategories] = useState([]);
    const [recipeCategories, setRecipeCategories] = useState([]);
    
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const accessToken = localStorage.getItem('access_token');
                if (!accessToken) {
                    navigate('/adamin/login');
                    return;
                }
                
                const [dashboardResponse, categoriesResponse, recipeCategoriesResponse] = await Promise.all([
                    axios.get(`${BASE_URL}/api/adamin/dashboard/`, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    }),
                    axios.get(`${BASE_URL}/api/categories/`, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    }),
                    axios.get(`${BASE_URL}/api/recipe-categories/`, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    })
                ]);
                
                setData({
                    ...dashboardResponse.data,
                    recipes: dashboardResponse.data.recipes || []
                });
                setCategories(categoriesResponse.data);
                setRecipeCategories(recipeCategoriesResponse.data);
                
                const totalRevenue = dashboardResponse.data.orders.reduce((sum, order) => {
                    return sum + (parseFloat(order.total_amount) || 0);
                }, 0);
                
                setStats({
                    totalUsers: dashboardResponse.data.users.length,
                    totalProducts: dashboardResponse.data.products.length,
                    totalOrders: dashboardResponse.data.orders.length,
                    totalRevenue: totalRevenue,
                    totalRecipes: dashboardResponse.data.recipes?.length || 0
                });
            } catch (err) {
                setError(err.response?.data?.detail || 'Failed to load dashboard data');
                if (err.response?.status === 401) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    navigate('/adamin/login');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    const filterDataByDate = (items, dateField = 'created_at') => {
        if (filterDateRange === 'all') return items;
        const now = new Date();
        let startDate;
        switch(filterDateRange) {
            case 'today': startDate = new Date(now.setHours(0, 0, 0, 0)); break;
            case 'yesterday':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 1);
                startDate.setHours(0, 0, 0, 0);
                const yesterdayEnd = new Date(startDate);
                yesterdayEnd.setHours(23, 59, 59, 999);
                return items.filter(item => {
                    const itemDate = new Date(item[dateField]);
                    return itemDate >= startDate && itemDate <= yesterdayEnd;
                });
            case 'last7': startDate = new Date(now.setDate(now.getDate() - 7)); break;
            case 'last30': startDate = new Date(now.setDate(now.getDate() - 30)); break;
            case 'custom':
                if (!customStartDate || !customEndDate) return items;
                startDate = new Date(customStartDate);
                const endDate = new Date(customEndDate);
                endDate.setHours(23, 59, 59, 999);
                return items.filter(item => {
                    const itemDate = new Date(item[dateField]);
                    return itemDate >= startDate && itemDate <= endDate;
                });
            default: return items;
        }
        return items.filter(item => {
            const itemDate = new Date(item[dateField]);
            return itemDate >= startDate;
        });
    };

    const filterDataBySearch = (items, type) => {
        if (!searchQuery) return items;
        const query = searchQuery.toLowerCase();
        switch(type) {
            case 'users':
                return items.filter(user => 
                    user.full_name.toLowerCase().includes(query) || 
                    user.email.toLowerCase().includes(query)
                );
            case 'products':
                return items.filter(product => 
                    product.name.toLowerCase().includes(query) || 
                    product.description.toLowerCase().includes(query) ||
                    (product.category?.name && product.category.name.toLowerCase().includes(query))
                );
            case 'recipes':
                return items.filter(recipe => 
                    recipe.title.toLowerCase().includes(query) || 
                    recipe.description.toLowerCase().includes(query) ||
                    recipe.ingredients.toLowerCase().includes(query) ||
                    (recipe.category?.name && recipe.category.name.toLowerCase().includes(query)) ||
                    (recipe.tags_list && recipe.tags_list.some(tag => tag.toLowerCase().includes(query)))
                );
            case 'orders':
                return items.filter(order => 
                    order.order_id.toLowerCase().includes(query) || 
                    order.user.email.toLowerCase().includes(query) ||
                    order.status.toLowerCase().includes(query) ||
                    String(order.total_amount).includes(query) ||
                    order.payment_status.toLowerCase().includes(query)
                );
            case 'payments':
                return items.filter(order => 
                    order.payment && (
                        order.payment.reference?.toLowerCase().includes(query) ||
                        String(order.payment.amount).includes(query) ||
                        order.payment.payment_status.toLowerCase().includes(query) ||
                        order.order_id.toLowerCase().includes(query)
                    )
                );
            default: return items;
        }
    };

    const getFilteredData = (type) => {
        let items = [];
        let dateField = 'created_at';
        switch(type) {
            case 'users': items = data.users; dateField = 'date_joined'; break;
            case 'products': case 'orders': case 'recipes': items = data[type]; break;
            case 'payments': items = data.orders.filter(order => order.payment && order.payment.reference); break;
            default: return [];
        }
        const dateFiltered = filterDataByDate(items, dateField);
        return filterDataBySearch(dateFiltered, type);
    };

    const handleEditProduct = (product) => {
        setEditingProduct({ ...product });
        setEditingRecipe(null);
        setShowEditModal(true);
    };

    const handleEditRecipe = (recipe) => {
        setEditingRecipe({ ...recipe });
        setEditingProduct(null);
        setShowEditModal(true);
    };

    const updateProduct = async (e) => {
        e.preventDefault();
        if (!editingProduct) return;
        setUpdatingProduct(true);
        try {
            const accessToken = localStorage.getItem('access_token');
            const updateData = {
                name: editingProduct.name,
                description: editingProduct.description,
                price: parseFloat(editingProduct.price),
                stock: parseInt(editingProduct.stock)
            };
            const response = await axios.patch(
                `${BASE_URL}/api/products/${editingProduct.id}/`,
                updateData,
                { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
            );
            setData(prev => ({
                ...prev,
                products: prev.products.map(p => 
                    p.id === editingProduct.id ? { ...response.data, images: p.images } : p
                )
            }));
            setEditSuccess('Product updated successfully! ✅');
            setTimeout(() => {
                setEditSuccess('');
                setShowEditModal(false);
                setEditingProduct(null);
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update product');
        } finally {
            setUpdatingProduct(false);
        }
    };

    const updateRecipe = async (e) => {
        e.preventDefault();
        if (!editingRecipe) return;
        setUpdatingRecipe(true);
        try {
            const accessToken = localStorage.getItem('access_token');
            const updateData = {
                title: editingRecipe.title,
                description: editingRecipe.description,
                ingredients: editingRecipe.ingredients,
                instructions: editingRecipe.instructions,
                prep_time: editingRecipe.prep_time,
                cook_time: editingRecipe.cook_time,
                servings: parseInt(editingRecipe.servings),
                category: editingRecipe.category_id || null
            };
            const response = await axios.patch(
                `${BASE_URL}/api/recipes/${editingRecipe.id}/`,
                updateData,
                { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
            );
            setData(prev => ({
                ...prev,
                recipes: prev.recipes.map(r => 
                    r.id === editingRecipe.id ? response.data : r
                )
            }));
            setEditSuccess('Recipe updated successfully! ✅');
            setTimeout(() => {
                setEditSuccess('');
                setShowEditModal(false);
                setEditingRecipe(null);
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update recipe');
        } finally {
            setUpdatingRecipe(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/adamin/login');
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'products', label: 'Products', icon: '🛍️' },
        { id: 'recipes', label: 'Recipes', icon: '👨‍🍳' },
        { id: 'orders', label: 'Orders', icon: '📦' },
        { id: 'payments', label: 'Payments', icon: '💳' },
        { id: 'add-product', label: 'Add Product', icon: '➕' },
        { id: 'add-category', label: 'Add Category', icon: '📂' },
        { id: 'add-recipe-category', label: 'Add Recipe Category', icon: '🍳' }, 
        { id: 'recipe-categories', label: 'Recipe Categories', icon: '📁' },     
        { id: 'add-recipe', label: 'Add Recipe', icon: '➕' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                    <button onClick={handleLogout} className="mt-2 md:mt-0 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                        Logout
                    </button>
                </div>
                
                {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200"><p>{error}</p></div>}
                
                {(activeTab === 'users' || activeTab === 'products' || activeTab === 'recipes' || activeTab === 'orders' || activeTab === 'payments') && !isLoading && (
                    <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
                        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                className="w-full p-2 border border-gray-300 rounded-lg flex-1"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <select
                                className="p-2 border border-gray-300 rounded-lg"
                                value={filterDateRange}
                                onChange={(e) => setFilterDateRange(e.target.value)}
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="yesterday">Yesterday</option>
                                <option value="last7">Last 7 Days</option>
                                <option value="last30">Last 30 Days</option>
                                <option value="custom">Custom Range</option>
                            </select>
                            {filterDateRange === 'custom' && (
                                <div className="flex space-x-2">
                                    <input type="date" className="p-2 border border-gray-300 rounded-lg" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} />
                                    <input type="date" className="p-2 border border-gray-300 rounded-lg" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <div className="flex overflow-x-auto space-x-4 border-b">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`flex items-center py-2 px-4 text-sm font-medium whitespace-nowrap ${
                                    activeTab === tab.id ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-600 hover:text-emerald-600'
                                }`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className="mr-2">{tab.icon}</span>{tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
                    </div>
                ) : (
                    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
                        {activeTab === 'overview' && <OverviewScreen data={data} stats={stats} />}
                        {activeTab === 'users' && <UsersScreen filteredData={getFilteredData('users')} />}
                        {activeTab === 'products' && <ProductsScreen filteredData={getFilteredData('products')} onEdit={handleEditProduct} />}
                        {activeTab === 'recipes' && <RecipesScreen filteredData={getFilteredData('recipes')} onEdit={handleEditRecipe} />}
                        {activeTab === 'orders' && <OrdersScreen filteredData={getFilteredData('orders')} />}
                        {activeTab === 'payments' && <PaymentsScreen filteredData={getFilteredData('payments')} />}
                        
                        {activeTab === 'add-product' && <AddProductForm />}
                        {activeTab === 'add-category' && <AddCategoryForm />}
                        {activeTab === 'add-recipe-category' && <AddRecipeCategory />}
                        {activeTab === 'recipe-categories' && <RecipeCategories />}
                        {activeTab === 'add-recipe' && <AddRecipeForm />}
                    </div>
                )}

                {showEditModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        {editingProduct ? 'Edit Product' : 'Edit Recipe'}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingProduct(null);
                                            setEditingRecipe(null);
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                {editSuccess && (
                                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                                        {editSuccess}
                                    </div>
                                )}
                                {error && (
                                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                        {error}
                                    </div>
                                )}
                            </div>

                            <form onSubmit={editingProduct ? updateProduct : updateRecipe} className="p-6 space-y-6">
                                {editingProduct ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                                            <input
                                                type="text"
                                                value={editingProduct?.name || ''}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                            <textarea
                                                rows="3"
                                                value={editingProduct?.description || ''}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Price (KSh)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editingProduct?.price || ''}
                                                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={editingProduct?.stock || ''}
                                                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-500">📂 Category</p>
                                                <p className="font-medium">{editingProduct?.category?.name || 'None'}</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-500">🖼️ Images</p>
                                                <p className="font-medium">{editingProduct?.images?.length || 0} current</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Title</label>
                                            <input
                                                type="text"
                                                value={editingRecipe?.title || ''}
                                                onChange={(e) => setEditingRecipe({ ...editingRecipe, title: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                            <textarea
                                                rows="2"
                                                value={editingRecipe?.description || ''}
                                                onChange={(e) => setEditingRecipe({ ...editingRecipe, description: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Prep Time</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 10 minutes"
                                                    value={editingRecipe?.prep_time || ''}
                                                    onChange={(e) => setEditingRecipe({ ...editingRecipe, prep_time: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Cook Time</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 15 minutes"
                                                    value={editingRecipe?.cook_time || ''}
                                                    onChange={(e) => setEditingRecipe({ ...editingRecipe, cook_time: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Servings</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={editingRecipe?.servings || ''}
                                                    onChange={(e) => setEditingRecipe({ ...editingRecipe, servings: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                                <select
                                                    value={editingRecipe?.category_id || ''}
                                                    onChange={(e) => setEditingRecipe({ 
                                                        ...editingRecipe, 
                                                        category_id: e.target.value ? parseInt(e.target.value) : null,
                                                        category: recipeCategories.find(c => c.id === parseInt(e.target.value))
                                                    })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                >
                                                    <option value="">No Category</option>
                                                    {recipeCategories.map(cat => (
                                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
                                            <textarea
                                                rows="3"
                                                placeholder="List ingredients separated by commas or line breaks"
                                                value={editingRecipe?.ingredients || ''}
                                                onChange={(e) => setEditingRecipe({ ...editingRecipe, ingredients: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                                            <textarea
                                                rows="4"
                                                placeholder="Step-by-step cooking instructions"
                                                value={editingRecipe?.instructions || ''}
                                                onChange={(e) => setEditingRecipe({ ...editingRecipe, instructions: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-500">🖼️ Image</p>
                                                <p className="font-medium">{editingRecipe?.image_url ? 'Uploaded' : 'None'}</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-500">🏷️ Tags</p>
                                                <p className="font-medium">{editingRecipe?.tags_list?.length || 0} current</p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={(editingProduct ? updatingProduct : updatingRecipe)}
                                        className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                                    >
                                        {(editingProduct ? updatingProduct : updatingRecipe) ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Updating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span>Save Changes</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingProduct(null);
                                            setEditingRecipe(null);
                                        }}
                                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdaminDashboard;