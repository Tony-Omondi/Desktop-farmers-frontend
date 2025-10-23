import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const OrdersScreen = ({ orders: initialOrders = [] }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [orders, setOrders] = useState(initialOrders);
    const [visibleOrders, setVisibleOrders] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const tableRef = useRef(null);

    useEffect(() => {
        setOrders(initialOrders);
        console.log('📦 Orders received:', initialOrders.length);
    }, [initialOrders]);

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisibleOrders(prev => new Set(prev).add(entry.target.dataset.orderId));
                    }
                });
            },
            { 
                threshold: 0.1,
                rootMargin: '50px'
            }
        );

        const orderRows = document.querySelectorAll('.order-row');
        orderRows.forEach(row => observer.observe(row));

        return () => observer.disconnect();
    }, [orders, statusFilter]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        setUpdatingStatus(true);
        try {
            const accessToken = localStorage.getItem('access_token');
            console.log('🔍 PATCHING:', `https://arifarm.onrender.com/api/adamin/orders/${orderId}/`);
            
            const response = await axios.patch(
                `https://arifarm.onrender.com/api/adamin/orders/${orderId}/`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            
            setOrders(prev => prev.map(order => 
                order.order_id === orderId ? { ...order, status: newStatus } : order
            ));
            
            // Update selected order if it's the one being updated
            if (selectedOrder && selectedOrder.order_id === orderId) {
                setSelectedOrder(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            console.error('❌ Error:', error.response?.data);
        }
        setUpdatingStatus(false);
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedOrder(null), 300);
    };

    const getStatusConfig = (status) => {
        const configs = {
            pending: { 
                class: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200',
                icon: '⏳', 
                label: 'Pending',
                color: 'from-yellow-500 to-amber-500'
            },
            paid: { 
                class: 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200',
                icon: '💳', 
                label: 'Paid',
                color: 'from-blue-500 to-cyan-500'
            },
            shipped: { 
                class: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200',
                icon: '🚚', 
                label: 'Shipped',
                color: 'from-purple-500 to-pink-500'
            },
            delivered: { 
                class: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200',
                icon: '✅', 
                label: 'Delivered',
                color: 'from-green-500 to-emerald-500'
            },
            cancelled: { 
                class: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200',
                icon: '❌', 
                label: 'Cancelled',
                color: 'from-red-500 to-pink-500'
            }
        };
        return configs[status] || configs.pending;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', { 
            style: 'currency', 
            currency: 'KES',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Africa/Nairobi' 
        });
    };

    const getStatusCounts = () => {
        const safeOrders = Array.isArray(orders) ? orders : [];
        return {
            all: safeOrders.length,
            pending: safeOrders.filter(o => o.status === 'pending').length,
            paid: safeOrders.filter(o => o.status === 'paid').length,
            shipped: safeOrders.filter(o => o.status === 'shipped').length,
            delivered: safeOrders.filter(o => o.status === 'delivered').length,
            cancelled: safeOrders.filter(o => o.status === 'cancelled').length,
        };
    };

    const getFilteredOrders = () => {
        let filtered = orders;
        
        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }
        
        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(order => 
                order.order_id.toLowerCase().includes(query) ||
                order.user?.email?.toLowerCase().includes(query) ||
                order.total_amount.toString().includes(query) ||
                order.status.toLowerCase().includes(query)
            );
        }
        
        return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    };

    const statusCounts = getStatusCounts();
    const filteredOrders = getFilteredOrders();

    return (
        <div className="animate-fade-in">
            {/* Enhanced Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 animate-slide-down">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent">
                        Order Management
                    </h2>
                    <p className="text-gray-600 mt-2">Manage and track customer orders efficiently</p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-xl shadow-lg">
                        <span className="font-semibold">{statusCounts.all}</span>
                        <span className="ml-2">{statusCounts.all === 1 ? 'Order' : 'Orders'}</span>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/20 mb-6 animate-slide-up">
                <div className="relative">
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search orders by ID, email, amount, or status..."
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/20 mb-8 animate-slide-up">
                <div className="flex flex-wrap gap-2">
                    {[
                        { key: 'all', label: 'All Orders', count: statusCounts.all, color: 'from-gray-500 to-blue-500' },
                        { key: 'pending', label: 'Pending', count: statusCounts.pending, color: 'from-yellow-500 to-amber-500' },
                        { key: 'paid', label: 'Paid', count: statusCounts.paid, color: 'from-blue-500 to-cyan-500' },
                        { key: 'shipped', label: 'Shipped', count: statusCounts.shipped, color: 'from-purple-500 to-pink-500' },
                        { key: 'delivered', label: 'Delivered', count: statusCounts.delivered, color: 'from-green-500 to-emerald-500' },
                        { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled, color: 'from-red-500 to-pink-500' },
                    ].map(status => (
                        <button
                            key={status.key}
                            onClick={() => setStatusFilter(status.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                                statusFilter === status.key
                                    ? `bg-gradient-to-r ${status.color} text-white shadow-lg`
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <span>{status.label}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                                statusFilter === status.key
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-300 text-gray-700'
                            }`}>
                                {status.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Overview */}
            {orders.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-slide-up">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-2xl border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-blue-700">
                                    {formatCurrency(orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0))}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xl">💰</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Delivered</p>
                                <p className="text-2xl font-bold text-green-700">
                                    {statusCounts.delivered}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-xl">✅</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-2xl border border-yellow-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-700">
                                    {statusCounts.pending}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <span className="text-xl">⏳</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600">Paid</p>
                                <p className="text-2xl font-bold text-purple-700">
                                    {statusCounts.paid}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-xl">💳</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Orders Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden animate-scale-in">
                <div className="overflow-x-auto">
                    <table className="w-full" ref={tableRef}>
                        <thead>
                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <th className="p-4 text-left text-sm font-semibold text-gray-700">Order ID</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-700">Customer</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-700">Total</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-700">Date</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order, index) => {
                                const statusConfig = getStatusConfig(order.status);
                                const isVisible = visibleOrders.has(order.order_id);
                                
                                return (
                                    <tr 
                                        key={order.order_id}
                                        data-order-id={order.order_id}
                                        className={`order-row border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-emerald-50 transition-all duration-300 transform hover:scale-[1.01] ${
                                            isVisible ? 'animate-slide-up' : 'opacity-0 translate-y-4'
                                        }`}
                                        style={{ 
                                            animationDelay: `${index * 0.05}s`,
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">#{order.order_id}</div>
                                                    <div className="text-xs text-gray-500">Order</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{order.user?.email || 'N/A'}</div>
                                            <div className="text-xs text-gray-500">Customer</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                                {formatCurrency(order.total_amount)}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.class}`}>
                                                <span>{statusConfig.icon}</span>
                                                {statusConfig.label}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-gray-900">{formatDate(order.created_at)}</div>
                                            <div className="text-xs text-gray-500">Nairobi Time</div>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleViewDetails(order)}
                                                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center animate-pulse">
                                        <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                                        <p className="text-gray-500 max-w-md mx-auto">
                                            {statusFilter === 'all' && !searchQuery
                                                ? "No orders available. Orders will appear here when customers place orders."
                                                : `No ${statusFilter} orders found. Try selecting a different status filter or search term.`
                                            }
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Enhanced Modal */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform animate-scale-in shadow-2xl border border-white/20">
                        <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                                    <p className="text-gray-600 mt-1">Order #{selectedOrder.order_id}</p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-300 transform hover:scale-110"
                                >
                                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Order Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-sm font-medium text-gray-500">Customer</p>
                                    <p className="font-semibold text-gray-900">{selectedOrder.user?.email || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-sm font-medium text-gray-500">Order Total</p>
                                    <p className="font-bold text-xl bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                        {formatCurrency(selectedOrder.total_amount)}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-sm font-medium text-gray-500">Order Date</p>
                                    <p className="font-semibold text-gray-900">{formatDate(selectedOrder.created_at)}</p>
                                </div>
                            </div>

                            {/* Status Management */}
                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Update Order Status</h3>
                                <div className="flex flex-wrap gap-3">
                                    {['pending', 'paid', 'shipped', 'delivered', 'cancelled'].map(status => {
                                        const statusConfig = getStatusConfig(status);
                                        const isCurrent = selectedOrder.status === status;
                                        
                                        return (
                                            <button 
                                                key={status}
                                                onClick={() => handleStatusUpdate(selectedOrder.order_id, status)}
                                                disabled={updatingStatus || isCurrent}
                                                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                                                    isCurrent
                                                        ? `bg-gradient-to-r ${statusConfig.color} text-white shadow-lg`
                                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                                }`}
                                            >
                                                <span>{statusConfig.icon}</span>
                                                <span>{statusConfig.label}</span>
                                                {updatingStatus && isCurrent && (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                {updatingStatus && (
                                    <p className="text-sm text-blue-600 mt-3 flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        Updating status...
                                    </p>
                                )}
                            </div>

                            {/* Order Items (if available) */}
                            {selectedOrder.items && selectedOrder.items.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h3>
                                    <div className="space-y-3">
                                        {selectedOrder.items.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    {item.product?.images?.[0] && (
                                                        <img 
                                                            src={item.product.images[0].image} 
                                                            alt={item.product.name}
                                                            className="w-12 h-12 rounded-lg object-cover"
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.product?.name || 'Product'}</p>
                                                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900">
                                                        {formatCurrency(item.price * item.quantity)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatCurrency(item.price)} each
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersScreen;