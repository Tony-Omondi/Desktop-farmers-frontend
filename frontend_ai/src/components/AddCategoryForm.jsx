import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const BASE_URL = 'https://arifarm.onrender.com';

const AddCategoryForm = () => {
    const [formData, setFormData] = useState({ 
        name: '', 
        slug: '',
        description: '',
        is_active: true
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef(null);
    const successRef = useRef(null);

    // Auto-scroll to success message
    useEffect(() => {
        if (success && successRef.current) {
            successRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }, [success]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === 'checkbox' ? checked : value 
        });
        
        // Auto-generate slug from name
        if (name === 'name') {
            const generatedSlug = value
                .toLowerCase()
                .replace(/[^a-z0-9 -]/g, '') // Remove invalid chars
                .replace(/\s+/g, '-')        // Replace spaces with -
                .replace(/-+/g, '-');        // Replace multiple - with single -
            
            setFormData(prev => ({ 
                ...prev, 
                name: value,
                slug: prev.slug || generatedSlug 
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');
        
        // DETECT: Edit (has id) vs Create (no id)
        const isEditing = formData.id !== undefined;
        const url = isEditing 
            ? `${BASE_URL}/api/adamin/categories/${formData.id}/`  // UPDATE
            : `${BASE_URL}/api/adamin/categories/create/`;        // CREATE
        
        const method = isEditing ? axios.put : axios.post;
        
        try {
            await method(url, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });
            
            const action = isEditing ? 'updated' : 'created';
            setSuccess(`🎉 Category ${action} successfully!`);
            
            // Reset form (remove id for next create)
            setFormData({ 
                name: '', 
                slug: '',
                description: '',
                is_active: true
            });
            
            // Success animation
            if (formRef.current) {
                formRef.current.classList.add('animate-pulse-success');
                setTimeout(() => formRef.current?.classList.remove('animate-pulse-success'), 2000);
            }
        } catch (err) {
            setError(err.response?.data?.detail || 
                     err.response?.data?.message || 
                     'Failed to save category');
            
            // Error shake
            if (formRef.current) {
                formRef.current.classList.add('animate-shake');
                setTimeout(() => formRef.current?.classList.remove('animate-shake'), 500);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSlugEdit = (e) => {
        setFormData({ ...formData, slug: e.target.value });
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Enhanced Header */}
            <div className="text-center mb-8 animate-slide-down">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                    Category Management
                </h1>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Create and manage product categories to organize your inventory effectively
                </p>
            </div>

            {/* Enhanced Form Section */}
            <div 
                ref={formRef}
                className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                d={formData.id ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {formData.id ? `Edit "${formData.name}"` : 'Create New Category'}
                        </h2>
                        <p className="text-gray-600">
                            {formData.id ? 'Update category details' : 'Add a new category to organize your products'}
                        </p>
                    </div>
                </div>
                
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
                    <div 
                        ref={successRef}
                        className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl animate-slide-up flex items-start gap-3"
                    >
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="text-green-700 font-medium">{success}</div>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Field */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span>Category Name</span>
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                                placeholder="e.g., Electronics, Clothing, Books"
                                required
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    {/* Slug Field */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <label htmlFor="slug" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span>Slug</span>
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="slug"
                                name="slug"
                                value={formData.slug}
                                onChange={handleSlugEdit}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-gray-400 font-mono text-sm"
                                placeholder="e.g., electronics, clothing, books"
                                required
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            URL-friendly version. Use lowercase, numbers, and hyphens only.
                        </p>
                    </div>
                    
                    {/* Description Field */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-3">
                            Description
                        </label>
                        <div className="relative">
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-gray-400 resize-none"
                                placeholder="Brief description of this category..."
                            />
                            <div className="absolute right-3 top-3">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    {/* Active Checkbox */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-emerald-300 transition-all duration-300">
                            <input
                                id="is_active"
                                name="is_active"
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={handleChange}
                                className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded transition-all duration-200"
                            />
                            <label htmlFor="is_active" className="ml-3 block text-sm font-medium text-gray-700">
                                <span className="text-lg">✅</span> Category is active and visible to customers
                            </label>
                        </div>
                    </div>
                    
                    {/* Submit Button */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                                isLoading 
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-700 hover:to-cyan-700 shadow-lg hover:shadow-xl'
                            }`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>{formData.id ? 'Saving...' : 'Creating...'}</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                            d={formData.id ? "M5 13l4 4L19 7" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                                    </svg>
                                    <span>{formData.id ? 'Save Changes' : 'Create Category'}</span>
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCategoryForm;