const RecipesScreen = ({ filteredData, onEdit }) => (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recipes</h2>
            <span className="text-gray-500">{filteredData.length} recipes</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map(recipe => (
                <div key={recipe.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow relative">
                    <button
                        onClick={() => onEdit(recipe)}
                        className="absolute top-3 right-3 p-2 bg-white rounded-full hover:bg-gray-50 z-20 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                        title="Edit Recipe"
                    >
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    
                    <div className="h-48 bg-gray-200 rounded-lg overflow-hidden mb-3 relative">
                        {recipe.image_url ? (
                            <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                        )}
                    </div>
                    <h3 className="text-lg font-medium">{recipe.title}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{recipe.description}</p>
                    <div className="flex justify-between items-center mt-3">
                        <p className="text-orange-600 font-semibold">
                            ⏱️ {recipe.prep_time} + {recipe.cook_time}
                        </p>
                        <p className="text-sm text-gray-500">Serves: {recipe.servings}</p>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                        Category: {recipe.category?.name || 'None'}
                    </div>
                    {recipe.tags_list && recipe.tags_list.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {recipe.tags_list.slice(0, 3).map(tag => (
                                <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {tag}
                                </span>
                            ))}
                            {recipe.tags_list.length > 3 && (
                                <span className="text-xs text-gray-500">+{recipe.tags_list.length - 3}</span>
                            )}
                        </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                        Created: {new Date(recipe.created_at).toLocaleDateString('en-US', { timeZone: 'Africa/Nairobi' })}
                    </p>
                </div>
            ))}
        </div>
    </div>
);

export default RecipesScreen;