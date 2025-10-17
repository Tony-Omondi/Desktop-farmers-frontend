import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const AddRecipeForm = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        ingredients: '',
        instructions: '',
        review: '',
        prep_time: '',
        cook_time: '',
        servings: '',
        category: '',
        tags: [],
        image_file: null,
    });
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const formRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/recipe-categories/`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                console.log('Recipe categories fetched:', response.data);
                setCategories(response.data);
            } catch (err) {
                console.error('Fetch categories error:', err.response?.data || err.message);
                setError('Failed to load recipe categories');
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

    const handleTagsChange = (e) => {
        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
        setFormData({ ...formData, tags });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
            setFormData({ ...formData, image_file: file });
        } else {
            setError('Please select a valid image under 5MB');
        }
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
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
            setFormData({ ...formData, image_file: file });
        } else {
            setError('Please drop a valid image under 5MB');
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');
        setUploadProgress(0);

        try {
            const form = new FormData();
            form.append('title', formData.title);
            form.append('description', formData.description);
            form.append('ingredients', formData.ingredients);
            form.append('instructions', formData.instructions);
            form.append('review', formData.review);
            form.append('prep_time', formData.prep_time);
            form.append('cook_time', formData.cook_time);
            form.append('servings', parseInt(formData.servings) || 1);
            if (formData.category) form.append('category_id', formData.category);
            formData.tags.forEach(tag => form.append('tags', tag));
            if (formData.image_file) form.append('image', formData.image_file);

            console.log('Submitting recipe data:', {
                title: formData.title,
                prep_time: formData.prep_time,
                cook_time: formData.cook_time,
                servings: formData.servings,
                tags: formData.tags,
            });

            const response = await axios.post(`${BASE_URL}/api/recipes/`, form, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(progress);
                },
            });

            console.log('Recipe creation response:', response.data);
            setSuccess('🎉 Recipe created successfully! Your culinary masterpiece is ready to share!');
            
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
                    title: '', description: '', ingredients: '', instructions: '', review: '',
                    prep_time: '', cook_time: '', servings: '', category: '', tags: [], image_file: null 
                });
                setUploadProgress(0);
            }, 1000);
            
        } catch (err) {
            console.error('Recipe creation error:', err.response?.data || err.message);
            setError(
                err.response?.data?.detail ||
                Object.entries(err.response?.data || {})
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ') ||
                'Failed to create recipe'
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
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-orange-700 bg-clip-text text-transparent mb-3">
                    Create New Recipe
                </h1>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Share your culinary masterpiece with detailed ingredients, instructions, and mouth-watering photos
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
                {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mb-6 animate-slide-up">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Uploading Recipe...</span>
                            <span className="text-sm text-gray-500">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information Section */}
                    <div className="animate-slide-up">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                <span className="text-xl text-white">🍽️</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Basic Information</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Recipe Title */}
                            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <span>Recipe Title</span>
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                                        placeholder="e.g. Nyama Choma, Ugali with Sukuma Wiki"
                                        required
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/50 backdrop-blur-sm appearance-none"
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

                    {/* Cooking Details Section */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center">
                                <span className="text-xl text-white">⏱️</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Cooking Details</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Prep Time */}
                            <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                                <label htmlFor="prep_time" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <span>Prep Time</span>
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="prep_time"
                                        name="prep_time"
                                        value={formData.prep_time}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                                        placeholder="e.g. 15 minutes"
                                        required
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Cook Time */}
                            <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
                                <label htmlFor="cook_time" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <span>Cook Time</span>
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="cook_time"
                                        name="cook_time"
                                        value={formData.cook_time}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                                        placeholder="e.g. 1 hour"
                                        required
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Servings */}
                            <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
                                <label htmlFor="servings" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <span>Servings</span>
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        id="servings"
                                        name="servings"
                                        value={formData.servings}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                                        placeholder="e.g. 4"
                                        min="1"
                                        required
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tags Section */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                <span className="text-xl text-white">🏷️</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Tags & Description</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6">
                            {/* Tags */}
                            <div className="animate-slide-up" style={{ animationDelay: '0.8s' }}>
                                <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 mb-3">
                                    Tags (comma separated)
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="tags"
                                        name="tags"
                                        value={formData.tags.join(', ')}
                                        onChange={handleTagsChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                                        placeholder="e.g. Kenyan, Meat, BBQ, Traditional"
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {formData.tags.map((tag, index) => (
                                        <span 
                                            key={index}
                                            className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 text-sm rounded-full border border-blue-200 transition-all duration-300 hover:scale-105"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Description */}
                            <div className="animate-slide-up" style={{ animationDelay: '0.9s' }}>
                                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-3">
                                    Short Description
                                </label>
                                <div className="relative">
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-gray-400 resize-none"
                                        placeholder="Tell the story behind this recipe, what makes it special, or any cultural significance..."
                                    />
                                    <div className="absolute right-3 top-3">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recipe Content Section */}
                    <div className="animate-slide-up" style={{ animationDelay: '1.0s' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                <span className="text-xl text-white">📝</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Recipe Content</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6">
                            {/* Ingredients */}
                            <div className="animate-slide-up" style={{ animationDelay: '1.1s' }}>
                                <label htmlFor="ingredients" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <span>Ingredients</span>
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <textarea
                                        id="ingredients"
                                        name="ingredients"
                                        value={formData.ingredients}
                                        onChange={handleChange}
                                        rows={5}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-gray-400 resize-none font-mono text-sm"
                                        placeholder="1 kg goat meat&#10;2 tsp salt&#10;1 tsp black pepper&#10;2 cloves garlic, minced&#10;1 onion, sliced"
                                        required
                                    />
                                    <div className="absolute right-3 top-3">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Enter each ingredient on a new line. Include quantities and preparation notes.
                                </p>
                            </div>
                            
                            {/* Instructions */}
                            <div className="animate-slide-up" style={{ animationDelay: '1.2s' }}>
                                <label htmlFor="instructions" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <span>Instructions</span>
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <textarea
                                        id="instructions"
                                        name="instructions"
                                        value={formData.instructions}
                                        onChange={handleChange}
                                        rows={6}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-gray-400 resize-none"
                                        placeholder="1. Marinate the meat with salt, pepper, and garlic for 2 hours&#10;2. Preheat grill to medium heat&#10;3. Grill meat for 15-20 minutes each side&#10;4. Serve hot with your favorite sides"
                                        required
                                    />
                                    <div className="absolute right-3 top-3">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Write clear, step-by-step instructions. Number each step for better readability.
                                </p>
                            </div>
                            
                            {/* Review */}
                            <div className="animate-slide-up" style={{ animationDelay: '1.3s' }}>
                                <label htmlFor="review" className="block text-sm font-semibold text-gray-700 mb-3">
                                    Your Review & Tips
                                </label>
                                <div className="relative">
                                    <textarea
                                        id="review"
                                        name="review"
                                        value={formData.review}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-gray-400 resize-none"
                                        placeholder="Share your personal experience with this recipe, any variations you tried, or tips for perfect results..."
                                    />
                                    <div className="absolute right-3 top-3">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Upload Section */}
                    <div className="animate-slide-up" style={{ animationDelay: '1.4s' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                <span className="text-xl text-white">🖼️</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Recipe Image</h2>
                        </div>
                        
                        <input
                            ref={fileInputRef}
                            id="image-upload"
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                        />
                        
                        <div
                            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                                isDragging 
                                    ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 scale-[1.02]' 
                                    : 'border-gray-300 hover:border-orange-400 bg-gray-50/50'
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
                                    {isDragging ? 'Drop image here' : 'Drag and drop image here'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    or <span className="text-orange-600 font-medium hover:text-orange-700 transition-colors">browse files</span>
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                    Supports PNG, JPG, GIF • Max 5MB
                                </p>
                            </div>
                        </div>
                        
                        {/* Image Preview */}
                        {formData.image_file && (
                            <div className="mt-6 animate-scale-in">
                                <h4 className="text-sm font-semibold text-gray-700 mb-4">Image Preview</h4>
                                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-2xl border-2 border-orange-200">
                                    <img
                                        src={URL.createObjectURL(formData.image_file)}
                                        alt="Preview"
                                        className="w-24 h-24 object-cover rounded-xl border-2 border-orange-300"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{formData.image_file.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {(formData.image_file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, image_file: null })}
                                            className="mt-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                                        >
                                            Remove Image
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="animate-slide-up" style={{ animationDelay: '1.5s' }}>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                                isLoading 
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl'
                            }`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Creating Recipe...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-xl">🍽️</span>
                                    <span>Create Recipe Masterpiece</span>
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddRecipeForm;