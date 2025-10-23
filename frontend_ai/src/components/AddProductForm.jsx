import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const BASE_URL = 'https://arifarm.onrender.com';

const AddProductForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        image_files: [],
    });
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const formRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/adamin/categories/`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                console.log('Categories fetched:', response.data);
                setCategories(response.data);
            } catch (err) {
                console.error('Fetch categories error:', err.response?.data || err.message);
                setError('Failed to load categories: ' + (err.response?.data?.detail || err.message));
            }
        };
        fetchCategories();
    }, []);

    // Auto-scroll to success message
    useEffect(() => {
        if (success && formRef.current) {
            formRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }, [success]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    };

    const handleFiles = useCallback((files) => {
        const validFiles = files.filter(file => 
            file.type.startsWith('image/') && 
            file.size <= 5 * 1024 * 1024 // 5MB limit
        );
        
        if (validFiles.length !== files.length) {
            setError('Some files were skipped. Only images under 5MB are allowed.');
        }
        
        setFormData(prev => ({ 
            ...prev, 
            image_files: [...prev.image_files, ...validFiles] 
        }));
    }, []);

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            image_files: prev.image_files.filter((_, i) => i !== index)
        }));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const form = new FormData();
            form.append('name', formData.name);
            form.append('description', formData.description);
            form.append('price', parseFloat(formData.price));
            form.append('stock', parseInt(formData.stock) || 0);
            if (formData.category) form.append('category', formData.category);
            formData.image_files.forEach(file => {
                form.append('image_files', file);
            });

            console.log('Submitting product data:', {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock) || 0,
                category: formData.category,
                image_files: formData.image_files.map(f => f.name),
            });

            const response = await axios.post(`${BASE_URL}/api/adamin/products/`, form, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress({ overall: progress });
                },
            });

            console.log('Product creation response:', response.data);
            setSuccess('🎉 Product created successfully!');
            
            // Success animation
            if (formRef.current) {
                formRef.current.classList.add('animate-pulse-success');
                setTimeout(() => {
                    formRef.current?.classList.remove('animate-pulse-success');
                }, 2000);
            }
            
            // Reset form
            setTimeout(() => {
                setFormData({ 
                    name: '', 
                    description: '', 
                    price: '', 
                    stock: '', 
                    category: '', 
                    image_files: [] 
                });
                setUploadProgress({});
            }, 1000);
            
        } catch (err) {
            console.error('Product creation error:', err.response?.data || err.message);
            setError(
                err.response?.data?.detail ||
                err.response?.data?.non_field_errors?.[0] ||
                Object.entries(err.response?.data || {})
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ') ||
                'Failed to create product: ' + err.message
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
        <div className="max-w-6xl mx-auto animate-fade-in">
            {/* Enhanced Header */}
            <div className="text-center mb-8 animate-slide-down">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                    Add New Product
                </h1>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Create amazing products for your store with detailed information and stunning images
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

                {/* Upload Progress */}
                {uploadProgress.overload && (
                    <div className="mb-6 animate-slide-up">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Uploading Images...</span>
                            <span className="text-sm text-gray-500">{uploadProgress.overall}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${uploadProgress.overall}%` }}
                            ></div>
                        </div>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information Section */}
                    <div className="animate-slide-up">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Basic Information</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Product Name */}
                            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <span>Product Name</span>
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
                                        placeholder="Enter product name"
                                        required
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Category */}
                            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-3">
                                    Category
                                </label>
                                <div className="relative">
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50 backdrop-blur-sm appearance-none"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Description</h2>
                        </div>
                        
                        <div className="relative">
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={5}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-gray-400 resize-none"
                                placeholder="Describe the product features, benefits, and specifications..."
                            />
                            <div className="absolute right-3 top-3">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Inventory Section */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Pricing & Inventory</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Price */}
                            <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
                                <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <span>Price ($)</span>
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>
                            
                            {/* Stock */}
                            <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
                                <label htmlFor="stock" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <span>Stock Quantity</span>
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        id="stock"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                                        placeholder="Enter quantity"
                                        min="0"
                                        required
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Upload Section */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Product Images</h2>
                        </div>
                        
                        <input
                            ref={fileInputRef}
                            id="file-upload"
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                        />
                        
                        <div
                            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                                isDragging 
                                    ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-cyan-50 scale-[1.02]' 
                                    : 'border-gray-300 hover:border-emerald-400 bg-gray-50/50'
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={triggerFileInput}
                        >
                            <div className="w-20 h-20 mx-auto mb-4 text-gray-400">
                                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            
                            <div className="space-y-2">
                                <p className="text-lg font-semibold text-gray-900">
                                    {isDragging ? 'Drop images here' : 'Drag and drop images here'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    or <span className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors">browse files</span>
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                    Supports PNG, JPG, GIF • Max 5MB per file
                                </p>
                            </div>
                        </div>
                        
                        {/* Image Previews */}
                        {formData.image_files.length > 0 && (
                            <div className="mt-6 animate-slide-up">
                                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    <span>Selected Images ({formData.image_files.length})</span>
                                    <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs">
                                        {formData.image_files.length} files
                                    </span>
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {formData.image_files.map((file, index) => (
                                        <div 
                                            key={index} 
                                            className="relative group animate-scale-in"
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 group-hover:border-emerald-300 transition-all duration-300">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeImage(index);
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110 shadow-lg"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                {file.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.8s' }}>
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
                                    <span>Creating Product...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span>Create Product</span>
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductForm;