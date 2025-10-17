import { useState, useEffect, useRef } from 'react';

const OverviewScreen = ({ data, stats }) => {
    const [activeSection, setActiveSection] = useState('orders');
    const [visibleItems, setVisibleItems] = useState(new Set());
    const statsRef = useRef(null);

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisibleItems(prev => new Set(prev).add(entry.target.dataset.itemId));
                    }
                });
            },
            { 
                threshold: 0.1,
                rootMargin: '50px'
            }
        );

        const activityItems = document.querySelectorAll('.activity-item');
        activityItems.forEach(item => observer.observe(item));

        return () => observer.disconnect();
    }, [data]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Africa/Nairobi'
        });
    };

    const getStatusConfig = (status) => {
        const configs = {
            completed: { 
                class: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200',
                icon: '✅',
                label: 'Completed'
            },
            pending: { 
                class: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200',
                icon: '⏳',
                label: 'Pending'
            },
            processing: { 
                class: 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200',
                icon: '🔄',
                label: 'Processing'
            },
            cancelled: { 
                class: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200',
                icon: '❌',
                label: 'Cancelled'
            },
            shipped: { 
                class: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200',
                icon: '🚚',
                label: 'Shipped'
            }
        };
        return configs[status] || configs.pending;
    };

    const getRecentOrders = () => data.orders?.slice(0, 5) || [];
    const getRecentRecipes = () => data.recipes?.slice(0, 5) || [];
    const getRecentUsers = () => data.users?.slice(0, 5) || [];

    return (
        <div className="animate-fade-in">
            {/* Enhanced Header */}
            <div className="text-center mb-8 animate-slide-down">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent mb-3">
                    Dashboard Overview
                </h1>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Real-time insights and recent activity across your platform
                </p>
            </div>

            {/* Stats Overview Cards */}
            <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { 
                        title: 'Total Users', 
                        value: stats.totalUsers, 
                        change: '+12%', 
                        icon: '👥',
                        color: 'from-blue-500 to-cyan-500',
                        bgColor: 'from-blue-50 to-cyan-50',
                        borderColor: 'border-blue-200'
                    },
                    { 
                        title: 'Total Products', 
                        value: stats.totalProducts, 
                        change: '+5%', 
                        icon: '🛍️',
                        color: 'from-purple-500 to-pink-500',
                        bgColor: 'from-purple-50 to-pink-50',
                        borderColor: 'border-purple-200'
                    },
                    { 
                        title: 'Total Orders', 
                        value: stats.totalOrders, 
                        change: '+23%', 
                        icon: '📦',
                        color: 'from-emerald-500 to-green-500',
                        bgColor: 'from-emerald-50 to-green-50',
                        borderColor: 'border-emerald-200'
                    },
                    { 
                        title: 'Total Revenue', 
                        value: formatCurrency(stats.totalRevenue), 
                        change: '+18%', 
                        icon: '💰',
                        color: 'from-orange-500 to-red-500',
                        bgColor: 'from-orange-50 to-red-50',
                        borderColor: 'border-orange-200'
                    }
                ].map((stat, index) => (
                    <div 
                        key={stat.title}
                        className={`bg-gradient-to-r ${stat.bgColor} border ${stat.borderColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 animate-slide-up`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-xs text-emerald-600 font-medium mt-1">{stat.change} from last month</p>
                            </div>
                            <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                                <span className="text-xl text-white">{stat.icon}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Activity Section Tabs */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/20 mb-6 animate-slide-up">
                <div className="flex flex-wrap gap-2">
                    {[
                        { key: 'orders', label: 'Recent Orders', icon: '📦', count: getRecentOrders().length },
                        { key: 'recipes', label: 'New Recipes', icon: '👨‍🍳', count: getRecentRecipes().length },
                        { key: 'users', label: 'New Users', icon: '👥', count: getRecentUsers().length }
                    ].map(section => (
                        <button
                            key={section.key}
                            onClick={() => setActiveSection(section.key)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                                activeSection === section.key
                                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <span className="text-lg">{section.icon}</span>
                            <span>{section.label}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                                activeSection === section.key
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-300 text-gray-700'
                            }`}>
                                {section.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Activity Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                {activeSection === 'orders' && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                                    <span className="text-xl text-white">📦</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
                                    <p className="text-gray-600">Latest customer orders</p>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {getRecentOrders().map((order, index) => {
                                const statusConfig = getStatusConfig(order.status);
                                const isVisible = visibleItems.has(`order-${order.order_id}`);
                                
                                return (
                                    <div 
                                        key={order.order_id}
                                        data-item-id={`order-${order.order_id}`}
                                        className={`activity-item p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-emerald-50 transition-all duration-300 transform hover:scale-[1.02] ${
                                            isVisible ? 'animate-slide-up' : 'opacity-0 translate-y-4'
                                        }`}
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">#{order.order_id}</div>
                                                    <div className="text-xs text-gray-500">{order.user.email}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                                    {formatCurrency(order.total_amount)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.class}`}>
                                                <span>{statusConfig.icon}</span>
                                                {statusConfig.label}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {formatDate(order.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            {getRecentOrders().length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    No recent orders
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Recent Recipes */}
                {activeSection === 'recipes' && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                    <span className="text-xl text-white">👨‍🍳</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">New Recipes</h2>
                                    <p className="text-gray-600">Recently added recipes</p>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {getRecentRecipes().map((recipe, index) => {
                                const isVisible = visibleItems.has(`recipe-${recipe.id}`);
                                
                                return (
                                    <div 
                                        key={recipe.id}
                                        data-item-id={`recipe-${recipe.id}`}
                                        className={`activity-item p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50 transition-all duration-300 transform hover:scale-[1.02] ${
                                            isVisible ? 'animate-slide-up' : 'opacity-0 translate-y-4'
                                        }`}
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900 line-clamp-1">{recipe.title}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {recipe.category?.name || 'No Category'} • ⏱️ {recipe.prep_time} + {recipe.cook_time}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                                Serves {recipe.servings}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {formatDate(recipe.created_at)}
                                            </span>
                                        </div>
                                        {recipe.tags_list && recipe.tags_list.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {recipe.tags_list.slice(0, 2).map(tag => (
                                                    <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {getRecentRecipes().length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    No recent recipes
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Recent Users */}
                {activeSection === 'users' && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                    <span className="text-xl text-white">👥</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">New Users</h2>
                                    <p className="text-gray-600">Recently registered users</p>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {getRecentUsers().map((user, index) => {
                                const isVisible = visibleItems.has(`user-${user.id}`);
                                
                                return (
                                    <div 
                                        key={user.id}
                                        data-item-id={`user-${user.id}`}
                                        className={`activity-item p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 transform hover:scale-[1.02] ${
                                            isVisible ? 'animate-slide-up' : 'opacity-0 translate-y-4'
                                        }`}
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{user.full_name || 'Unknown User'}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-2">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                                    user.is_staff 
                                                        ? 'bg-purple-100 text-purple-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {user.is_staff ? '👨‍💼 Staff' : '👤 User'}
                                                </span>
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                                    user.is_active 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {user.is_active ? '✅ Active' : '❌ Inactive'}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {formatDate(user.date_joined)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            {getRecentUsers().length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    No recent users
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Quick Stats Panel */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-xl border border-gray-200 p-6 animate-slide-up">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Insights</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <span className="text-lg">📈</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Order Growth</p>
                                    <p className="text-sm text-gray-500">Last 30 days</p>
                                </div>
                            </div>
                            <span className="text-green-600 font-bold">+23%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-lg">👥</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">User Engagement</p>
                                    <p className="text-sm text-gray-500">Active users</p>
                                </div>
                            </div>
                            <span className="text-blue-600 font-bold">+12%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <span className="text-lg">🍳</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Recipe Views</p>
                                    <p className="text-sm text-gray-500">This month</p>
                                </div>
                            </div>
                            <span className="text-purple-600 font-bold">+45%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewScreen;