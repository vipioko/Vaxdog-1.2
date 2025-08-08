import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  IndianRupee,
  MapPin,
  Phone,
  User,
  Package
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import useRazorpay from '@/hooks/useRazorpay';

const RAZORPAY_KEY_ID = 'rzp_test_2n6MS8hK3tgdba';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  postalCode: z.string().min(6, 'Postal code must be 6 digits').max(6),
  landmark: z.string().optional(),
  paymentMethod: z.enum(['razorpay', 'cod']),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { createOrder, isCreatingOrder } = useOrders();
  const { user } = useAuth();
  const isRazorpayLoaded = useRazorpay();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      phone: user?.phoneNumber || '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      landmark: '',
      paymentMethod: 'razorpay',
    },
  });

  const shippingFee = cartTotal >= 999 ? 0 : 50;
  const totalAmount = cartTotal + shippingFee;

  const handleBack = () => {
    navigate('/shop');
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!user) {
      toast.error('Please login to continue');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
        })),
        subtotal: cartTotal,
        shippingFee,
        total: totalAmount,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentMethod === 'cod' ? 'pending' : 'pending',
        orderStatus: 'confirmed' as const,
        shippingAddress: {
          fullName: data.fullName,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          landmark: data.landmark,
        },
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      };

      if (data.paymentMethod === 'razorpay') {
        await handleRazorpayPayment(orderData);
      } else {
        // Cash on Delivery
        await createOrder({
          ...orderData,
          paymentStatus: 'pending',
        });
        clearCart();
        toast.success('Order placed successfully! You can pay when the order is delivered.');
        navigate('/my-orders');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRazorpayPayment = async (orderData: any) => {
    if (!isRazorpayLoaded) {
      toast.error('Payment gateway is not ready. Please try again.');
      return;
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: (totalAmount * 100).toString(),
      currency: 'INR',
      name: 'VaxDog Shop',
      description: `Order for ${cartItems.length} items`,
      image: '/favicon.ico',
      handler: async function (response: any) {
        try {
          await createOrder({
            ...orderData,
            paymentStatus: 'paid',
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
          });
          clearCart();
          toast.success('Payment successful! Your order has been placed.');
          navigate('/my-orders');
        } catch (error) {
          console.error('Error saving order:', error);
          toast.error('Payment successful but failed to save order. Please contact support.');
        }
      },
      prefill: {
        name: orderData.shippingAddress.fullName,
        contact: orderData.shippingAddress.phone,
      },
      theme: {
        color: '#8b5cf6',
      },
      modal: {
        ondismiss: function() {
          setIsProcessing(false);
        },
      },
    };

    try {
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error opening Razorpay:', error);
      toast.error('Failed to open payment gateway. Please try again.');
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-slate-400 mb-6">Add some products to proceed with checkout</p>
          <Button onClick={() => navigate('/shop')} className="bg-purple-500 hover:bg-purple-600">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

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
        <h1 className="text-lg font-semibold">Checkout</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - Forms */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping Address */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <MapPin className="h-5 w-5 mr-2 text-purple-400" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Full Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="bg-slate-700 border-slate-600 text-white"
                                placeholder="Enter your full name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="bg-slate-700 border-slate-600 text-white"
                                placeholder="Enter phone number"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Address</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="House no, Building, Street, Area"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="landmark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Landmark (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="Near landmark"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">City</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="bg-slate-700 border-slate-600 text-white"
                                placeholder="City"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">State</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="bg-slate-700 border-slate-600 text-white"
                                placeholder="State"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Postal Code</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="bg-slate-700 border-slate-600 text-white"
                                placeholder="400001"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <CreditCard className="h-5 w-5 mr-2 text-purple-400" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-3"
                            >
                              <div className="flex items-center space-x-3 p-3 border border-slate-600 rounded-lg hover:border-purple-500 transition-colors">
                                <RadioGroupItem value="razorpay" id="razorpay" />
                                <Label htmlFor="razorpay" className="flex-1 cursor-pointer text-white">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <CreditCard className="h-5 w-5 mr-2 text-purple-400" />
                                      <div>
                                        <p className="font-medium">Pay Online</p>
                                        <p className="text-sm text-slate-400">Credit/Debit Card, UPI, Net Banking</p>
                                      </div>
                                    </div>
                                    <Badge className="bg-green-500/20 text-green-300">Recommended</Badge>
                                  </div>
                                </Label>
                              </div>
                              <div className="flex items-center space-x-3 p-3 border border-slate-600 rounded-lg hover:border-purple-500 transition-colors">
                                <RadioGroupItem value="cod" id="cod" />
                                <Label htmlFor="cod" className="flex-1 cursor-pointer text-white">
                                  <div className="flex items-center">
                                    <Truck className="h-5 w-5 mr-2 text-purple-400" />
                                    <div>
                                      <p className="font-medium">Cash on Delivery</p>
                                      <p className="text-sm text-slate-400">Pay when your order is delivered</p>
                                    </div>
                                  </div>
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <Card className="bg-slate-800/50 border-slate-700 sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-white">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Items */}
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                            {item.imageUrl ? (
                              <img 
                                src={item.imageUrl} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-slate-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium line-clamp-1">{item.name}</p>
                            <p className="text-slate-400 text-xs">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-white text-sm font-medium">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="bg-slate-600" />

                    {/* Pricing */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Subtotal</span>
                        <span className="text-white">₹{cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Shipping</span>
                        <span className="text-white">
                          {shippingFee === 0 ? 'Free' : `₹${shippingFee.toFixed(2)}`}
                        </span>
                      </div>
                      {cartTotal < 999 && (
                        <p className="text-xs text-slate-400">
                          Add ₹{(999 - cartTotal).toFixed(2)} more for free shipping
                        </p>
                      )}
                      <Separator className="bg-slate-600" />
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-white">Total</span>
                        <div className="flex items-center text-purple-400">
                          <IndianRupee className="h-5 w-5 mr-1" />
                          {totalAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Place Order Button */}
                    <Button 
                      type="submit"
                      className="w-full bg-purple-500 hover:bg-purple-600 h-12 text-base font-semibold"
                      disabled={isProcessing || isCreatingOrder}
                    >
                      {isProcessing || isCreatingOrder ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        `Place Order • ₹${totalAmount.toFixed(2)}`
                      )}
                    </Button>

                    <p className="text-xs text-slate-400 text-center">
                      By placing your order, you agree to our Terms & Conditions
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Checkout;