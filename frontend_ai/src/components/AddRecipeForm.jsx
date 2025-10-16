// frontend_ai/src/components/AddRecipeForm.jsx
import { useState, useEffect, useCallback } from 'react';
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

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // ✅ FIXED: Correct URL
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

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

            // ✅ FIXED: Correct URL
            const response = await axios.post(`${BASE_URL}/api/recipes/`, form, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Recipe creation response:', response.data);
            setSuccess('Recipe created successfully! 🍽️');
            setFormData({ 
                title: '', description: '', ingredients: '', instructions: '', review: '',
                prep_time: '', cook_time: '', servings: '', category: '', tags: [], image_file: null 
            });
        } catch (err) {
            console.error('Recipe creation error:', err.response?.data || err.message);
            setError(
                err.response?.data?.detail ||
                Object.entries(err.response?.data || {})
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ') ||
                'Failed to create recipe'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add New Recipe 🍽️</h2>
                
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start">
                        <svg className="w-5 h-5 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div>{error}</div>
                    </div>
                )}
                
                {success && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-start">
                        <svg className="w-5 h-5 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>{success}</div>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Recipe Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                placeholder="e.g. Nyama Choma"
                                required
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Select Category</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="prep_time" className="block text-sm font-medium text-gray-700 mb-1">
                                Prep Time *
                            </label>
                            <input
                                type="text"
                                id="prep_time"
                                name="prep_time"
                                value={formData.prep_time}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                placeholder="e.g. 15 minutes"
                                required
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="cook_time" className="block text-sm font-medium text-gray-700 mb-1">
                                Cook Time *
                            </label>
                            <input
                                type="text"
                                id="cook_time"
                                name="cook_time"
                                value={formData.cook_time}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                placeholder="e.g. 1 hour"
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-1">
                            Servings *
                        </label>
                        <input
                            type="number"
                            id="servings"
                            name="servings"
                            value={formData.servings}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="e.g. 4"
                            min="1"
                            required
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                            Tags (comma separated)
                        </label>
                        <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={formData.tags.join(', ')}
                            onChange={handleTagsChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="e.g. Kenyan, Meat, BBQ"
                        />
                        <p className="text-xs text-gray-500 mt-1">Current: {formData.tags.join(', ') || 'None'}</p>
                    </div>
                    
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Short Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="Tell the story behind this recipe..."
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-1">
                            Ingredients *
                        </label>
                        <textarea
                            id="ingredients"
                            name="ingredients"
                            value={formData.ingredients}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="1 kg goat meat&#10;2 tsp salt&#10;1 tsp pepper"
                            required
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
                            Instructions *
                        </label>
                        <textarea
                            id="instructions"
                            name="instructions"
                            value={formData.instructions}
                            onChange={handleChange}
                            rows={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="1. Marinate meat for 2 hours&#10;2. Grill on medium heat&#10;3. Serve hot with ugali"
                            required
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-1">
                            Your Review
                        </label>
                        <textarea
                            id="review"
                            name="review"
                            value={formData.review}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="This recipe is a family favorite!"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Recipe Image
                        </label>
                        
                        <div
                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                                isDragging 
                                    ? 'border-emerald-500 bg-emerald-50' 
                                    : 'border-gray-300 hover:border-gray-400'
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('image-upload').click()}
                        >
                            <input
                                id="image-upload"
                                type="file"
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                            
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-900">
                                    Drag and drop image here, or click to select
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    PNG, JPG, GIF up to 5MB
                                </p>
                            </div>
                        </div>
                        
                        {formData.image_file && (
                            <div className="mt-4">
                                <img
                                    src={URL.createObjectURL(formData.image_file)}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded-lg"
                                />
                                <p className="text-sm text-gray-500 mt-1">{formData.image_file.name}</p>
                            </div>
                        )}
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                            isLoading 
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
                        }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Recipe...
                            </div>
                        ) : (
                            'Create Recipe 🍽️'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddRecipeForm;