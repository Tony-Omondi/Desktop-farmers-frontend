const OverviewScreen = ({ data, stats }) => (
    <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="text-lg font-medium mb-3">Recent Orders</h3>
                <div className="border rounded-lg overflow-hidden">
                    {data.orders.slice(0, 5).map(order => (
                        <div key={order.order_id} className="p-3 border-b last:border-b-0 hover:bg-gray-50">
                            <div className="flex justify-between">
                                <span className="font-medium">#{order.order_id}</span>
                                <span className="text-emerald-600">KSh {order.total_amount}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                                {order.user.email} • {new Date(order.created_at).toLocaleDateString('en-US', { timeZone: 'Africa/Nairobi' })}
                            </div>
                            <div className="text-sm mt-1">
                                Status: <span className={`px-2 py-1 rounded-full text-xs ${
                                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>{order.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-lg font-medium mb-3">New Recipes</h3>
                <div className="border rounded-lg overflow-hidden">
                    {data.recipes?.slice(0, 5).map(recipe => (
                        <div key={recipe.id} className="p-3 border-b last:border-b-0 hover:bg-gray-50">
                            <div className="font-medium">{recipe.title}</div>
                            <div className="text-sm text-gray-500">{recipe.category?.name || 'No Category'}</div>
                            <div className="text-sm mt-1">
                                Created: {new Date(recipe.created_at).toLocaleDateString('en-US', { timeZone: 'Africa/Nairobi' })}
                            </div>
                        </div>
                    )) || []}
                </div>
            </div>
        </div>
    </div>
);

export default OverviewScreen;