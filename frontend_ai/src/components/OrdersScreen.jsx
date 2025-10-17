const OrdersScreen = ({ filteredData }) => (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Orders</h2>
            <span className="text-gray-500">{filteredData.length} orders</span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-100 text-gray-600">
                        <th className="p-3">Order ID</th>
                        <th className="p-3">User</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Payment Status</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map(order => (
                        <tr key={order.order_id} className="border-t hover:bg-gray-50">
                            <td className="p-3 font-medium">#{order.order_id}</td>
                            <td className="p-3">{order.user.email}</td>
                            <td className="p-3">KSh {order.total_amount}</td>
                            <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {order.status}
                                </span>
                            </td>
                            <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                    order.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                                    order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {order.payment_status}
                                </span>
                            </td>
                            <td className="p-3">{new Date(order.created_at).toLocaleDateString('en-US', { timeZone: 'Africa/Nairobi' })}</td>
                            <td className="p-3">
                                <button className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">
                                    View Details
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default OrdersScreen;