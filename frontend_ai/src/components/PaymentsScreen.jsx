import { useState, useEffect, useRef } from 'react';

const PaymentsScreen = ({ filteredData }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [visiblePayments, setVisiblePayments] = useState(new Set());
    const tableRef = useRef(null);

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisiblePayments(prev => new Set(prev).add(entry.target.dataset.paymentId));
                    }
                });
            },
            { 
                threshold: 0.1,
                rootMargin: '50px'
            }
        );

        const paymentRows = document.querySelectorAll('.payment-row');
        paymentRows.forEach(row => observer.observe(row));

        return () => observer.disconnect();
    }, [filteredData]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortedData = () => {
        if (!sortConfig.key) return filteredData;

        return [...filteredData].sort((a, b) => {
            let aValue, bValue;

            if (sortConfig.key === 'amount') {
                aValue = parseFloat(a.payment.amount);
                bValue = parseFloat(b.payment.amount);
            } else if (sortConfig.key === 'created_at') {
                aValue = new Date(a.payment.created_at);
                bValue = new Date(b.payment.created_at);
            } else if (sortConfig.key === 'status') {
                aValue = a.payment.payment_status;
                bValue = b.payment.payment_status;
            } else {
                aValue = a[sortConfig.key];
                bValue = b[sortConfig.key];
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };

    const handleRowClick = (order) => {
        setSelectedPayment(order);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedPayment(null), 300);
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
            failed: { 
                class: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200',
                icon: '❌',
                label: 'Failed'
            },
            refunded: { 
                class: 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200',
                icon: '↩️',
                label: 'Refunded'
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
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Africa/Nairobi'
        });
    };

    const sortedData = getSortedData();

    return (
        <div className="animate-fade-in">
            {/* Enhanced Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 animate-slide-down">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent">
                        Payment Records
                    </h2>
                    <p className="text-gray-600 mt-2">Manage and monitor all payment transactions</p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-xl shadow-lg">
                        <span className="font-semibold">{filteredData.length}</span>
                        <span className="ml-2">{filteredData.length === 1 ? 'Payment' : 'Payments'}</span>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            {filteredData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-slide-up">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Completed</p>
                                <p className="text-2xl font-bold text-green-700">
                                    {filteredData.filter(order => order.payment.payment_status === 'completed').length}
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
                                    {filteredData.filter(order => order.payment.payment_status === 'pending').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <span className="text-xl">⏳</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-2xl border border-red-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-600">Failed</p>
                                <p className="text-2xl font-bold text-red-700">
                                    {filteredData.filter(order => order.payment.payment_status === 'failed').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-xl">❌</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-2xl border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Total Amount</p>
                                <p className="text-2xl font-bold text-blue-700">
                                    {formatCurrency(filteredData.reduce((sum, order) => sum + parseFloat(order.payment.amount), 0))}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xl">💰</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden animate-scale-in">
                <div className="overflow-x-auto">
                    <table className="w-full" ref={tableRef}>
                        <thead>
                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                {[
                                    { key: 'reference', label: 'Reference', sortable: true },
                                    { key: 'order_id', label: 'Order ID', sortable: true },
                                    { key: 'amount', label: 'Amount', sortable: true },
                                    { key: 'status', label: 'Status', sortable: true },
                                    { key: 'created_at', label: 'Created Date', sortable: true }
                                ].map(column => (
                                    <th 
                                        key={column.key}
                                        className={`p-4 text-left text-sm font-semibold text-gray-700 cursor-pointer transition-colors hover:bg-gray-200 ${
                                            sortConfig.key === column.key ? 'bg-gray-200' : ''
                                        }`}
                                        onClick={() => column.sortable && handleSort(column.key)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {column.label}
                                            {column.sortable && (
                                                <div className="flex flex-col">
                                                    <svg 
                                                        className={`w-3 h-3 ${sortConfig.key === column.key && sortConfig.direction === 'asc' ? 'text-emerald-600' : 'text-gray-400'}`}
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                                    </svg>
                                                    <svg 
                                                        className={`w-3 h-3 ${sortConfig.key === column.key && sortConfig.direction === 'desc' ? 'text-emerald-600' : 'text-gray-400'}`}
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.map((order, index) => {
                                const statusConfig = getStatusConfig(order.payment.payment_status);
                                const isVisible = visiblePayments.has(order.payment.reference);
                                
                                return (
                                    <tr 
                                        key={order.payment.reference}
                                        data-payment-id={order.payment.reference}
                                        className={`payment-row border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-emerald-50 transition-all duration-300 cursor-pointer transform hover:scale-[1.01] ${
                                            isVisible ? 'animate-slide-up' : 'opacity-0 translate-y-4'
                                        }`}
                                        style={{ 
                                            animationDelay: `${index * 0.05}s`,
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                        onClick={() => handleRowClick(order)}
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {order.payment.reference || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-mono">
                                                        {order.payment.payment_method || 'Unknown'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-gray-900">#{order.order_id}</div>
                                            <div className="text-xs text-gray-500">Order</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                                {formatCurrency(order.payment.amount)}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.class}`}>
                                                <span>{statusConfig.icon}</span>
                                                {statusConfig.label}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-gray-900">{formatDate(order.payment.created_at)}</div>
                                            <div className="text-xs text-gray-500">Nairobi Time</div>
                                        </td>
                                    </tr>
                                );
                            })}
                            
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center animate-pulse">
                                        <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No payment records found</h3>
                                        <p className="text-gray-500 max-w-md mx-auto">
                                            Some orders (e.g., cash payments) have no payment record. 
                                            Payment records will appear here when online payments are processed.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Detail Modal */}
            {isModalOpen && selectedPayment && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform animate-scale-in shadow-2xl border border-white/20">
                        <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Payment Details</h2>
                                    <p className="text-gray-600 mt-1">Complete payment information</p>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-sm font-medium text-gray-500">Reference</p>
                                    <p className="font-semibold text-gray-900">{selectedPayment.payment.reference || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-sm font-medium text-gray-500">Order ID</p>
                                    <p className="font-semibold text-gray-900">#{selectedPayment.order_id}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-sm font-medium text-gray-500">Amount</p>
                                    <p className="font-bold text-xl bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                        {formatCurrency(selectedPayment.payment.amount)}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                                        getStatusConfig(selectedPayment.payment.payment_status).class
                                    }`}>
                                        <span>{getStatusConfig(selectedPayment.payment.payment_status).icon}</span>
                                        {getStatusConfig(selectedPayment.payment.payment_status).label}
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-sm font-medium text-gray-500">Payment Method</p>
                                    <p className="font-semibold text-gray-900 capitalize">
                                        {selectedPayment.payment.payment_method || 'Unknown'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-sm font-medium text-gray-500">Created</p>
                                    <p className="font-semibold text-gray-900">{formatDate(selectedPayment.payment.created_at)}</p>
                                </div>
                            </div>

                            {selectedPayment.payment.payment_status === 'failed' && (
                                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium text-red-800">Payment Failed</p>
                                            <p className="text-sm text-red-600">This payment transaction was not completed successfully.</p>
                                        </div>
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

export default PaymentsScreen;