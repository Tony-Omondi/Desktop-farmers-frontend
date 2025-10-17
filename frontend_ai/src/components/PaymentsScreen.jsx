const PaymentsScreen = ({ filteredData }) => (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Payments</h2>
            <span className="text-gray-500">{filteredData.length} payments</span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-100 text-gray-600">
                        <th className="p-3">Reference</th>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Created</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map(order => (
                        <tr key={order.payment.reference} className="border-t hover:bg-gray-50">
                            <td className="p-3">{order.payment.reference || 'N/A'}</td>
                            <td className="p-3">#{order.order_id}</td>
                            <td className="p-3">KSh {order.payment.amount}</td>
                            <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                    order.payment.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                                    order.payment.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {order.payment.payment_status}
                                </span>
                            </td>
                            <td className="p-3">{new Date(order.payment.created_at).toLocaleDateString('en-US', { timeZone: 'Africa/Nairobi' })}</td>
                        </tr>
                    ))}
                    {filteredData.length === 0 && (
                        <tr>
                            <td colSpan="5" className="p-3 text-gray-500 text-center">
                                No payment records found. Some orders (e.g., cash payments) have no payment record.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

export default PaymentsScreen;