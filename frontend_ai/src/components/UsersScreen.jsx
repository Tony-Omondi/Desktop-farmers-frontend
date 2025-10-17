import { useState, useEffect, useRef } from 'react';

const UsersScreen = ({ filteredData }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [visibleUsers, setVisibleUsers] = useState(new Set());
    const tableRef = useRef(null);

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisibleUsers(prev => new Set(prev).add(entry.target.dataset.userId));
                    }
                });
            },
            { 
                threshold: 0.1,
                rootMargin: '50px'
            }
        );

        const userRows = document.querySelectorAll('.user-row');
        userRows.forEach(row => observer.observe(row));

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

            if (sortConfig.key === 'date_joined') {
                aValue = new Date(a.date_joined);
                bValue = new Date(b.date_joined);
            } else if (sortConfig.key === 'is_staff') {
                aValue = a.is_staff;
                bValue = b.is_staff;
            } else if (sortConfig.key === 'is_active') {
                aValue = a.is_active;
                bValue = b.is_active;
            } else {
                aValue = a[sortConfig.key]?.toLowerCase();
                bValue = b[sortConfig.key]?.toLowerCase();
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

    const getFilteredData = () => {
        if (statusFilter === 'all') return getSortedData();
        if (statusFilter === 'active') return getSortedData().filter(user => user.is_active);
        if (statusFilter === 'staff') return getSortedData().filter(user => user.is_staff);
        if (statusFilter === 'inactive') return getSortedData().filter(user => !user.is_active);
        return getSortedData();
    };

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedUser(null), 300);
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

    const getStatusCounts = () => {
        const counts = {
            all: filteredData.length,
            active: filteredData.filter(user => user.is_active).length,
            inactive: filteredData.filter(user => !user.is_active).length,
            staff: filteredData.filter(user => user.is_staff).length,
        };
        return counts;
    };

    const statusCounts = getStatusCounts();
    const sortedAndFilteredData = getFilteredData();

    return (
        <div className="animate-fade-in">
            {/* Enhanced Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 animate-slide-down">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-purple-700 bg-clip-text text-transparent">
                        User Management
                    </h2>
                    <p className="text-gray-600 mt-2">View and manage system users</p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl shadow-lg">
                        <span className="font-semibold">{filteredData.length}</span>
                        <span className="ml-2">{filteredData.length === 1 ? 'User' : 'Users'}</span>
                    </div>
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/20 mb-8 animate-slide-up">
                <div className="flex flex-wrap gap-2">
                    {[
                        { key: 'all', label: 'All Users', count: statusCounts.all, color: 'from-gray-500 to-blue-500' },
                        { key: 'active', label: 'Active', count: statusCounts.active, color: 'from-green-500 to-emerald-500' },
                        { key: 'inactive', label: 'Inactive', count: statusCounts.inactive, color: 'from-red-500 to-pink-500' },
                        { key: 'staff', label: 'Staff', count: statusCounts.staff, color: 'from-purple-500 to-indigo-500' },
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
            {filteredData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-slide-up">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600">Total Users</p>
                                <p className="text-2xl font-bold text-purple-700">
                                    {statusCounts.all}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-xl">👥</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Active</p>
                                <p className="text-2xl font-bold text-green-700">
                                    {statusCounts.active}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-xl">✅</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-2xl border border-red-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-600">Inactive</p>
                                <p className="text-2xl font-bold text-red-700">
                                    {statusCounts.inactive}
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
                                <p className="text-sm font-medium text-blue-600">Staff Members</p>
                                <p className="text-2xl font-bold text-blue-700">
                                    {statusCounts.staff}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xl">👨‍💼</span>
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
                                    { key: 'full_name', label: 'User Profile', sortable: true },
                                    { key: 'email', label: 'Email Address', sortable: true },
                                    { key: 'is_staff', label: 'Staff Role', sortable: true },
                                    { key: 'is_active', label: 'Status', sortable: true },
                                    { key: 'date_joined', label: 'Join Date', sortable: true }
                                ].map(column => (
                                    <th 
                                        key={column.key}
                                        className={`p-4 text-left text-sm font-semibold text-gray-700 ${
                                            column.sortable ? 'cursor-pointer hover:bg-gray-200' : ''
                                        } transition-colors ${
                                            sortConfig.key === column.key ? 'bg-gray-200' : ''
                                        }`}
                                        onClick={() => column.sortable && handleSort(column.key)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {column.label}
                                            {column.sortable && (
                                                <div className="flex flex-col">
                                                    <svg 
                                                        className={`w-3 h-3 ${sortConfig.key === column.key && sortConfig.direction === 'asc' ? 'text-purple-600' : 'text-gray-400'}`}
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                                    </svg>
                                                    <svg 
                                                        className={`w-3 h-3 ${sortConfig.key === column.key && sortConfig.direction === 'desc' ? 'text-purple-600' : 'text-gray-400'}`}
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
                            {sortedAndFilteredData.map((user, index) => {
                                const isVisible = visibleUsers.has(user.id.toString());
                                
                                return (
                                    <tr 
                                        key={user.id}
                                        data-user-id={user.id}
                                        className={`user-row border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 transition-all duration-300 transform hover:scale-[1.01] cursor-pointer ${
                                            isVisible ? 'animate-slide-up' : 'opacity-0 translate-y-4'
                                        }`}
                                        style={{ 
                                            animationDelay: `${index * 0.05}s`,
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                        onClick={() => handleViewDetails(user)}
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">
                                                        {user.full_name || 'Unknown User'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">User ID: {user.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{user.email}</div>
                                            <div className="text-xs text-gray-500">Email</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                                                user.is_staff 
                                                    ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200' 
                                                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                                            }`}>
                                                <span>{user.is_staff ? '👨‍💼' : '👤'}</span>
                                                {user.is_staff ? 'Staff' : 'User'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                                                user.is_active 
                                                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
                                                    : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
                                            }`}>
                                                <span>{user.is_active ? '✅' : '❌'}</span>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-gray-900">{formatDate(user.date_joined)}</div>
                                            <div className="text-xs text-gray-500">Nairobi Time</div>
                                        </td>
                                    </tr>
                                );
                            })}
                            
                            {sortedAndFilteredData.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center animate-pulse">
                                        <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                                        <p className="text-gray-500 max-w-md mx-auto">
                                            {statusFilter === 'all' 
                                                ? "No users match your current criteria. Users will appear here when they register."
                                                : `No ${statusFilter} users found. Try selecting a different status filter.`
                                            }
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Detail Modal */}
            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform animate-scale-in shadow-2xl border border-white/20">
                        <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">User Details</h2>
                                    <p className="text-gray-600 mt-1">Complete user information</p>
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
                            {/* User Profile */}
                            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedUser.full_name || 'Unknown User'}</h3>
                                    <p className="text-gray-600">{selectedUser.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-sm font-medium text-gray-500">User ID</p>
                                    <p className="font-semibold text-gray-900">{selectedUser.id}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                                    <p className="font-semibold text-gray-900">{selectedUser.full_name || 'Not provided'}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-sm font-medium text-gray-500">Email Address</p>
                                    <p className="font-semibold text-gray-900">{selectedUser.email}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-sm font-medium text-gray-500">Staff Role</p>
                                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                                        selectedUser.is_staff 
                                            ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200' 
                                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                                    }`}>
                                        <span>{selectedUser.is_staff ? '👨‍💼' : '👤'}</span>
                                        {selectedUser.is_staff ? 'Staff Member' : 'Regular User'}
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-sm font-medium text-gray-500">Account Status</p>
                                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                                        selectedUser.is_active 
                                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
                                            : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
                                    }`}>
                                        <span>{selectedUser.is_active ? '✅' : '❌'}</span>
                                        {selectedUser.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-sm font-medium text-gray-500">Join Date</p>
                                    <p className="font-semibold text-gray-900">{formatDate(selectedUser.date_joined)}</p>
                                </div>
                            </div>

                            {/* Last Login Info if available */}
                            {selectedUser.last_login && (
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium text-blue-800">Last Login</p>
                                            <p className="text-sm text-blue-600">{formatDate(selectedUser.last_login)}</p>
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

export default UsersScreen;