import { useState, useRef } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const AddRecipeCategory = () => {
    const [formData, setFormData] = useState({ name: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ name: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post(`${BASE_URL}/api/recipe-categories/`, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
            });

            console.log('Category created:', response.data);
            setSuccess(`🎉 "${response.data.name}" category created successfully! Start adding recipes to this category.`);
            
            // Success animation
            if (formRef.current) {
                formRef.current.classList.add('animate-pulse-success');
                setTimeout(() => {
                    formRef.current?.classList.remove('animate-pulse-success');
                }, 2000);
            }
            
            // Reset form
            setTimeout(() => {
                setFormData({ name: '' });
            }, 1000);
            
        } catch (err) {
            console.error('Create category error:', err.response?.data);
            setError(
                err.response?.data?.name?.[0] ||
                err.response?.data?.detail ||
                'Failed to create category'
            );
            
            // Error shake animation
            if (formRef.current) {
                formRef.current.classList.add('animate-shake');
                setTimeout(() => {
                    formRef.current?.classList.remove('animate-shake');
                }, 500);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            {/* Enhanced Header */}
            <div className="text-center mb-8 animate-slide-down">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-orange-700 bg-clip-text text-transparent mb-3">
                    Create Recipe Category
                </h1>
                <p className="text-gray-600 text-lg">
                    Organize your recipes with meaningful categories for better discovery
                </p>
            </div>

            <div 
                ref={formRef}
                className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500"
            >
                {/* Enhanced Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl animate-shake flex items-start gap-3">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="text-red-700 font-medium">{error}</div>
                    </div>
                )}
                
                {success && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl animate-slide-up flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="text-green-700 font-medium">{success}</div>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="animate-slide-up">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                <span className="text-2xl text-white">🏷️</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Category Details</h2>
                                <p className="text-gray-600">Create a new category for your recipes</p>
                            </div>
                        </div>
                        
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span>Category Name</span>
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-gray-400 text-lg"
                                placeholder="e.g. Kenyan BBQ, Desserts, Vegetarian, Traditional Dishes"
                                required
                                autoFocus
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Categories help users discover and organize recipes effectively!
                        </p>
                    </div>
                    
                    <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <button
                            type="submit"
                            disabled={isLoading || !formData.name.trim()}
                            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                                isLoading || !formData.name.trim()
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl'
                            }`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Creating Category...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-xl">🍽️</span>
                                    <span>Create Recipe Category</span>
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddRecipeCategory;