import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Plus, Minus, Trash2, IndianRupee, X } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    cartTotal, 
    removeFromCart, 
    updateCartQuantity,
    clearCart 
  } = useCart();

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    onOpenChange(false);
    navigate('/checkout');
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateCartQuantity(itemId, newQuantity);
    }
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) {
      toast.info('Cart is already empty');
      return;
    }
    
    clearCart();
  };

  console.log('CartDrawer - cartItems:', cartItems);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="bg-slate-900 border-slate-700 w-full sm:max-w-md p-0 flex flex-col h-full"
      >
        {/* Header */}
        <SheetHeader className="p-4 pb-0 flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white flex items-center gap-2 text-lg">
              <ShoppingBag className="h-5 w-5" />
              Cart ({cartItems.length})
            </SheetTitle>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex flex-col flex-1 min-h-0">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="h-10 w-10 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Your cart is empty</h3>
              <p className="text-slate-400 text-sm mb-4">Add some products to get started!</p>
              <Button 
                onClick={() => onOpenChange(false)}
                className="bg-purple-500 hover:bg-purple-600"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items - Scrollable */}
              <div className="flex-1 overflow-y-auto px-4">
                <div className="space-y-3 py-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-slate-800/50 rounded-lg p-3">
                      <div className="flex gap-3">
                        {/* Product Image */}
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
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm line-clamp-2 mb-1">
                            {item.name}
                          </h4>
                          {item.petType && (
                            <Badge variant="outline" className="text-xs mb-2 border-slate-600 text-slate-300">
                              {item.petType}
                            </Badge>
                          )}
                          
                          {/* Price and Quantity Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-purple-400 font-bold text-sm">
                              <IndianRupee className="h-4 w-4 mr-1" />
                              {(item.price * item.quantity).toFixed(2)}
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7 bg-slate-700 border-slate-600 hover:bg-slate-600"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-white text-sm w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7 bg-slate-700 border-slate-600 hover:bg-slate-600"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={item.quantity >= (item.stock || 99)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Stock Warning */}
                          {item.stock && item.quantity >= item.stock && (
                            <p className="text-yellow-400 text-xs mt-1">
                              Maximum stock reached
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer - Fixed at bottom */}
              <div className="flex-shrink-0 border-t border-slate-700 bg-slate-900">
                <div className="p-4 space-y-4">
                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-lg">Total:</span>
                    <div className="flex items-center text-white font-bold text-xl">
                      <IndianRupee className="h-5 w-5 mr-1" />
                      {cartTotal.toFixed(2)}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-purple-500 hover:bg-purple-600 h-12 text-base font-semibold"
                      onClick={handleCheckout}
                    >
                      Proceed to Checkout
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full bg-slate-800 border-slate-600 text-white hover:bg-slate-700 h-10"
                      onClick={handleClearCart}
                    >
                      Clear Cart
                    </Button>
                  </div>
                  
                  {/* Safe Area for mobile devices */}
                  <div className="h-2 sm:h-0" />
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;