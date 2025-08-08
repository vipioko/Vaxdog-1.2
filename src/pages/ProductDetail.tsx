import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  ShoppingBag,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import CartDrawer from '@/components/CartDrawer';
import WishlistDrawer from '@/components/WishlistDrawer';

const ProductDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  
  const { 
    cartItemsCount, 
    wishlistCount, 
    addToCart, 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist 
  } = useCart();
  
  // Default product data if none provided
  const defaultProduct = {
    id: 1,
    name: "Long Line Leash 5 meters 10 m The Company Of Animals",
    price: 38.00,
    imageUrl: "https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg?auto=compress&cs=tinysrgb&w=600",
    galleryImages: [
      "https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg?auto=compress&cs=tinysrgb&w=600",
      "https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&w=600",
      "https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=600"
    ],
    description: "The Company of Animals Recall Line gives your dog the freedom to explore while you remain in control, making it a perfect tool for recall training and socialisation. A must-have for recall training, this lead allows you to keep control of your dog while gently encouraging them back to you to reinforce the command. The Recall Line is also ideal for allowing the safe and controlled socialisation of puppies, young or nervous dogs, and those with behavioural issues. The Recall Line is available in a choice of lengths - 5m or 10m. With the longer lead better suited for larger dogs. Soft padded webbing ensures this lead is comfortable for you to hold.",
    categoryId: "1",
    stock: 15,
    isFeatured: true,
    petType: "Dog"
  };

  const product = location.state?.product || defaultProduct;
  
  // Create gallery from main image and gallery images
  const allImages = [
    product.imageUrl || product.image,
    ...(product.galleryImages || [])
  ].filter(Boolean);

  const handleBack = () => {
    navigate(-1);
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleToggleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product.stock || 99)) {
      setQuantity(newQuantity);
    }
  };

  const description = product.description || '';
  const truncatedDescription = description.length > 200 ? description.slice(0, 200) + "..." : description;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-800/95 backdrop-blur-sm sticky top-0 z-10">
        <Button 
          size="icon" 
          variant="ghost" 
          className="text-white hover:bg-slate-700"
          onClick={handleBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold truncate mx-4">Product Details</h1>
        <div className="flex items-center gap-2">
          <Button 
            size="icon" 
            variant="ghost" 
            className="text-white hover:bg-slate-700 relative"
            onClick={() => setShowWishlist(true)}
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">{wishlistCount}</span>
              </div>
            )}
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="text-white hover:bg-slate-700 relative"
            onClick={() => setShowCart(true)}
          >
            <ShoppingBag className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">{cartItemsCount}</span>
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Product Images Gallery */}
      <div className="relative">
        <div className="relative h-80 sm:h-96 overflow-hidden">
          <img 
            src={allImages[currentImageIndex]} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300"
          />
          
          {/* Navigation arrows */}
          {allImages.length > 1 && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                onClick={handlePrevImage}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                onClick={handleNextImage}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Image indicators */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isFeatured && (
              <Badge className="bg-yellow-500/90 text-black">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {product.isBestSeller && (
              <Badge className="bg-orange-500/90 text-white">
                Best Seller
              </Badge>
            )}
          </div>
        </div>

        {/* Thumbnail gallery */}
        {allImages.length > 1 && (
          <div className="p-4 bg-slate-800/50">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex 
                      ? 'border-purple-500' 
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-6">
        {/* Title and Price */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">{product.name}</h1>
          <div className="flex items-center justify-between">
            <div className="text-2xl sm:text-3xl font-bold text-purple-400">
              ₹{product.price.toFixed(2)}
            </div>
            {product.petType && (
              <Badge variant="outline" className="text-purple-300 border-purple-300">
                For {product.petType}s
              </Badge>
            )}
          </div>
        </div>

        {/* Stock and Quantity */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {product.stock ? (
              <span className="text-green-400">In Stock ({product.stock} available)</span>
            ) : (
              <span className="text-red-400">Out of Stock</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">Quantity:</span>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= (product.stock || 99)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className={`bg-slate-700 border-slate-600 hover:bg-slate-600 h-12 px-6 ${
              isInWishlist(product.id) ? 'text-red-400 border-red-400' : 'text-white'
            }`}
            onClick={handleToggleWishlist}
          >
            <Heart className={`h-5 w-5 mr-2 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            {isInWishlist(product.id) ? 'Wishlisted' : 'Wishlist'}
          </Button>
          <Button 
            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white h-12 font-semibold"
            onClick={handleAddToCart}
            disabled={!product.stock || product.stock === 0}
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            Add To Cart
          </Button>
        </div>

        {/* Product Details */}
        {description && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-3 text-white">Product Details</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {showFullDescription ? description : truncatedDescription}
                {description.length > 200 && (
                  <button 
                    onClick={toggleDescription}
                    className="text-purple-400 ml-2 hover:text-purple-300 font-medium"
                  >
                    {showFullDescription ? 'Read Less' : 'Read More'}
                  </button>
                )}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Additional Info */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-3 text-white">Shipping & Returns</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p>• Free shipping on orders over ₹999</p>
              <p>• 30-day return policy</p>
              <p>• Secure payment processing</p>
              <p>• Customer support available 24/7</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart and Wishlist Drawers */}
      <CartDrawer open={showCart} onOpenChange={setShowCart} />
      <WishlistDrawer open={showWishlist} onOpenChange={setShowWishlist} />
    </div>
  );
};

export default ProductDetail;