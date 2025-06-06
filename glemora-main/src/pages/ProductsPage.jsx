import React, {useState, useEffect, useMemo} from 'react';
import {Link} from 'react-router-dom';
import {Search, ShoppingCart, EyeIcon, ChevronDown} from 'lucide-react';
import {useAuth} from '../contexts/AuthContext';

// Cart Utility Function
const CartUtils = {
    addToCart: (product, size = '', quantity = 1) => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItemIndex = cart.findIndex(item => item.productId === product.id && item.size === size);

        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({
                productId: product.id,
                name: product.name,
                price: product.sale ? product.salePrice : product.price,
                image: product.image,
                size: size,
                quantity: quantity
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        return cart;
    }
};

const ProductsPage = () => {
    const {api, isAuthenticated} = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 200000]);
    const [sortBy, setSortBy] = useState('default');
    const [categories, setCategories] = useState([]);

    // Fetch products and categories from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch products
                const productsResponse = await api.get('/products');
                setProducts(productsResponse.data);

                // Fetch categories
                const categoriesResponse = await api.get('/categories');
                setCategories(categoriesResponse.data);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load products. Please try again later.');
                setLoading(false);
            }
        };

        fetchData();
    }, [api]);

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategories.length === 0 || (product.category && selectedCategories.includes(product.category.id));
            const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

            return matchesSearch && matchesCategory && matchesPrice;
        }).sort((a, b) => {
            switch (sortBy) {
                case 'priceAsc':
                    return a.price - b.price;
                case 'priceDesc':
                    return b.price - a.price;
                case 'nameAsc':
                    return a.name.localeCompare(b.name);
                case 'nameDesc':
                    return b.name.localeCompare(a.name);
                default:
                    return 0;
            }
        });
    }, [products, searchTerm, selectedCategories, priceRange, sortBy]);

    // Toggle category selection
    const toggleCategory = (categoryId) => {
        setSelectedCategories(prev => prev.includes(categoryId) ? prev.filter(c => c !== categoryId) : [...prev, categoryId]);
    };

    // Add to cart handler for product cards
    const handleQuickAddToCart = async (product) => {
        try {
            // Default size and quantity for quick add
            const defaultSize = 'M';
            const defaultQuantity = 1;

            // Check stock availability
            if (product.stockQuantity < defaultQuantity) {
                alert(`Sorry, only ${product.stockQuantity} items available in stock.`);
                return;
            }

            if (isAuthenticated) {
                // For authenticated users, use the API
                await api.post('/cart', null, {
                    params: {
                        productId: product.id,
                        quantity: defaultQuantity,
                        size: defaultSize
                    }
                });
                alert('Product added to cart!');
            } else {
                // For non-authenticated users, use localStorage
                const cart = JSON.parse(localStorage.getItem('cart')) || [];

                const existingItemIndex = cart.findIndex(item =>
                    item.productId === product.id && item.size === defaultSize
                );

                if (existingItemIndex !== -1) {
                    cart[existingItemIndex].quantity += defaultQuantity;
                } else {
                    cart.push({
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        size: defaultSize,
                        quantity: defaultQuantity
                    });
                }

                localStorage.setItem('cart', JSON.stringify(cart));
                alert('Product added to cart!');
            }
        } catch (err) {
            console.error('Error adding to cart:', err);
            alert('Failed to add product to cart. Please try again.');
        }
    };


    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading products...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    return (<div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                {/* Search and Sort Section */}
                <div className="flex mb-8 space-x-4">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-brown-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-4 text-gray-400" size={20}/>
                    </div>

                    {/* Sorting Dropdown */}
                    <div className="relative">
                        <select
                            className="appearance-none w-full px-4 py-3 border-2 border-gray-300 rounded-lg pr-8 focus:outline-none focus:ring-2 focus:ring-brown-500"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="default">Sort By</option>
                            <option value="priceAsc">Price: Low to High</option>
                            <option value="priceDesc">Price: High to Low</option>
                            <option value="nameAsc">Name: A to Z</option>
                            <option value="nameDesc">Name: Z to A</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-4 text-gray-400" size={20}/>
                    </div>
                </div>

                {/* Products and Filters Container */}
                <div className="flex">
                    {/* Filters Sidebar */}
                    <div className="w-64 pr-8 mr-5 bg-white p-6 rounded-lg shadow-md">
                        {/* Category Filter */}
                        <div className="mb-6">
                            <h4 className="font-semibold mb-3">Categories</h4>
                            {categories.map(category => (<div key={category.id} className="flex items-center mb-2">
                                    <input
                                        type="checkbox"
                                        id={`category-${category.id}`}
                                        checked={selectedCategories.includes(category.id)}
                                        onChange={() => toggleCategory(category.id)}
                                        className="mr-2 text-brown-800 focus:ring-brown-500"
                                    />
                                    <label htmlFor={`category-${category.id}`} className="text-gray-700">
                                        {category.name}
                                    </label>
                                </div>))}
                        </div>

                        {/* Price Range Filter */}
                        <div>
                            <h4 className="font-semibold mb-3">Price Range</h4>
                            <div className="flex items-center space-x-2 mb-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={priceRange[0]}
                                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                    className="w-1/2 px-2 py-1 border rounded"
                                />
                                <span>-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                    className="w-1/2 px-2 py-1 border rounded"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-grow">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map(product => (<div
                                    key={product.id}
                                    className="bg-white rounded-lg overflow-hidden shadow-lg relative group"
                                >
                                    {/* Product Image */}
                                    <div className="relative h-80 overflow-hidden">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                                            onError={(e) => {
                                                e.target.src = '/placeholder-image.jpg'; // Fallback image
                                            }}
                                        />

                                        {product.sale && (<div
                                                className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 text-xs font-bold rounded">
                                                SALE
                                            </div>)}

                                        {/* Hover Actions */}
                                        <div
                                            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center space-x-4">
                                            {/* View Product Details Link */}
                                            <Link
                                                to={`/product/${product.id}`}
                                                className="bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-4 transition-all duration-300 hover:bg-gray-100"
                                            >
                                                <EyeIcon size={20}/>
                                            </Link>

                                            {/* Quick Add to Cart */}
                                            <button
                                                onClick={() => handleQuickAddToCart(product)}
                                                className="bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-4 transition-all duration-300 hover:bg-gray-100"
                                            >
                                                <ShoppingCart size={20}/>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Product Details */}
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                                        <div className="text-brown-800 font-bold">
                                            {product.sale ? (<>
                                                    <span className="mr-2 text-brown-800">LKR {product.price}</span>
                                                    <span className="line-through text-gray-500 text-sm">
                                                        LKR {(product.price * 1.2).toFixed(2)}
                                                    </span>
                                                </>) : (`LKR ${product.price}`)}
                                        </div>
                                    </div>
                                </div>))}
                        </div>

                        {filteredProducts.length === 0 && (<div className="text-center py-8">
                                <p className="text-gray-500">No products found matching your criteria.</p>
                            </div>)}
                    </div>
                </div>
            </div>
        </div>);
};

export default ProductsPage;
