const ProductsScreen = ({ filteredData, onEdit }) => (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Products</h2>
            <span className="text-gray-500">{filteredData.length} products</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map(product => (
                <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow relative">
                    <button
                        onClick={() => onEdit(product)}
                        className="absolute top-3 right-3 p-2 bg-white rounded-full hover:bg-gray-50 z-20 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                        title="Edit Product"
                    >
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    
                    <div className="h-48 bg-gray-200 rounded-lg overflow-hidden mb-3 relative">
                        {product.images && product.images.length > 0 ? (
                            <img src={product.images[0].image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                        )}
                    </div>
                    <h3 className="text-lg font-medium">{product.name}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center mt-3">
                        <p className="text-emerald-600 font-semibold">KSh {parseFloat(product.price).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">Category: {product.category?.name || 'None'}</div>
                    <p className="text-xs text-gray-400 mt-2">
                        Created: {new Date(product.created_at).toLocaleDateString('en-US', { timeZone: 'Africa/Nairobi' })}
                    </p>
                </div>
            ))}
        </div>
    </div>
);

export default ProductsScreen;