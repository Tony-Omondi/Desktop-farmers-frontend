import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const AdminOrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setIsLoading(true);
                const accessToken = localStorage.getItem('access_token');
                if (!accessToken) {
                    navigate('/adamin/login');
                    return;
                }
                const response = await axios.get(`${BASE_URL}/api/adamin/orders/${orderId}/`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                console.log('Order details:', response.data);
                setOrder(response.data);
            } catch (err) {
                console.error('Order details error:', err.response?.data);
                setError(err.response?.data?.detail || 'Failed to load order details');
                if (err.response?.status === 401) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    navigate('/adamin/login');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrderDetails();
    }, [orderId, navigate]);

    const updateOrderStatus = async (newStatus) => {
        if (!order) return;
        
        setUpdatingStatus(true);
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.patch(
                `${BASE_URL}/api/adamin/orders/${orderId}/`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            
            setOrder(response.data.order);
            setStatusMessage(`Status updated to: ${newStatus}`);
            setTimeout(() => setStatusMessage(''), 3000);
        } catch (err) {
            setError(`Failed to update status: ${err.response?.data?.message || err.message}`);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const formatPrice = (price) => {
        return parseFloat(price).toLocaleString('en-KE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
            'paid': { color: 'bg-emerald-100 text-emerald-800', label: 'Paid' },
            'shipped': { color: 'bg-purple-100 text-purple-800', label: 'Shipped' },
            'delivered': { color: 'bg-green-100 text-green-800', label: 'Delivered' },
            'cancelled': { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
        };
        const config = statusConfig[status?.toLowerCase()] || { color: 'bg-gray-100 text-gray-800', label: status };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-4">
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                    {error}
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="max-w-7xl mx-auto p-4">
                <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg border border-yellow-200">
                    Order not found
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Order #{order.order_id} 
                        {getStatusBadge(order.status)}
                    </h1>
                    <button
                        onClick={() => navigate('/adamin')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>

                {/* ✅ USER INFO SECTION */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="font-medium">{order.user.full_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium">{order.user.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="font-medium">{order.user.phone_number || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* ✅ STATUS UPDATE SECTION - ONLY VALID STATUSES! */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Update Order Status</h2>
                    <div className="flex flex-wrap gap-3 mb-4">
                        {['pending', 'paid', 'shipped', 'delivered', 'cancelled'].map(status => (  // ✅ ONLY 5 VALID!
                            <button
                                key={status}
                                onClick={() => updateOrderStatus(status)}
                                disabled={updatingStatus || order.status.toLowerCase() === status}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    order.status.toLowerCase() === status
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                    {updatingStatus && (
                        <div className="flex items-center text-blue-600">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                            Updating status...
                        </div>
                    )}
                    {statusMessage && (
                        <div className="mt-2 p-2 bg-green-50 text-green-700 rounded text-sm">
                            {statusMessage}
                        </div>
                    )}
                </div>

                {/* ✅ ORDER SUMMARY */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div><span className="text-gray-600">Total Amount:</span> KSh {formatPrice(order.total_amount)}</div>
                        <div><span className="text-gray-600">Payment Status:</span> {getStatusBadge(order.payment_status)}</div>
                        <div><span className="text-gray-600">Payment Mode:</span> {order.payment_mode}</div>
                        <div><span className="text-gray-600">Coupon:</span> {order.coupon?.coupon_code || 'None'}</div>
                    </div>
                </div>

                {/* ✅ ORDER ITEMS TABLE */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Items ({order.order_items?.length || 0})</h2>
                    {order.order_items && order.order_items.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-600">
                                        <th className="p-3">Product</th>
                                        <th className="p-3">Quantity</th>
                                        <th className="p-3">Price</th>
                                        <th className="p-3">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.order_items.map(item => (
                                        <tr key={item.product.id} className="border-t hover:bg-gray-50">
                                            <td className="p-3 flex items-center">
                                                {item.product.images && item.product.images.length > 0 ? (
                                                    <img
                                                        src={item.product.images[0].image}
                                                        alt={item.product.name}
                                                        className="w-12 h-12 object-cover rounded mr-3"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-200 rounded mr-3 flex items-center justify-center text-gray-400">
                                                        No Image
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="font-medium">{item.product.name}</span>
                                                    <p className="text-xs text-gray-500">{item.product.description?.substring(0, 50)}...</p>
                                                </div>
                                            </td>
                                            <td className="p-3">{item.quantity}</td>
                                            <td className="p-3">KSh {formatPrice(item.product_price)}</td>
                                            <td className="p-3 font-semibold">KSh {formatPrice(item.quantity * item.product_price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-gray-500">No items in this order</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetails;