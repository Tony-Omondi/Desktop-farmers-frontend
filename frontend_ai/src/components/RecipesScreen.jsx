import { useState, useEffect, useRef } from 'react';

const RecipesScreen = ({ filteredData, onEdit }) => {
    const [imageErrors, setImageErrors] = useState({});
    const [loadedImages, setLoadedImages] = useState({});
    const [visibleRecipes, setVisibleRecipes] = useState(new Set());
    const [hoveredRecipe, setHoveredRecipe] = useState(null);
    const gridRef = useRef(null);

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisibleRecipes(prev => new Set(prev).add(entry.target.dataset.recipeId));
                    }
                });
            },
            { 
                threshold: 0.1,
                rootMargin: '50px'
            }
        );

        const recipeCards = document.querySelectorAll('.recipe-card');
        recipeCards.forEach(card => observer.observe(card));

        return () => observer.disconnect();
    }, [filteredData]);

    const handleImageError = (recipeId) => {
        setImageErrors(prev => ({ ...prev, [recipeId]: true }));
    };

    const handleImageLoad = (recipeId) => {
        setLoadedImages(prev => ({ ...prev, [recipeId]: true }));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'Africa/Nairobi'
        });
    };

    const getDifficultyLevel = (prepTime, cookTime) => {
        const totalTime = (parseInt(prepTime) || 0) + (parseInt(cookTime) || 0);
        if (totalTime <= 15) return { level: 'Easy', color: 'from-green-500 to-emerald-500', icon: '🟢' };
        if (totalTime <= 30) return { level: 'Medium', color: 'from-yellow-500 to-amber-500', icon: '🟡' };
        return { level: 'Advanced', color: 'from-red-500 to-orange-500', icon: '🔴' };
    };

    if (!filteredData || filteredData.length === 0) {
        return (
            <div className="text-center py-16 animate-fade-in">
                <div className="w-32 h-32 mx-auto mb-6 text-gray-300 animate-bounce-slow">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" 
                              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 animate-slide-up">
                    No recipes found
                </h3>
                <p className="text-gray-600 text-lg mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    Try adjusting your search criteria or create a new recipe
                </p>
                <div className="animate-pulse-slow">
                    <div className="w-48 h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mx-auto mb-2"></div>
                    <div className="w-36 h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Enhanced Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 animate-slide-down">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-orange-700 bg-clip-text text-transparent">
                        Recipe Collection
                    </h2>
                    <p className="text-gray-600 mt-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                        Discover and manage your culinary creations
                    </p>
                </div>
                <div className="animate-slide-right mt-4 sm:mt-0">
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <span className="w-2 h-2 bg-white rounded-full mr-2 animate-ping"></span>
                        {filteredData.length} {filteredData.length === 1 ? 'recipe' : 'recipes'}
                    </span>
                </div>
            </div>

            {/* Enhanced Recipes Grid */}
            <div 
                ref={gridRef}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                {filteredData.map((recipe, index) => {
                    const difficulty = getDifficultyLevel(recipe.prep_time, recipe.cook_time);
                    const isVisible = visibleRecipes.has(recipe.id.toString());
                    const animationDelay = `${index * 0.1}s`;
                    const isHovered = hoveredRecipe === recipe.id;
                    
                    return (
                        <div 
                            key={recipe.id}
                            data-recipe-id={recipe.id}
                            className={`
                                recipe-card group bg-white rounded-2xl border-2 border-gray-100 
                                hover:border-orange-300 hover:shadow-2xl transition-all duration-500 
                                transform hover:-translate-y-2 backdrop-blur-sm overflow-hidden
                                ${isVisible ? 'animate-scale-in' : 'opacity-0 translate-y-8'}
                            `}
                            style={{ 
                                animationDelay,
                                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            onMouseEnter={() => setHoveredRecipe(recipe.id)}
                            onMouseLeave={() => setHoveredRecipe(null)}
                        >
                            {/* Enhanced Image Section */}
                            <div className="relative h-52 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                                {recipe.image_url && !imageErrors[recipe.id] ? (
                                    <div className="relative w-full h-full">
                                        {/* Image Loading Skeleton */}
                                        {!loadedImages[recipe.id] && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse z-10"></div>
                                        )}
                                        
                                        <img 
                                            src={recipe.image_url} 
                                            alt={recipe.title}
                                            className={`
                                                w-full h-full object-cover transition-all duration-700
                                                ${loadedImages[recipe.id] 
                                                    ? 'opacity-100 scale-100 group-hover:scale-110' 
                                                    : 'opacity-0 scale-105'
                                                }
                                            `}
                                            onError={() => handleImageError(recipe.id)}
                                            onLoad={() => handleImageLoad(recipe.id)}
                                        />
                                        
                                        {/* Enhanced Overlay Effects */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                                        <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 animate-pulse-slow">
                                        <svg className="w-16 h-16 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" 
                                                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        <span className="text-sm font-medium">No Recipe Image</span>
                                    </div>
                                )}
                                
                                {/* Enhanced Edit Button */}
                                <button
                                    onClick={() => onEdit(recipe)}
                                    className="absolute top-4 right-4 p-3 bg-white/95 backdrop-blur-md rounded-xl hover:bg-white hover:scale-110 transform transition-all duration-300 shadow-2xl hover:shadow-3xl border border-white/20 group/btn"
                                    title="Edit Recipe"
                                    aria-label={`Edit ${recipe.title}`}
                                >
                                    <svg className="w-5 h-5 text-orange-600 group-hover/btn:text-orange-700 transition-colors duration-200" 
                                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>

                                {/* Difficulty Badge */}
                                <div className={`
                                    absolute top-4 left-4 px-3 py-2 rounded-xl text-xs font-semibold 
                                    backdrop-blur-sm border transition-all duration-300 transform group-hover:scale-105
                                    bg-gradient-to-r ${difficulty.color} text-white shadow-lg
                                `}>
                                    <span className="flex items-center gap-1.5">
                                        <span className="text-xs">{difficulty.icon}</span>
                                        {difficulty.level}
                                    </span>
                                </div>

                                {/* Quick Stats Overlay */}
                                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                    <div className="flex justify-between items-center bg-white/90 backdrop-blur-md rounded-lg p-3">
                                        <div className="text-center">
                                            <div className="text-xs text-gray-600">Prep</div>
                                            <div className="text-sm font-semibold text-gray-900">{recipe.prep_time}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-gray-600">Cook</div>
                                            <div className="text-sm font-semibold text-gray-900">{recipe.cook_time}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-gray-600">Serves</div>
                                            <div className="text-sm font-semibold text-gray-900">{recipe.servings}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Content Section */}
                            <div className="p-5">
                                <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-orange-700 transition-all duration-300 text-lg mb-2">
                                    {recipe.title}
                                </h3>
                                
                                <p className="text-gray-600 text-sm line-clamp-2 min-h-[3rem] leading-relaxed transition-colors duration-300 group-hover:text-gray-700 mb-3">
                                    {recipe.description || 'No description available for this recipe.'}
                                </p>

                                {/* Time and Servings */}
                                <div className="flex items-center justify-between mb-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                                    <div className="flex items-center gap-2 text-sm text-orange-700">
                                        <span className="text-lg">⏱️</span>
                                        <span className="font-semibold">{recipe.prep_time} + {recipe.cook_time}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-orange-700">
                                        <span className="text-lg">👥</span>
                                        <span className="font-semibold">Serves {recipe.servings}</span>
                                    </div>
                                </div>

                                {/* Category and Tags */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 group-hover:border-gray-300 transition-colors duration-300">
                                            🏷️ {recipe.category?.name || 'Uncategorized'}
                                        </span>
                                        <span className="text-xs text-gray-400 group-hover:text-gray-500 transition-colors duration-300">
                                            📅 {formatDate(recipe.created_at)}
                                        </span>
                                    </div>

                                    {/* Tags */}
                                    {recipe.tags_list && recipe.tags_list.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {recipe.tags_list.slice(0, 3).map(tag => (
                                                <span 
                                                    key={tag} 
                                                    className="px-2 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 text-xs rounded-full border border-blue-200 transition-all duration-300 hover:scale-105 hover:shadow-sm"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                            {recipe.tags_list.length > 3 && (
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                    +{recipe.tags_list.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Interactive Progress Bar for Cooking Time */}
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Total Time</span>
                                        <span>
                                            {((parseInt(recipe.prep_time) || 0) + (parseInt(recipe.cook_time) || 0))}min
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div 
                                            className={`h-1.5 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${difficulty.color}`}
                                            style={{ 
                                                width: `${Math.min(100, (((parseInt(recipe.prep_time) || 0) + (parseInt(recipe.cook_time) || 0)) / 60) * 100)}%` 
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RecipesScreen;