import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ShoppingBag, 
  Heart, 
  Search,
  Star,
  Award,
  SlidersHorizontal,
  X,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';
import { useShopProducts } from '@/hooks/useShopProducts';
import { useCart } from '@/hooks/useCart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import CartDrawer from '@/components/CartDrawer';
import WishlistDrawer from '@/components/WishlistDrawer';

// =================================================================================
// 1. HELPER & SUB-COMPONENTS
// =================================================================================

const SectionHeader = ({ title, actionText, onActionClick }: { title: string, actionText?: string, onActionClick?: () => void }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-semibold text-white tracking-wide">{title}</h2>
    {actionText && onActionClick && (
      <Button variant="ghost" size="sm" className="text-purple-400 hover:text-white" onClick={onActionClick}>
        {actionText}
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    )}
  </div>
);


// =================================================================================
// 2. REBUILT PRODUCT CARD COMPONENT (WITH GRID VIEW FIX)
// =================================================================================

const ProductCard = ({ product, isCompact, onWishlistToggle, onAddToCart, onProductClick, isInWishlist }: { 
    product: any, 
    isCompact?: boolean, 
    onWishlistToggle: (e: React.MouseEvent, product: any) => void,
    onAddToCart: (e: React.MouseEvent, product: any) => void,
    onProductClick: (product: any) => void,
    isInWishlist: boolean 
}) => {
  const cardClasses = `bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 cursor-pointer hover:border-purple-500/50 transition-all duration-300 group overflow-hidden flex flex-col`;

  // GRID VIEW (All Products) - THIS IS THE FIX
  if (!isCompact) {
    return (
      <Card className={cardClasses} onClick={() => onProductClick(product)}>
        <CardContent className="p-0 flex flex-col flex-1">
          {/* Image Section */}
          <div className="relative h-44 sm:h-48 overflow-hidden">
            <img 
              src={product.imageUrl || 'https://via.placeholder.com/300'} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <Button
              size="icon"
              variant="ghost"
              className={`absolute top-2 right-2 h-8 w-8 rounded-full backdrop-blur-sm transition-all duration-300 ${
                isInWishlist ? 'text-red-400 bg-red-900/50 hover:bg-red-900/80' : 'text-white bg-slate-900/50 hover:bg-slate-900/80'
              }`}
              onClick={(e) => onWishlistToggle(e, product)}
            >
              <Heart className={`h-4 w-4 transition-all ${isInWishlist ? 'fill-current' : ''}`} />
            </Button>
            <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.isFeatured && <Badge className="bg-yellow-500/90 text-black"><Star className="h-3 w-3 mr-1"/>Featured</Badge>}
                {product.isBestSeller && <Badge className="bg-orange-500/90 text-white"><Award className="h-3 w-3 mr-1"/>Best Seller</Badge>}
            </div>
          </div>

          {/* FIX: Content area with optimized layout for mobile */}
          <div className="p-2 flex flex-col flex-1">
            <div className="flex-grow">
              <h3 className="text-white font-medium text-sm line-clamp-2 mb-2">{product.name}</h3>
              
              {/* FIX: Price and Badge are on the same line to save vertical space */}
              <div className="flex justify-between items-center mb-2">
                <p className="text-purple-400 text-base font-bold">₹{product.price.toFixed(2)}</p>
                <Badge variant="outline" className="text-xs text-purple-300 border-purple-300/50">{product.petType}</Badge>
              </div>
            </div>
            
            <Button
              size="sm"
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 mt-auto"
              onClick={(e) => onAddToCart(e, product)}
              disabled={product.stock === 0}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // LIST VIEW (Featured Products) - UNCHANGED
  return (
    <Card className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 cursor-pointer hover:border-purple-500/50 transition-all duration-300 group overflow-hidden" onClick={() => onProductClick(product)}>
      <CardContent className="flex p-0">
        <div className="relative w-28 h-auto flex-shrink-0">
          <img 
              src={product.imageUrl || 'https://via.placeholder.com/300'} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
        </div>
        
        <div className="p-3 flex flex-col flex-1 min-w-0">
          <div className="flex-grow">
            <div className="flex gap-2 mb-1">
              {product.isFeatured && <Badge className="bg-yellow-500/90 text-black text-xs"><Star className="h-3 w-3 mr-1"/>Featured</Badge>}
              {product.isBestSeller && <Badge className="bg-orange-500/90 text-white text-xs"><Award className="h-3 w-3 mr-1"/>Best Seller</Badge>}
            </div>
            <h3 className="text-white font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
            <div className="flex items-center justify-between mb-2">
              <p className="text-purple-400 text-lg font-bold">₹{product.price.toFixed(2)}</p>
              <Badge variant="outline" className="text-xs text-purple-300 border-purple-300/50">{product.petType}</Badge>
            </div>
          </div>
          
          <Button
            size="sm"
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 mt-auto"
            onClick={(e) => onAddToCart(e, product)}
            disabled={product.stock === 0}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};


const CategoryChip = ({ category, selectedCategory, onClick }: { category: any, selectedCategory: string, onClick: (id: string) => void }) => (
    <button
      onClick={() => onClick(category.id)}
      className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 border
      ${selectedCategory === category.id 
        ? 'bg-purple-600 text-white border-purple-600' 
        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600'}`
      }
    >
      {category.name}
    </button>
);


const FilterSheet = ({ open, onOpenChange, categories, selectedCategory, selectedPetType, sortBy, onCategoryChange, onPetTypeChange, onSortByChange, onClear, hasActiveFilters }: any) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="left" className="bg-slate-900 border-slate-700 w-[85vw] max-w-sm">
      <SheetHeader><SheetTitle className="text-white text-xl">Filters & Sort</SheetTitle></SheetHeader>
      <div className="space-y-6 mt-6">
        <div>
          <label className="text-sm font-medium text-white mb-2 block">Category</label>
          <Select value={selectedCategory || 'all'} onValueChange={(v) => onCategoryChange(v === 'all' ? '' : v)}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c:any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-white mb-2 block">Pet Type</label>
          <Select value={selectedPetType || 'all'} onValueChange={(v) => onPetTypeChange(v === 'all' ? '' : v)}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="All Pets" /></SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="all">All Pets</SelectItem>
                  <SelectItem value="Dog">Dog</SelectItem>
                  <SelectItem value="Cat">Cat</SelectItem>
              </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-white mb-2 block">Sort By</label>
          <Select value={sortBy} onValueChange={onSortByChange}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="Sort By" /></SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
          </Select>
        </div>
        {hasActiveFilters && (
          <Button variant="outline" onClick={() => { onClear(); onOpenChange(false); }} className="w-full">Clear All Filters</Button>
        )}
      </div>
    </SheetContent>
  </Sheet>
);

// =================================================================================
// 3. MAIN SHOP COMPONENT
// =================================================================================

const Shop = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPetType, setSelectedPetType] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);

  const { categories, isLoading: categoriesLoading } = useCategories();
  const { products, isLoading: productsLoading } = useShopProducts();
  const { cartItemsCount, wishlistCount, addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();

  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter(product =>
        (selectedCategory ? product.categoryId === selectedCategory : true) &&
        (selectedPetType ? product.petType === selectedPetType : true) &&
        (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())))
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-low': return a.price - b.price;
          case 'price-high': return b.price - a.price;
          case 'name': return a.name.localeCompare(b.name);
          default: return 0;
        }
      });
  }, [products, selectedCategory, selectedPetType, searchQuery, sortBy]);
  
  const featuredProducts = useMemo(() => products.filter(p => p.isFeatured), [products]);
  const hasActiveFilters = !!(selectedCategory || selectedPetType || searchQuery);

  const handleProductClick = (product: any) => navigate('/product-detail', { state: { product } });
  const handleWishlistToggle = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    if (isInWishlist(product.id)) removeFromWishlist(product.id);
    else addToWishlist(product);
  };
  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    addToCart(product, 1);
  };
  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedPetType('');
    setSearchQuery('');
    setSortBy('name');
  };
  const handleCategoryChipClick = (id: string) => {
    setSelectedCategory(prev => prev === id ? '' : id);
  };

  if (categoriesLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-slate-900 p-4 space-y-6 animate-pulse">
        <div className="flex justify-between items-center"><Skeleton className="h-10 w-48" /><Skeleton className="h-10 w-24" /></div>
        <Skeleton className="h-14 w-full rounded-xl" />
        <div className="flex gap-3 overflow-x-auto pb-3"><Skeleton className="h-10 w-24 rounded-full" /><Skeleton className="h-10 w-28 rounded-full" /><Skeleton className="h-10 w-24 rounded-full" /></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 text-white">
      <header className="flex items-center justify-between p-4 bg-slate-900/70 backdrop-blur-lg sticky top-0 z-20 border-b border-slate-700/50">
        <h1 className="text-2xl font-bold tracking-tighter">Shop</h1>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="relative" onClick={() => setShowWishlist(true)}>
            <Heart className="h-5 w-5" /><span className="sr-only">Wishlist</span>
            {wishlistCount > 0 && <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0 bg-red-500 text-white">{wishlistCount}</Badge>}
          </Button>
          <Button size="icon" variant="ghost" className="relative" onClick={() => setShowCart(true)}>
            <ShoppingBag className="h-5 w-5" /><span className="sr-only">Cart</span>
            {cartItemsCount > 0 && <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0 bg-purple-500 text-white">{cartItemsCount}</Badge>}
          </Button>
        </div>
      </header>

      <main className="p-4 md:p-6 space-y-8 pb-24">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input placeholder="Search for food, toys, treats..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full h-14 bg-slate-800/80 border-2 border-slate-700 pl-12 pr-12 rounded-xl text-base focus:border-purple-500" />
            {searchQuery && <Button size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setSearchQuery('')}><X /></Button>}
          </div>

          <div className="flex items-center justify-between gap-3">
             <Button variant="outline" onClick={() => setShowFilters(true)} className="lg:hidden bg-slate-800 border-slate-700">
                <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
                {hasActiveFilters && <span className="ml-2 h-2 w-2 rounded-full bg-purple-500 animate-pulse" />}
             </Button>
             <div className="hidden lg:flex gap-2">
                <Select value={selectedPetType || 'all'} onValueChange={(v) => setSelectedPetType(v === 'all' ? '' : v)}>
                   <SelectTrigger className="w-40 bg-slate-800 border-slate-700"><SelectValue placeholder="All Pets" /></SelectTrigger>
                   <SelectContent className="bg-slate-800 border-slate-700 text-white"><SelectItem value="all">All Pets</SelectItem><SelectItem value="Dog">Dog</SelectItem><SelectItem value="Cat">Cat</SelectItem></SelectContent>
                </Select>
             </div>
             <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-slate-800 border-slate-700"><SelectValue placeholder="Sort By" /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white"><SelectItem value="name">Name</SelectItem><SelectItem value="price-low">Price: Low to High</SelectItem><SelectItem value="price-high">Price: High to Low</SelectItem></SelectContent>
             </Select>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
          <CategoryChip category={{ id: '', name: 'All' }} selectedCategory={selectedCategory} onClick={() => handleCategoryChipClick('')} />
          {categories.map(cat => <CategoryChip key={cat.id} category={cat} selectedCategory={selectedCategory} onClick={handleCategoryChipClick} />)}
        </div>

        {featuredProducts.length > 0 && !hasActiveFilters && (
          <section>
            <SectionHeader title="Featured Products" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredProducts.slice(0, 2).map(p => 
                <ProductCard key={p.id} product={p} isCompact 
                    onAddToCart={handleAddToCart} onWishlistToggle={handleWishlistToggle} onProductClick={handleProductClick} isInWishlist={isInWishlist(p.id)} />
              )}
            </div>
          </section>
        )}

        <section>
          <SectionHeader title={selectedCategory ? categories.find(c => c.id === selectedCategory)?.name || 'Products' : 'All Products'} />
          
          {filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {filteredAndSortedProducts.map(p => 
                  <ProductCard key={p.id} product={p} 
                      onAddToCart={handleAddToCart} onWishlistToggle={handleWishlistToggle} onProductClick={handleProductClick} isInWishlist={isInWishlist(p.id)} />
              )}
            </div>
          ) : (
            <div className="text-center py-20 rounded-lg bg-slate-800/50">
              <div className="w-24 h-24 bg-slate-900/70 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-12 w-12 text-slate-500" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">No Products Found</h3>
              <p className="text-slate-400 mb-6">Try adjusting your search or filter settings.</p>
              {hasActiveFilters && <Button variant="outline" onClick={clearFilters}>Clear All Filters</Button>}
            </div>
          )}
        </section>
      </main>

      <FilterSheet 
        open={showFilters} onOpenChange={setShowFilters} categories={categories} selectedCategory={selectedCategory}
        selectedPetType={selectedPetType} sortBy={sortBy} onCategoryChange={setSelectedCategory}
        onPetTypeChange={setSelectedPetType} onSortByChange={setSortBy} onClear={clearFilters} hasActiveFilters={hasActiveFilters}
      />
      <CartDrawer open={showCart} onOpenChange={setShowCart} />
      <WishlistDrawer open={showWishlist} onOpenChange={setShowWishlist} />
    </div>
  );
};

export default Shop;