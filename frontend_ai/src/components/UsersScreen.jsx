const UsersScreen = ({ filteredData }) => (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Users</h2>
            <span className="text-gray-500">{filteredData.length} users</span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-100 text-gray-600">
                        <th className="p-3">Full Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Staff</th>
                        <th className="p-3">Active</th>
                        <th className="p-3">Joined</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map(user => (
                        <tr key={user.id} className="border-t hover:bg-gray-50">
                            <td className="p-3">{user.full_name}</td>
                            <td className="p-3">{user.email}</td>
                            <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                    user.is_staff ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {user.is_staff ? 'Yes' : 'No'}
                                </span>
                            </td>
                            <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {user.is_active ? 'Yes' : 'No'}
                                </span>
                            </td>
                            <td className="p-3">{new Date(user.date_joined).toLocaleDateString('en-US', { timeZone: 'Africa/Nairobi' })}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default UsersScreen;