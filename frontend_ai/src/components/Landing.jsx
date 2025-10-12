import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  
  // Organic farming focused slides
  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      title: 'Pure Organic Farming',
      description: 'Experience the difference of 100% organic produce, grown with care and commitment to sustainability.'
    },
    {
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      title: 'Fresh From Our Farm',
      description: 'Direct from our fields to your table, ensuring maximum freshness and nutritional value.'
    },
    {
      image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      title: 'Sustainable Agriculture',
      description: 'Join us in promoting eco-friendly farming practices for a healthier planet.'
    }
  ];

  // Organic products gallery
  const products = [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Fresh Organic Vegetables',
      category: 'Vegetables',
      name: 'Seasonal Vegetables',
      price: '$4.99',
      unit: 'per lb'
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Organic Fruits',
      category: 'Fruits',
      name: 'Fresh Fruits',
      price: '$3.99',
      unit: 'per lb'
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1558961360-f4be754ffb35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Organic Dairy Products',
      category: 'Dairy',
      name: 'Dairy Products',
      price: '$5.49',
      unit: 'per item'
    },
    {
      id: 4,
      src: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Farm Fresh Eggs',
      category: 'Poultry',
      name: 'Free-range Eggs',
      price: '$6.99',
      unit: 'per dozen'
    },
    {
      id: 5,
      src: 'https://images.unsplash.com/photo-1594489573857-44a39ac18a52?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Organic Grains',
      category: 'Grains',
      name: 'Whole Grains',
      price: '$3.49',
      unit: 'per lb'
    },
    {
      id: 6,
      src: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Organic Herbs',
      category: 'Herbs',
      name: 'Fresh Herbs',
      price: '$2.99',
      unit: 'per bunch'
    }
  ];

  const categories = ['All', 'Vegetables', 'Fruits', 'Dairy', 'Poultry', 'Grains', 'Herbs'];

  // Preload images for better UX
  useEffect(() => {
    const preloadImages = () => {
      const imageUrls = [
        ...slides.map(slide => slide.image),
        ...products.map(product => product.src)
      ];
      
      imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
      });
      
      setIsLoading(false);
    };

    preloadImages();
  }, []);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 10);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, [handleScroll, slides.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading fresh organic goodness...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: '"Plus Jakarta Sans", "Inter", "Noto Sans", sans-serif' }}>
      {/* Enhanced Header */}
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-4'
      } ${isMenuOpen ? 'bg-white' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">🌱</span>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">AriFarm</span>
              <span className="block text-xs text-green-600 font-medium">Organic Farms</span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {['Our Story', 'Products', 'Our Values', 'Contact'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                className="text-gray-700 font-medium hover:text-green-600 transition-all duration-200 hover:scale-105"
              >
                {item}
              </button>
            ))}
          </nav>
          
          <div className="flex items-center space-x-3">
            <Link 
              to="/login" 
              className="hidden sm:block px-5 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Farmer Login
            </Link>
            <Link 
              to="/signup" 
              className="hidden sm:block px-5 py-2.5 rounded-lg bg-white text-green-700 font-semibold border-2 border-green-600 hover:bg-green-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              Join as Farmer
            </Link>
            
            {/* Enhanced Mobile menu button */}
            <button 
              className="lg:hidden p-3 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Enhanced Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-green-100 shadow-xl animate-slideDown">
            <div className="px-6 py-4 space-y-3">
              {['Our Story', 'Products', 'Our Values', 'Contact'].map((item) => (
                <button 
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                  className="block w-full text-left py-3 px-4 text-gray-700 font-medium hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200"
                >
                  {item}
                </button>
              ))}
              <div className="pt-4 border-t border-green-100 flex flex-col space-y-3">
                <Link 
                  to="/login" 
                  className="px-5 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md text-center"
                >
                  Farmer Login
                </Link>
                <Link 
                  to="/signup" 
                  className="px-5 py-3 rounded-lg bg-white text-green-700 font-semibold border-2 border-green-600 hover:bg-green-50 transition-all duration-200 shadow-sm text-center"
                >
                  Join as Farmer
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Enhanced Hero Section */}
      <section className="relative w-full h-screen flex items-center justify-center bg-green-50 overflow-hidden pt-16">
        <div className="absolute inset-0 z-0">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              }`}
              style={{ backgroundImage: `url("${slide.image}")` }}
            ></div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-green-900/10 z-10"></div>
        </div>
        
        <div className="relative z-20 max-w-7xl w-full px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="max-w-2xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-6 shadow-sm animate-fadeIn">
              🌱 100% Certified Organic & Sustainable
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6 animate-slideUp">
              {slides[currentSlide].title}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 max-w-lg leading-relaxed animate-slideUp delay-100">
              {slides[currentSlide].description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-slideUp delay-200">
              <Link 
                to="/signup" 
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-center text-lg flex items-center justify-center space-x-2"
              >
                <span>Join Our Farming Network</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </Link>
              <button 
                onClick={() => scrollToSection('products')}
                className="px-8 py-4 bg-white/90 text-gray-900 font-semibold rounded-xl hover:bg-white transition-all duration-300 border-2 border-gray-200 hover:border-green-300 hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center space-x-2"
              >
                <span>Shop Organic Products</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Carousel Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-green-600 w-8 shadow-lg' : 'bg-white/80 hover:bg-green-400'
              }`}
              onClick={() => handleSlideChange(index)}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className="w-6 h-10 border-2 border-green-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-green-600 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-16 bg-white border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 text-center">
            {[
              { number: "50+", label: "Organic Farmers", icon: "👨‍🌾" },
              { number: "100%", label: "Natural Products", icon: "🌿" },
              { number: "15+", label: "Years Experience", icon: "⭐" },
              { number: "10K+", label: "Happy Customers", icon: "😊" }
            ].map((stat, index) => (
              <div key={index} className="p-6 md:p-8 group hover:scale-105 transition-transform duration-300">
                <div className="text-2xl mb-3 opacity-80">{stat.icon}</div>
                <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced About Section */}
      <section id="our-story" className="py-20 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-6">
                Our Journey
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Growing Together, Naturally
              </h2>
              <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
                <p>
                  Founded with a passion for sustainable agriculture, AriFarm began as a small family-owned organic farm dedicated to providing fresh, chemical-free produce to our local community.
                </p>
                <p>
                  What started as a humble venture has grown into a network of certified organic farmers united by a common vision: to promote healthy living through natural farming practices while preserving our environment for future generations.
                </p>
                <p>
                  Our journey is rooted in the belief that everyone deserves access to pure, nutritious food grown with care and respect for nature.
                </p>
              </div>
              <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <span className="text-green-600">🎯</span>
                  <span>Our Mission</span>
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  To provide 100% organic, fresh produce to health-conscious consumers while supporting local farmers through sustainable agricultural practices and community engagement.
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2 grid grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-4 lg:space-y-6">
                <div className="aspect-square bg-green-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <img 
                    src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Organic farming" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="aspect-square bg-green-300 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <img 
                    src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Fresh produce" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="space-y-4 lg:space-y-6 pt-8 lg:pt-12">
                <div className="aspect-square bg-green-400 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <img 
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Farm landscape" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="aspect-square bg-green-500 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <img 
                    src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Harvest" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Products Section */}
      <section id="products" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-4">
              Fresh from our farm
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Our Organic Products</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our range of certified organic products, carefully grown and harvested using sustainable methods.
            </p>
          </div>
          
          {/* Enhanced Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12 px-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                    : 'bg-green-50 text-green-700 hover:bg-green-100 shadow-sm'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Enhanced Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-white border border-green-100 hover:border-green-200">
                <div className="aspect-video bg-green-100 relative overflow-hidden">
                  <img 
                    src={product.src} 
                    alt={product.alt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-full shadow-md">
                      {product.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-700 transition-colors duration-200">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Freshly harvested organic {product.name.toLowerCase()} grown using natural methods.
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-green-600">{product.price}</span>
                      <span className="text-sm text-gray-500 ml-2">{product.unit}</span>
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2">
                      <span>Add to Cart</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">We're currently updating our inventory for this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Values Section */}
      <section id="our-values" className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-4">
              What drives us
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              The principles that guide everything we do at AriFarm Organic Farms
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: "🌱",
                title: "Pure Organic",
                description: "100% chemical-free farming practices ensuring the highest quality natural produce."
              },
              {
                icon: "💚",
                title: "Sustainability",
                description: "Commitment to eco-friendly methods that protect our environment for future generations."
              },
              {
                icon: "🤝",
                title: "Community",
                description: "Building strong relationships with local farmers and health-conscious consumers."
              },
              {
                icon: "✨",
                title: "Quality",
                description: "Uncompromising standards in every product we grow and deliver to your table."
              },
              {
                icon: "🌍",
                title: "Innovation",
                description: "Embracing modern sustainable farming techniques while honoring traditional wisdom."
              },
              {
                icon: "🏆",
                title: "Integrity",
                description: "Transparent operations and honest relationships with all our stakeholders."
              }
            ].map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 border border-green-100">
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-green-700 transition-colors duration-200">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section for Farmers */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-48 translate-y-48"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Join Our Organic Farming Network
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Connect with health-conscious consumers and grow your organic farming business with AriFarm. Together, we can make organic food accessible to everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup" 
              className="px-8 py-4 bg-white text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 text-lg flex items-center justify-center space-x-2"
            >
              <span>Register Your Farm</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </Link>
            <button 
              onClick={() => scrollToSection('contact')}
              className="px-8 py-4 bg-transparent text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 border-2 border-white hover:border-green-200 text-lg flex items-center justify-center space-x-2"
            >
              <span>Learn More</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Enhanced Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-6">
                Get in touch
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Let's Connect</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Interested in our organic products or want to join our farming network? We'd love to hear from you and help you discover the best of organic farming.
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    ),
                    title: "Visit Our Farm",
                    description: "123 Organic Valley, Green County"
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                    ),
                    title: "Call Us",
                    description: "+1 (555) 123-ARIA"
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    ),
                    title: "Email Us",
                    description: "info@arifarm.com"
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-green-50 transition-colors duration-200">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 shadow-lg border border-green-100">
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-900 font-medium mb-2">Name *</label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all duration-200 bg-white"
                      placeholder="Your Name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-900 font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all duration-200 bg-white"
                      placeholder="Your Email"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-gray-900 font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-3 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all duration-200 bg-white"
                    placeholder="What's this about?"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-gray-900 font-medium mb-2">Message *</label>
                  <textarea
                    id="message"
                    className="w-full px-4 py-3 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all duration-200 bg-white resize-none"
                    rows="5"
                    placeholder="Your Message"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                >
                  <span>Send Message</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">🌱</span>
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">AriFarm</span>
                  <span className="block text-xs text-green-400 font-medium">Organic Farms</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Connecting organic farmers with health-conscious consumers since 2008. Together, we're growing a healthier future.
              </p>
              <div className="flex space-x-3">
                {['Facebook', 'Instagram', 'Twitter', 'YouTube'].map((social, index) => (
                  <a 
                    key={index} 
                    href="#" 
                    className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-green-600 transition-all duration-200 hover:scale-110"
                    aria-label={social}
                  >
                    {social[0]}
                  </a>
                ))}
              </div>
            </div>
            
            {[
              {
                title: "Quick Links",
                links: ["Our Story", "Products", "Our Values", "Farmer Login"]
              },
              {
                title: "Products",
                links: ["Vegetables", "Fruits", "Dairy", "Grains", "Herbs"]
              },
              {
                title: "Support",
                links: ["Contact Us", "Shipping Info", "Returns", "FAQ", "Farmers Guide"]
              }
            ].map((column, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold mb-4 text-white">{column.title}</h3>
                <ul className="space-y-3">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <button 
                        onClick={() => link === "Farmer Login" ? null : scrollToSection(link.toLowerCase().replace(' ', '-'))}
                        className="text-gray-400 hover:text-green-400 transition-all duration-200 hover:translate-x-1 text-sm"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2024 AriFarm Organic Farms. All rights reserved. | Growing a healthier world, one harvest at a time.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-green-400 transition-colors duration-200">Privacy Policy</a>
              <a href="#" className="hover:text-green-400 transition-colors duration-200">Terms of Service</a>
              <a href="#" className="hover:text-green-400 transition-colors duration-200">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;