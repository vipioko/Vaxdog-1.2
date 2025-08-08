import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingBag, Trash2, IndianRupee } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

interface WishlistDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WishlistDrawer: React.FC<WishlistDrawerProps> = ({ open, onOpenChange }) => {
  const { 
    wishlistItems, 
    removeFromWishlist, 
    moveToCart,
    clearWishlist
  } = useCart();

  const handleMoveToCart = (itemId: string) => {
    moveToCart(itemId, 1);
  };

  const handleClearWishlist = () => {
    if (wishlistItems.length === 0) {
      toast.info('Wishlist is already empty');
      return;
    }
    
    clearWishlist();
  };

  console.log('WishlistDrawer - wishlistItems:', wishlistItems);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-slate-900 border-slate-700 w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-white flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Wishlist ({wishlistItems.length})
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full mt-6">
          {wishlistItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Heart className="h-12 w-12 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Your wishlist is empty</h3>
              <p className="text-slate-400 text-sm">Save items you love for later!</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-4">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-slate-500" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm line-clamp-2 mb-1">
                          {item.name}
                        </h4>
                        {item.petType && (
                          <Badge variant="outline" className="text-xs mb-2">
                            {item.petType}
                          </Badge>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-purple-400 font-bold">
                            <IndianRupee className="h-4 w-4 mr-1" />
                            {item.price.toFixed(2)}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              className="bg-purple-500 hover:bg-purple-600 h-8 px-3"
                              onClick={() => handleMoveToCart(item.id)}
                              disabled={item.stock === 0}
                            >
                              <ShoppingBag className="h-3 w-3 mr-1" />
                              Add to Cart
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              onClick={() => removeFromWishlist(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {item.stock === 0 && (
                          <p className="text-red-400 text-xs mt-1">Out of stock</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4">
                <Button 
                  variant="outline" 
                  className="w-full bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                  onClick={handleClearWishlist}
                >
                  Clear Wishlist
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default WishlistDrawer;