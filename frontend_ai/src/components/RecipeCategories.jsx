import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'https://arifarm.onrender.com';

const RecipeCategories = () => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/recipe-categories/`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
            });
            setCategories(response.data);
        } catch (err) {
            setError('Failed to load categories');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}"? This cannot be undone!`)) return;

        setIsLoading(true);
        try {
            await axios.delete(`${BASE_URL}/api/recipe-categories/${id}/`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
            });
            setCategories(prev => prev.filter(cat => cat.id !== id));
            setSuccess(`"${name}" deleted successfully!`);
        } catch (err) {
            setError('Failed to delete category');
        } finally {
            setIsLoading(false);
        }
    };

    if (categories.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 mb-4">📁</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Recipe Categories</h3>
                <p className="text-gray-500">Create your first category to get started!</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                    Recipe Categories ({categories.length})
                </h2>
            </div>
            
            {error && (
                <div className="p-4 bg-red-50 border-b border-red-200">
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}
            
            {success && (
                <div className="p-4 bg-green-50 border-b border-green-200">
                    <p className="text-green-700 text-sm">{success}</p>
                </div>
            )}
            
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipes</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map((category) => (
                            <tr key={category.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">0</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleDelete(category.id, category.name)}
                                        disabled={isLoading}
                                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecipeCategories;